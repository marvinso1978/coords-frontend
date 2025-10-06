export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { coords, message } = req.body;

  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: "GITHUB_TOKEN not set" });
  }

  const owner = "marvinso1978";
  const repo = "coords-map";
  const path = "coords.json";
  const branch = "main";

  try {
    // Get current file to obtain SHA
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (!getRes.ok) {
      const text = await getRes.text();
      throw new Error(`Failed to get file: ${text}`);
    }

    const data = await getRes.json();
    const sha = data.sha;

    // Update the file
    const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(JSON.stringify(coords, null, 2)).toString("base64"),
        sha,
        branch
      })
    });

    if (!updateRes.ok) {
      const text = await updateRes.text();
      throw new Error(`Failed to update file: ${text}`);
    }

    res.status(200).json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
