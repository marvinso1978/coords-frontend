export default async function handler(req, res) {
  try {
    // Replace with your own GitHub repo
    const owner = "marvinso1978";
    const repo = "coords-frontend";
    const path = "coords.json";

    // Get the raw file from GitHub
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`GitHub fetch failed: ${response.status}`);
    }

    const data = await response.json();

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(data);
  } catch (err) {
    console.error("Error loading coords.json:", err);
    res.status(500).json({ error: "Failed to load coords.json" });
  }
}
