require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { ALL_TOOLS, TIER_1, TIER_2, TIER_3 } = require("./agent/toolSchemas");
const executeTool = require("./agent/toolExecutor");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_BASE = "https://agents.assemblyai.com/v1";

// ─── SSE clients for streaming events to the frontend ────────────────────────
const sseClients = new Set();

function broadcastEvent(event) {
  for (const res of sseClients) {
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch {
      sseClients.delete(res);
    }
  }
}

// ─── Session history storage ─────────────────────────────────────────────────
const sessionHistory = [];

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// ─── SSE endpoint for frontend to receive real-time events ───────────────────
app.get("/api/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });
  res.write("\n");
  sseClients.add(res);
  req.on("close", () => sseClients.delete(res));
});

// ─── Session history endpoint ────────────────────────────────────────────────
app.get("/api/session-history", (_req, res) => {
  res.json(sessionHistory.slice(-50));
});

// ─── Mint a temporary token for the frontend to connect to AssemblyAI ────────
app.get("/api/voice-token", async (_req, res) => {
  if (!ASSEMBLYAI_API_KEY) {
    return res.status(500).json({ error: "ASSEMBLYAI_API_KEY not set" });
  }

  try {
    const url = new URL(`${ASSEMBLYAI_BASE}/token`);
    url.searchParams.set("expires_in_seconds", "300");
    url.searchParams.set("max_session_duration_seconds", "8640");

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${ASSEMBLYAI_API_KEY}` },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const { token } = await response.json();
    res.json({ token });
  } catch (err) {
    console.error("[Token] Error:", err.message);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// ─── Execute a tool call on behalf of the frontend ───────────────────────────
app.post("/api/execute-tool", async (req, res) => {
  const { name, arguments: args } = req.body;
  console.log(`[Tool] Executing: ${name}`, args);

  const result = await executeTool(name, args || {});
  console.log(`[Tool] Result for ${name}:`, result.success ? "OK" : "ERROR");

  // Save to session history
  sessionHistory.push({
    type: "tool_call",
    tool: name,
    arguments: args,
    result,
    timestamp: Date.now(),
  });

  // Broadcast tool execution to frontend SSE
  broadcastEvent({
    type: "tool_executed",
    tool: name,
    arguments: args,
    result,
    timestamp: Date.now(),
  });

  res.json(result);
});

// ─── Log event endpoint ──────────────────────────────────────────────────────
app.post("/api/log-event", (req, res) => {
  const event = req.body;
  sessionHistory.push({ ...event, timestamp: Date.now() });
  broadcastEvent(event);
  res.json({ ok: true });
});

// ─── Agent configuration for the Voice Agent API ─────────────────────────────
const AGENT_CONFIG = {
  system_prompt: `You are TalkAPI, a multilingual voice-controlled AI assistant with access to real-world APIs and a large knowledge base. You are highly knowledgeable and can answer questions about virtually any topic.

CRITICAL LANGUAGE RULE:
- ALWAYS respond in the SAME LANGUAGE the user speaks in.
- If the user speaks Urdu, respond in Urdu. If they speak Hindi, respond in Hindi. If they speak Spanish, respond in Spanish.
- If the user speaks English, respond in English.
- Detect the language from the user's FIRST message and stick with it for the entire conversation.
- The translate_text tool is ONLY for when the user explicitly asks to translate something to another language.

YOUR CAPABILITIES:
You have access to 12 tools AND broad general knowledge. Use tools for real-time data, use your knowledge for everything else.

TOOLS (use when relevant):
1. get_weather — Get current weather for any city (USE for weather questions)
2. search_github_repos — Search GitHub repos by keyword
3. get_github_repo_info — Get info about a specific GitHub repo (exact owner/repo only)
4. get_github_issues — Get issues from a GitHub repository
5. search_products — Search products in a store catalog
6. manage_cart — Add, remove, view, or clear shopping cart items
7. get_crypto_price — Get cryptocurrency prices in USD (USE for crypto questions)
8. get_exchange_rate — Get currency exchange rates (USE for currency conversion)
9. search_knowledge_base — Search Nimbus Cloud FAQ (USE for Nimbus Cloud questions)
10. get_news — Get latest news articles on any topic (USE for current events)
11. translate_text — Translate text between languages (ONLY when user asks to translate)
12. get_stock_price — Get current stock price (USE for stock questions)

GENERAL KNOWLEDGE (answer directly, no tool needed):
- Programming: Python, JavaScript, TypeScript, React, Node.js, Git, Docker, APIs, databases
- Technology: AI, machine learning, cloud computing, blockchain, cybersecurity
- Science: Physics, chemistry, biology, astronomy, mathematics
- History: World history, civilizations, wars, inventions
- Geography: Countries, capitals, currencies, cultures
- Mathematics: Algebra, calculus, statistics, formulas
- General: Definitions, how things work, explanations of concepts
- TalkAPI: You ARE TalkAPI — explain your own capabilities, tools, and tech stack

RULES:
- ALWAYS call the appropriate tool for real-time data (weather, prices, stocks, news, GitHub).
- For general knowledge questions, answer directly from your knowledge — no tool needed.
- When in doubt about real-time data, call the tool. A wasted tool call is fine.
- NEVER quote prices, weather data, exchange rates unless from a tool result.
- Keep responses concise and natural for voice. Lead with the answer.
- If you don't know something, say so honestly rather than guessing.
- Be conversational, friendly, and helpful. Remember what the user said earlier.`,
  greeting:
    "Hey! I'm TalkAPI, your voice-powered API assistant. I can check live weather, search GitHub repositories, track crypto and stock prices, convert currencies, get breaking news, translate between languages, search products, and answer questions about almost anything. Just speak naturally — I'll understand your language and respond in the same one. What would you like to know?",
  voice: { voice_id: "alba" },
  tools: TIER_1,
};

app.get("/api/agent-config", (_req, res) => {
  res.json(AGENT_CONFIG);
});

// Progressive tool reveal tiers
app.get("/api/tool-tiers", (_req, res) => {
  res.json({ tier_1: TIER_1, tier_2: TIER_2, tier_3: TIER_3 });
});

// ─── Stats endpoint ──────────────────────────────────────────────────────────
app.get("/api/stats", (_req, res) => {
  const toolCounts = {};
  for (const entry of sessionHistory) {
    if (entry.tool) {
      toolCounts[entry.tool] = (toolCounts[entry.tool] || 0) + 1;
    }
  }
  res.json({
    total_tool_calls: sessionHistory.filter((e) => e.type === "tool_call").length,
    tool_counts: toolCounts,
    total_events: sessionHistory.length,
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
// For Vercel serverless: export the Express app
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`TalkAPI backend running on port ${PORT}`);
    console.log(`Tools registered (${ALL_TOOLS.length}): ${ALL_TOOLS.map((t) => t.name).join(", ")}`);
    if (!ASSEMBLYAI_API_KEY) {
      console.warn("WARNING: ASSEMBLYAI_API_KEY is not set. Voice features will not work.");
    }
  });
}
