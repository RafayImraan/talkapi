const path = require("path");
const toolSchemas = require(path.join(__dirname, "..", "backend", "agent", "toolSchemas"));
const { TIER_1, TIER_2, TIER_3 } = toolSchemas;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  res.json({ tier_1: TIER_1, tier_2: TIER_2, tier_3: TIER_3 });
};
