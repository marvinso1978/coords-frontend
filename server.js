// === CONFIG ===
const USER = "marvinso1978";
const REPO = "coords-frontend"; // e.g., coords-map
const FILE_PATH = "coords.json";
const BRANCH = "main";
const TOKEN = "YOUR_GITHUB_TOKEN"; // We'll handle this securely below

const apiUrl = `https://api.github.com/repos/${USER}/${REPO}/contents/${FILE_PATH}`;
let coords = [];

// === LOAD COORDS FROM GITHUB ===
async function loadData() {
  const res = await fetch(apiUrl);
  const data = await res.json();
  const content = atob(data.content);
  coords = JSON.parse(content);
  renderTable();
}

// === SAVE COORDS TO GITHUB ===
async function saveData(message = "Update coordinates") {
  const getRes = await fetch(apiUrl);
  const getData = await getRes.json();
  const sha = getData.sha;

  const newContent = btoa(JSON.stringify(coords, null, 2));

  await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: newContent,
      sha,
      branch: BRANCH,
    }),
  });
}

// === RENDER TABLE ===
function renderTable() {
  const tbody = document.querySelector("#coordsTable tbody");
  tbody.innerHTML = "";
  coords.forEach((c, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.lv}</td>
      <td>${c.x}</td>
      <td>${c.y}</td>
      ${c.servers.map((s, i) => `<td class="server-${s}" onclick="toggleServer(${index},${i})">${s ? "✔️" : ""}</td>`).join("")}
      <td><button onclick="deleteCoord(${index})">❌</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// === ADD NEW COORD ===
document.getElementById("coordForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const lv = parseInt(document.getElementById("lv").value);
  const x = parseInt(document.getElementById("x").value);
  const y = parseInt(document.getElementById("y").value);

  // prevent duplicates
  if (coords.some(c => c.lv === lv && c.x === x && c.y === y)) {
    alert("Duplicate coordinate!");
    return;
  }

  coords.push({ lv, x, y, servers: Array(8).fill(false) });
  await saveData("Add coordinate");
  await loadData();
});

// === TOGGLE SERVER ===
async function toggleServer(index, serverIndex) {
  coords[index].servers[serverIndex] = !coords[index].servers[serverIndex];
  await saveData("Toggle server");
  renderTable();
}

// === DELETE COORD ===
async function deleteCoord(index) {
  coords.splice(index, 1);
  await saveData("Delete coordinate");
  renderTable();
}

// === INIT ===
loadData();
