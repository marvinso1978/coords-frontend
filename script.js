let coords = [];
const serverIds = [1018, 1012, 1011, 1016, 1002, 1003, 1004, 1014];
const apiUrl = "/api/coords";
const apiUpdateUrl = "/api/coords-update";

// === LOAD DATA ===
async function loadData() {
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    coords = await res.json();
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
      btn.addEventListener("click", async () => {
        coords[index].servers[i] = !coords[index].servers[i];
        btn.textContent = coords[index].servers[i] ? "🟢" : "⚪️";
        await saveData(); // refresh table after toggle
      });
      td.appendChild(btn);
      row.appendChild(td);
    }

    // Action (Delete)
    const tdAction = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", async () => {
      if (confirm("Delete this coordinate?")) {
        coords.splice(index, 1);
        renderTable();
        await saveData();
      }
    });
    tdAction.appendChild(delBtn);
    row.appendChild(tdAction);

    tbody.appendChild(row);
  });
}

// === SAVE DATA TO BACKEND ===
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
    } else {
      // Refresh table to reflect latest saved data
      await loadData();
    }
  } catch (err) {
    console.error("Error saving data:", err);
    alert("⚠️ Failed to save data. Check console for details.");
  }
}

// === ADD NEW COORDINATE ===
document.querySelector("#add-btn").addEventListener("click", async () => {
  const lv = prompt("Enter LV (required):");
  const x = prompt("Enter X coordinate (required):");
  const y = prompt("Enter Y coordinate (required):");

  if (!lv || !x || !y) {
    alert("LV, X, Y are required!");
    return;
  }

  // Check duplicates (LV + X + Y)
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

  renderTable();
  await saveData(); // ensure frontend reloads after adding
});

// === SAVE BUTTON (optional) ===
document.querySelector("#save-btn").addEventListener("click", saveData);

// === INITIAL LOAD ===
loadData();
