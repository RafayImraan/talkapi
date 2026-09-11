const path = require("path");

let toolSchemas;
try {
  toolSchemas = require(path.join(__dirname, "..", "backend", "agent", "toolSchemas"));
} catch (e) {
  toolSchemas = { ALL_TOOLS: [], TIER_1: [], TIER_2: [], TIER_3: [] };
}

const { ALL_TOOLS, TIER_1, TIER_2, TIER_3 } = toolSchemas;

const SYSTEM_PROMPT = `You are TalkAPI, a multilingual voice-controlled AI assistant with access to real-world APIs and a large knowledge base. You are highly knowledgeable and can answer questions about virtually any topic.

CORE RULES:
1. ALWAYS respond in the SAME LANGUAGE the user speaks in.
2. When a user asks about ANY topic, use the knowledgeBase tool to search for information.
3. If no knowledge base result is found, answer from your general knowledge.
4. Keep answers SHORT (2-3 sentences) for voice delivery.
5. Only call tools that are actually available in the current tier.

AVAILABLE TOOLS:
- TIER 1 (Always): weather, knowledgeBase
- TIER 2 (After 3 uses): crypto, forex, stock
- TIER 3 (After 6 uses): news, github, translate, shopping

When users ask about:
- Programming → Search knowledgeBase first, then explain from general knowledge
- Science/Geography/History → Search knowledgeBase first
- Current events → Use news tool
- Code repositories → Use github tool
- Prices/Markets → Use crypto, forex, or stock tool
- Weather → Use weather tool
- Products → Use shopping tool
- Translation → Use translate tool`;

let sessionHistory = [];
let toolCounts = {};

function logEvent(event) {
  sessionHistory.push({ ...event, timestamp: Date.now() });
  if (sessionHistory.length > 200) sessionHistory = sessionHistory.slice(-200);
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (path === "/api/agent-config" || path === "/api/tool-tiers") {
    return res.json({
      systemPrompt: SYSTEM_PROMPT,
      tools: ALL_TOOLS,
      tier_1: TIER_1,
      tier_2: TIER_2,
      tier_3: TIER_3,
    });
  }

  if (path === "/api/session-history") {
    return res.json(sessionHistory.slice(-50));
  }

  if (path === "/api/stats") {
    const counts = {};
    for (const e of sessionHistory) {
      if (e.type === "tool_call") {
        counts[e.tool] = (counts[e.tool] || 0) + 1;
      }
    }
    return res.json({
      total_tool_calls: sessionHistory.filter((e) => e.type === "tool_call").length,
      tool_counts: counts,
      total_events: sessionHistory.length,
    });
  }

  if (path === "/api/log-event" && req.method === "POST") {
    logEvent(req.body);
    return res.json({ ok: true });
  }

  res.status(404).json({ error: "Not found" });
};
