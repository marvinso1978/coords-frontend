import fetch from "node-fetch";

export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  const response = await fetch(
    "https://api.github.com/repos/YOUR_USERNAME/coords-map/contents/coords.json",
    {
      headers: { Authorization: `token ${token}` },
    }
  );
  const data = await response.json();
  res.status(200).json(JSON.parse(Buffer.from(data.content, "base64").toString()));
}
