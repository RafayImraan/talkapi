import React from "react";
import AudioVisualizer from "./AudioVisualizer";

const STATUS_LABELS = {
  disconnected: "Disconnected",
  connecting: "Connecting...",
  listening: "Listening...",
  processing: "Thinking...",
  speaking: "Agent speaking...",
};

export default function VoiceControl({ status, onStart, onStop, micMuted, onToggleMic, analyser }) {
  const isActive = status !== "disconnected" && status !== "connecting";

  return (
    <div className="voice-control">
      <AudioVisualizer analyser={analyser} status={status} />

      <div className="mic-row">
        <button
          className={`mic-button ${isActive ? "active" : ""}`}
          onClick={isActive ? onStop : onStart}
          title={isActive ? "Stop session (Esc)" : "Start voice session (Space)"}
        >
          {isActive ? "⏹" : "🎙"}
        </button>

        {isActive && (
          <button
            className={`mic-toggle ${micMuted ? "muted" : ""}`}
            onClick={onToggleMic}
            title={micMuted ? "Unmute mic" : "Mute mic"}
          >
            {micMuted ? "🔇" : "🎤"}
          </button>
        )}
      </div>

      <span className={`status-badge ${status}`}>
        {micMuted && isActive ? "Mic Muted" : STATUS_LABELS[status] || status}
      </span>
    </div>
  );
}
