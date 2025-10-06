export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = "marvinso1978"; // 👈 your GitHub username
  const repo = "coords-frontend"; // 👈 repo that contains coords.json
  const path = "coords.json"; // 👈 file path in repo

  if (!token) {
    return res.status(500).json({ error: "Missing GitHub token" });
  }

  try {
    // 1️⃣ Get the current file to retrieve SHA
    const getResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    const fileData = await getResp.json();

    const sha = fileData.sha; // GitHub requires this for updating existing files
    const newContent = Buffer.from(JSON.stringify(req.body, null, 2)).toString("base64");

    // 2️⃣ Commit the new content
    const updateResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: "Update coords.json via API",
        content: newContent,
        sha: sha,
      }),
    });

    if (!updateResp.ok) {
      const errorText = await updateResp.text();
      throw new Error(`GitHub update failed: ${errorText}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating coords.json:", err);
    return res.status(500).json({ error: err.message });
  }
}
