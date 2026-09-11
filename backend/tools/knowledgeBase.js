const fs = require("fs");
const path = require("path");

let knowledgeBase = null;

function loadKnowledgeBase() {
  if (knowledgeBase) return knowledgeBase;
  const filePath = path.join(__dirname, "..", "data", "knowledgeBase.json");
  knowledgeBase = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return knowledgeBase;
}

async function searchKnowledgeBase({ query }) {
  const entries = loadKnowledgeBase();
  const q = query.toLowerCase();

  // Score entries by keyword overlap
  const scored = entries
    .map((entry) => {
      const questionLower = entry.question.toLowerCase();
      const answerLower = entry.answer.toLowerCase();
      const combined = questionLower + " " + answerLower;

      // Count how many query words appear
      const words = q.split(/\s+/).filter((w) => w.length > 2);
      let score = 0;
      for (const word of words) {
        if (combined.includes(word)) score += 1;
        if (questionLower.includes(word)) score += 2;
      }
      return { ...entry, score };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length === 0) {
    return {
      success: true,
      data: { results: [], count: 0, query },
      spoken_summary: `No knowledge base entries found for "${query}". Try asking about pricing, features, support, or integrations.`,
    };
  }

  return {
    success: true,
    data: {
      results: scored.map((e) => ({
        question: e.question,
        answer: e.answer,
      })),
      count: scored.length,
      query,
    },
    spoken_summary: `I found ${scored.length} relevant entries: ${scored.map((e) => `Q: ${e.question} A: ${e.answer}`).join(" Next: ")}.`,
  };
}

module.exports = searchKnowledgeBase;
