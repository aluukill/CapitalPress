export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.NEWSDATAHUB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server API key is not configured" });
  }

  const upstreamUrl = new URL("https://api.newsdatahub.com/v1/news");
  const query = req.query || {};

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => upstreamUrl.searchParams.append(key, String(v)));
      return;
    }
    if (value !== undefined && value !== null && value !== "") {
      upstreamUrl.searchParams.set(key, String(value));
    }
  });

  try {
    const upstreamRes = await fetch(upstreamUrl.toString(), {
      headers: {
        "X-Api-Key": apiKey,
        "User-Agent": "CapitalPress/1.0",
        Accept: "application/json",
      },
    });

    const bodyText = await upstreamRes.text();
    let body = null;

    try {
      body = JSON.parse(bodyText);
    } catch {
      body = { error: bodyText || "Upstream returned a non-JSON response" };
    }

    return res.status(upstreamRes.status).json(body);
  } catch (error) {
    return res.status(502).json({
      error: "Failed to reach upstream news service",
      details: error?.message || String(error),
    });
  }
}
