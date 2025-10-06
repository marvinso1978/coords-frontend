import fetch from "node-fetch";

export default async function handler(req,res){
  const token = process.env.GITHUB_TOKEN;
  const { coords, message } = req.body;

  // Get current SHA
  const getRes = await fetch(
    "https://api.github.com/repos/YOUR_USERNAME/coords-map/contents/coords.json",
    { headers: { Authorization: `token ${token}` } }
  );
  const getData = await getRes.json();
  const sha = getData.sha;

  // Update file
  const content = Buffer.from(JSON.stringify(coords,null,2)).toString("base64");
  await fetch(
    "https://api.github.com/repos/YOUR_USERNAME/coords-map/contents/coords.json",
    {
      method: "PUT",
      headers: { Authorization: `token ${token}`, "Content-Type":"application/json" },
      body: JSON.stringify({ message, content, sha, branch:"main" })
    }
  );
  res.status(200).json({ ok:true });
}
