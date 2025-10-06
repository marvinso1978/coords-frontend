export default async function handler(req, res) {
  try {
    const owner = "marvinso1978";
    const repo = "coords-frontend";
    const path = "coords.json";

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`GitHub fetch failed: ${response.status}`);
    }

    const data = await response.json();

    // Decode base64 content
    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    const coords = JSON.parse(decoded);

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(coords);  // send the array directly
  } catch (err) {
    console.error("Error loading coords.json:", err);
    res.status(500).json({ error: "Failed to load coords.json" });
  }
}
