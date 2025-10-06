// === CONFIG ===
const apiUrl = "/api/coords";              // Backend API to GET coords
const apiUpdateUrl = "/api/coords-update"; // Backend API to POST updates

let coords = [];

// === LOAD DATA ===
async function loadData() {
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    coords = await res.json();
    renderTable();
  } catch (err) {
    console.error("Error loading coords:", err);
    alert("⚠️ Failed to load coordinates data. Check console for details.");
  }
}

// === SAVE DATA ===
async function saveData() {
  try {
    const res = await fetch(apiUpdateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coords),
    });
    if (!res.ok) throw new Error(`Update failed: ${res.status}`);
    console.log("✅ Coordinates updated successfully");
  } catch (err) {
    console.error("Error saving data:", err);
    alert("⚠️ Failed to save data. Check console for details.");
  }
}

// === RENDER TABLE ===
function renderTable() {
  const tableBody = document.querySelector("#coords-table tbody");
  tableBody.innerHTML = "";

  coords.forEach((item, index) => {
    const row = document.createElement("tr");

    // LV (label)
    const lvCell = document.createElement("td");
    lvCell.textContent = item.lv || "";
    lvCell.contentEditable = true;
    lvCell.addEventListener("input", (e) => {
      coords[index].lv = e.target.textContent.trim();
    });
    row.appendChild(lvCell);

    // X coordinate
    const xCell = document.createElement("td");
    xCell.textContent = item.x || "";
    xCell.contentEditable = true;
    xCell.addEventListener("input", (e) => {
      coords[index].x = e.target.textContent.trim();
    });
    row.appendChild(xCell);

    // Y coordinate
    const yCell = document.createElement("td");
    yCell.textContent = item.y || "";
    yCell.contentEditable = true;
    yCell.addEventListener("input", (e) => {
      coords[index].y = e.target.textContent.trim();
    });
    row.appendChild(yCell);

    // Servers (array of 8 toggleable values)
    for (let i = 0; i < 8; i++) {
      const serverCell = document.createElement("td");
      const val = item.servers?.[i] || "";
      const btn = document.createElement("button");
      btn.textContent = val ? "🟢" : "⚪️";
      btn.className = "toggle-btn";
      btn.addEventListener("click", () => {
        coords[index].servers[i] = !coords[index].servers[i];
        btn.textContent = coords[index].servers[i] ? "🟢" : "⚪️";
        saveData(); // auto-save on toggle
      });
      serverCell.appendChild(btn);
      row.appendChild(serverCell);
    }

    // Delete button
    const delCell = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.className = "delete-btn";
    delBtn.addEventListener("click", () => {
      coords.splice(index, 1);
      saveData();
      renderTable();
    });
    delCell.appendChild(delBtn);
    row.appendChild(delCell);

    tableBody.appendChild(row);
  });
}

// === ADD NEW ENTRY ===
document.querySelector("#add-btn").addEventListener("click", () => {
  coords.push({ lv: "", x: "", y: "", servers: Array(8).fill(false) });
  renderTable();
});

// === SAVE BUTTON ===
document.querySelector("#save-btn").addEventListener("click", saveData);

// === INIT ===
window.addEventListener("load", loadData);
