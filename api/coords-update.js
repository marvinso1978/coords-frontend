import { Octokit } from "octokit";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { GITHUB_TOKEN } = process.env;
  const owner = "marvinso1978";
  const repo = "coords-frontend";
  const path = "coords.json";

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: "Missing GitHub token" });
  }
  console.log("Incoming data:", req.body);
  console.log("GITHUB_TOKEN exists:", !!process.env.GITHUB_TOKEN);
  try {
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    // 1. Get current file to obtain SHA
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    const sha = fileData.sha;

    // 2. Update file with new data
    const newContent = JSON.stringify(req.body, null, 2);
    const message = `Update coords.json - ${new Date().toISOString()}`;

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(newContent).toString("base64"),
      sha,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating coords.json:", err);
    res.status(500).json({ error: err.message });
  }
}
