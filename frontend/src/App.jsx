import React, { useState, useEffect, useRef, useCallback } from "react";
import VoiceControl from "./components/VoiceControl";
import ConversationLog from "./components/ConversationLog";
import LiveTranscription from "./components/LiveTranscription";
import DemoScenarios from "./components/DemoScenarios";
import ThemeToggle from "./components/ThemeToggle";
import SessionHistory from "./components/SessionHistory";
import "./App.css";

export default function App() {
  const [status, setStatus] = useState("disconnected");
  const [events, setEvents] = useState([]);
  const [micMuted, setMicMuted] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [liveText, setLiveText] = useState("");
  const [sessionStats, setSessionStats] = useState({ calls: 0, tools: {} });
  const [showHistory, setShowHistory] = useState(false);
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const playbackTimeRef = useRef(0);
  const micMutedRef = useRef(false);
  const analyserRef = useRef(null);
  const toolTierRef = useRef(1);
  const toolCallCountRef = useRef(0);

  const toggleMic = useCallback(() => {
    setMicMuted((prev) => {
      micMutedRef.current = !prev;
      return !prev;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const addEvent = useCallback((event) => {
    setEvents((prev) => [
      ...prev.slice(-300),
      { ...event, id: Date.now() + Math.random() },
    ]);
    if (event.type === "tool_call") {
      setSessionStats((prev) => ({
        calls: prev.calls + 1,
        tools: { ...prev.tools, [event.name]: (prev.tools[event.name] || 0) + 1 },
      }));
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        if (status === "disconnected") {
          startSession();
        } else {
          toggleMic();
        }
      }
      if (e.code === "Escape" && status !== "disconnected") {
        stopSession();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, toggleMic]);

  const startSession = useCallback(async () => {
    setStatus("connecting");
    setEvents([]);
    setSessionStats({ calls: 0, tools: {} });
    setLiveText("");

    try {
      const tokenRes = await fetch("/api/voice-token");
      const tokenData = await tokenRes.json();
      if (tokenData.error) {
        addEvent({ type: "error", message: tokenData.error });
        setStatus("disconnected");
        return;
      }
      const { token } = tokenData;

      const agentRes = await fetch("/api/agent-config");
      const agentConfig = await agentRes.json();

      const wsUrl = new URL("wss://agents.assemblyai.com/v1/ws");
      wsUrl.searchParams.set("token", token);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      playbackTimeRef.current = 0;

      const inputRate = audioCtx.sampleRate;
      await audioCtx.audioWorklet.addModule(
        "data:text/javascript," + encodeURIComponent(`
          class PCMProcessor extends AudioWorkletProcessor {
            constructor() {
              super();
              this.inputRate = ${inputRate};
              this.targetRate = 24000;
              this.ratio = this.inputRate / this.targetRate;
            }
            process(inputs) {
              const input = inputs[0]?.[0];
              if (!input) return true;
              const outLength = Math.floor(input.length / this.ratio);
              const pcm16 = new Int16Array(outLength);
              for (let i = 0; i < outLength; i++) {
                const sample = input[Math.floor(i * this.ratio)] ?? 0;
                pcm16[i] = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
              }
              this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
              return true;
            }
          }
          registerProcessor("pcm-processor", PCMProcessor);
        `)
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false },
      });

      // Set up analyser for audio visualization
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const micSource = audioCtx.createMediaStreamSource(stream);
      micSource.connect(analyser);
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(audioCtx, "pcm-processor");
      let ready = false;

      worklet.port.onmessage = (e) => {
        if (ready && !micMutedRef.current && ws.readyState === WebSocket.OPEN) {
          const bytes = new Uint8Array(e.data);
          let b64 = "";
          for (let i = 0; i < bytes.length; i++) {
            b64 += String.fromCharCode(bytes[i]);
          }
          ws.send(JSON.stringify({ type: "input.audio", audio: btoa(b64) }));
        }
      };
      source.connect(worklet);

      ws.addEventListener("open", () => {
        addEvent({ type: "system", text: "Connected to AssemblyAI..." });
        ws.send(
          JSON.stringify({
            type: "session.update",
            session: {
              system_prompt: agentConfig.system_prompt,
              greeting: agentConfig.greeting,
              tools: agentConfig.tools,
              output: agentConfig.voice,
            },
          })
        );
      });

      let lastEvent = null;
      let pendingTools = [];

      const flushToolResults = async () => {
        if (lastEvent !== "reply.done" || pendingTools.length === 0) return;
        for (const tool of pendingTools) {
          ws.send(
            JSON.stringify({
              type: "tool.result",
              call_id: tool.call_id,
              result: JSON.stringify(tool.result),
            })
          );
        }
        pendingTools = [];
      };

      ws.addEventListener("message", async (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case "session.ready":
            ready = true;
            setStatus("listening");
            addEvent({ type: "system", text: "Session ready — start speaking!" });
            break;

          case "input.speech.started":
            lastEvent = "input.speech.started";
            setStatus("listening");
            break;

          case "input.speech.stopped":
            setStatus("processing");
            break;

          case "transcript.user.delta":
            setLiveText(msg.text);
            break;

          case "transcript.user":
            setLiveText("");
            addEvent({ type: "user_speech", text: msg.text });
            break;

          case "reply.started":
            lastEvent = "reply.started";
            setStatus("speaking");
            break;

          case "reply.audio": {
            const raw = atob(msg.data);
            const pcm16 = new Int16Array(raw.length / 2);
            for (let i = 0; i < pcm16.length; i++) {
              pcm16[i] = raw.charCodeAt(i * 2) | (raw.charCodeAt(i * 2 + 1) << 8);
            }
            const float32 = new Float32Array(pcm16.length);
            for (let i = 0; i < pcm16.length; i++) {
              float32[i] = pcm16[i] / 32768;
            }
            const buffer = audioCtx.createBuffer(1, float32.length, 24000);
            buffer.getChannelData(0).set(float32);
            const src = audioCtx.createBufferSource();
            src.buffer = buffer;
            src.connect(audioCtx.destination);
            const now = audioCtx.currentTime;
            playbackTimeRef.current = Math.max(playbackTimeRef.current, now);
            src.start(playbackTimeRef.current);
            playbackTimeRef.current += buffer.duration;
            break;
          }

          case "transcript.agent":
            addEvent({ type: "agent_speech", text: msg.text });
            break;

          case "reply.done":
            lastEvent = "reply.done";
            if (msg.status === "interrupted") {
              pendingTools = [];
              playbackTimeRef.current = audioCtx.currentTime;
            }
            setStatus("listening");
            await flushToolResults();
            break;

          case "tool.call": {
            addEvent({
              type: "tool_call",
              call_id: msg.call_id,
              name: msg.name,
              arguments: msg.arguments,
            });

            try {
              const res = await fetch("/api/execute-tool", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: msg.name, arguments: msg.arguments }),
              });
              const result = await res.json();
              pendingTools.push({ call_id: msg.call_id, result });
              addEvent({ type: "tool_result", call_id: msg.call_id, name: msg.name, result });
              await flushToolResults();

              // Progressive tool reveal: unlock more tools after successful calls
              toolCallCountRef.current++;
              const tiersRes = await fetch("/api/tool-tiers");
              const tiers = await tiersRes.json();

              if (toolCallCountRef.current === 1 && toolTierRef.current === 1) {
                toolTierRef.current = 2;
                ws.send(JSON.stringify({ type: "session.update", session: { tools: tiers.tier_2 } }));
                addEvent({ type: "system", text: "More tools unlocked: stock prices, translation, detailed GitHub info" });
              } else if (toolCallCountRef.current >= 3 && toolTierRef.current === 2) {
                toolTierRef.current = 3;
                ws.send(JSON.stringify({ type: "session.update", session: { tools: tiers.tier_3 } }));
                addEvent({ type: "system", text: "All tools unlocked: shopping cart, product search" });
              }
            } catch (err) {
              const errResult = {
                success: false,
                error: err.message,
                spoken_summary: `Sorry, I couldn't complete that request. ${err.message}. Please try again or ask something else.`,
              };
              pendingTools.push({ call_id: msg.call_id, result: errResult });
              addEvent({ type: "tool_result", call_id: msg.call_id, name: msg.name, result: errResult });
              await flushToolResults();
            }
            break;
          }

          case "session.ended":
            setStatus("disconnected");
            addEvent({ type: "system", text: "Session ended" });
            break;

          case "session.error":
            addEvent({ type: "error", message: msg.message || msg.code || "Unknown error" });
            setStatus("disconnected");
            break;
        }
      });

      ws.addEventListener("close", (e) => {
        setStatus("disconnected");
        ready = false;
        stream.getTracks().forEach((t) => t.stop());
        audioCtx.close();
        analyserRef.current = null;
        addEvent({ type: "system", text: `Connection closed (code: ${e.code})` });
      });

      ws.addEventListener("error", () => {
        addEvent({ type: "error", message: "WebSocket connection failed" });
        setStatus("disconnected");
      });
    } catch (err) {
      console.error("Session start failed:", err);
      addEvent({ type: "error", message: err.message });
      setStatus("disconnected");
    }
  }, [addEvent]);

  const stopSession = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "session.end" }));
    }
    setStatus("disconnected");
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "session.end" }));
      }
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div>
            <h1>TalkAPI</h1>
            <p className="tagline">Control any API, just by talking</p>
          </div>
          <div className="header-actions">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button
              className="history-btn"
              onClick={() => setShowHistory(!showHistory)}
              title="Session History"
            >
              📊
            </button>
          </div>
        </div>
        {sessionStats.calls > 0 && (
          <div className="stats-bar">
            {sessionStats.calls} tool call{sessionStats.calls !== 1 ? "s" : ""} this session
          </div>
        )}
      </header>

      <main className="app-main">
        <VoiceControl
          status={status}
          onStart={startSession}
          onStop={stopSession}
          micMuted={micMuted}
          onToggleMic={toggleMic}
          analyser={analyserRef.current}
        />

        {status === "listening" && liveText && (
          <LiveTranscription text={liveText} />
        )}

        {status === "disconnected" && events.length === 0 && (
          <DemoScenarios onStart={startSession} />
        )}

        <ConversationLog events={events} />

        {showHistory && <SessionHistory onClose={() => setShowHistory(false)} />}
      </main>

      <footer className="app-footer">
        <span>Space: mic toggle</span>
        <span>Esc: end session</span>
      </footer>
    </div>
  );
}
