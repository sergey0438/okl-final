module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }));
    return;
  }

  try {
    const rawBody = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { messages, system } = rawBody;

    if (!Array.isArray(messages) || !messages.length) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "messages must be a non-empty array" }));
      return;
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        max_tokens: 700,
        system: typeof system === "string" ? system : "",
        messages
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      res.statusCode = upstream.status;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({
        error: data && data.error && data.error.message ? data.error.message : "Anthropic request failed"
      }));
      return;
    }

    const reply = data && data.content && data.content[0] && data.content[0].text;
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ reply: reply || "" }));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
