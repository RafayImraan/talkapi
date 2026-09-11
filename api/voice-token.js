module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const API_KEY = process.env.ASSEMBLYAI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "ASSEMBLYAI_API_KEY not set" });

  try {
    const url = new URL("https://agents.assemblyai.com/v1/token");
    url.searchParams.set("expires_in_seconds", "300");
    url.searchParams.set("max_session_duration_seconds", "8640");

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: await response.text() });
    }

    const { token } = await response.json();
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate token" });
  }
};
