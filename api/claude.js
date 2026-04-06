export default async function handler(req, res) {
  console.log("1. Handler called, method:", req.method);
  console.log("2. API key exists:", !!process.env.ANTHROPIC_API_KEY);
  console.log("3. Body type:", typeof req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
    if (!body) return res.status(400).json({ error: "Empty body" });

    console.log("4. Calling Anthropic...");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05"
      },
      body: JSON.stringify(body)
    });

    console.log("5. Anthropic status:", response.status);

    const text = await response.text();
    console.log("6. Raw response:", text.slice(0, 200));

    const data = JSON.parse(text);
    res.status(200).json(data);

  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
}