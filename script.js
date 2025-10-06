// === CONFIG ===
const apiUrl = "https://raw.githubusercontent.com/marvinso1978/coords-frontend/main/coords.json";        // GET coordinates
const apiUpdateUrl = "/api/coords-update"; // POST updates

let coords = [];
const serversList = [1018,1012,1011,1016,1002,1003,1004,1014];

// === LOAD DATA ===
async function loadData() {
  try {
    const res = await fetch(apiUrl);
    coords = await res.json();
    renderTable();
  } catch (err) {
    console.error("Error loading coords:", err);
  }
}

// === RENDER TABLE ===
function renderTable() {
  const tbody = document.querySelector("#coordsTable tbody");
  tbody.innerHTML = "";

  // Filters
  const fLv = document.getElementById("filterLv").value.trim();
  const fX  = document.getElementById("filterX").value.trim();
  const fY  = document.getElementById("filterY").value.trim();

  coords.forEach((c, index) => {
    if ((fLv && c.lv != fLv) || (fX && c.x != fX) || (fY && c.y != fY)) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.lv}</td>
      <td>${c.x}</td>
      <td>${c.y}</td>
      ${c.servers.map((s,i) => `
        <td class="server-${s}" 
            style="cursor:pointer;${s ? 'background:#b2fab4' : 'background:#fbcaca'}"
            onclick="toggleServer(${index},${i})">
          ${s ? "✔️" : ""}
        </td>`).join("")}
      <td><button onclick="deleteCoord(${index})">❌</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// === ADD COORDINATE ===
document.getElementById("coordForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const lv = parseInt(document.getElementById("lv").value);
  const x  = parseInt(document.getElementById("x").value);
  const y  = parseInt(document.getElementById("y").value);

  if (coords.some(c => c.lv === lv && c.x === x && c.y === y)) {
    alert("Duplicate LV + X + Y!");
    return;
  }

  coords.push({ lv, x, y, servers: Array(8).fill(false) });
  await updateGitHub("Add coordinate");
});

// === TOGGLE SERVER ===
window.toggleServer = async (index, serverIndex) => {
  coords[index].servers[serverIndex] = !coords[index].servers[serverIndex];
  await updateGitHub("Toggle server");
};

// === DELETE COORDINATE ===
window.deleteCoord = async (index) => {
  coords.splice(index,1);
  await updateGitHub("Delete coordinate");
};

// === FILTER INPUT EVENTS ===
["filterLv","filterX","filterY"].forEach(id=>{
  document.getElementById(id).addEventListener("input", renderTable);
});

// === UPDATE GITHUB ===
async function updateGitHub(message) {
  try {
    await fetch(apiUpdateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coords, message })
    });
    renderTable();
  } catch(err) {
    console.error("Error updating coords:", err);
  }
}

// === INIT ===
loadData();
