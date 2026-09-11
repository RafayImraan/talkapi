const path = require("path");
const executeTool = require(path.join(__dirname, "..", "backend", "agent", "toolExecutor"));

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, arguments: args } = req.body;
    console.log(`[Tool] Executing: ${name}`, args);
    const result = await executeTool(name, args || {});
    console.log(`[Tool] Result for ${name}:`, result.success ? "OK" : "ERROR");
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
