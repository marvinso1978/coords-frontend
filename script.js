let coords = [];
const serverIds = [1018, 1012, 1011, 1016, 1002, 1003, 1004, 1014];
const apiUrl = "/api/coords";
const apiUpdateUrl = "/api/coords-update";

// === LOAD DATA ===
async function loadData() {
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    const data = await res.json();
    coords = data;
    renderTable();
  } catch (err) {
    console.error("Error loading coords:", err);
  }
}

// === RENDER TABLE ===
function renderTable() {
  const tbody = document.querySelector("#coords-table tbody");
  tbody.innerHTML = "";

  coords.forEach((item, index) => {
    const row = document.createElement("tr");

    // LV, X, Y
    ["lv", "x", "y"].forEach(key => {
      const td = document.createElement("td");
      td.textContent = item[key];
      row.appendChild(td);
    });

    // Servers
    for (let i = 0; i < serverIds.length; i++) {
      const td = document.createElement("td");
      const btn = document.createElement("button");
      btn.className = "toggle-btn";
      btn.textContent = item.servers[i] ? "🟢" : "⚪️";
      btn.addEventListener("click", () => {
        coords[index].servers[i] = !coords[index].servers[i];
        btn.textContent = coords[index].servers[i] ? "🟢" : "⚪️";
        saveData(); // frontend updated immediately
      });
      td.appendChild(btn);
      row.appendChild(td);
    }

    // Delete button
    const tdAction = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      if (confirm("Delete this coordinate?")) {
        coords.splice(index, 1);
        renderTable();
        saveData();
      }
    });
    tdAction.appendChild(delBtn);
    row.appendChild(tdAction);

    tbody.appendChild(row);
  });
}

// === SAVE DATA ===
async function saveData() {
  try {
    const res = await fetch(apiUpdateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coords),
    });
    const data = await res.json();
    if (!data.success) {
      console.error("Failed to save data:", data.error);
      alert("⚠️ Failed to save data. Check console for details.");
    }
    // Do NOT reload from backend immediately — avoids GitHub caching delay
  } catch (err) {
    console.error("Error saving data:", err);
    alert("⚠️ Failed to save data. Check console for details.");
  }
}

// === INLINE ADD ROW ===
document.querySelector("#add-inline-btn").addEventListener("click", () => {
  const lv = document.querySelector("#new-lv").value.trim();
  const x = document.querySelector("#new-x").value.trim();
  const y = document.querySelector("#new-y").value.trim();

  if (!lv || !x || !y) {
    alert("LV, X, Y are required!");
    return;
  }

  // Check duplicates
  const exists = coords.some(c => c.lv === lv && c.x == x && c.y == y);
  if (exists) {
    alert("Coordinate with same LV, X, Y already exists!");
    return;
  }

  coords.push({
    lv,
    x,
    y,
    servers: Array(serverIds.length).fill(false),
  });

  // Clear inputs
  document.querySelector("#new-lv").value = "";
  document.querySelector("#new-x").value = "";
  document.querySelector("#new-y").value = "";

  renderTable();
  saveData();
});

// === OPTIONAL: PERIODIC REFRESH ===
setInterval(loadData, 15000); // every 15s, refresh from backend to catch GitHub updates

// === INITIAL LOAD ===
loadData();
