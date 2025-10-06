let coords = [];
const serverIds = [1018, 1012, 1011, 1016, 1002, 1003, 1004, 1014];
const apiUrl = "/api/coords";
const apiUpdateUrl = "/api/coords-update";

// === LOAD DATA ===
async function loadData() {
  try {
    const res = await fetch(`${apiUrl}?t=${Date.now()}`, { cache: "no-store" });
    coords = await res.json();
    renderTable();
  } catch (err) {
    console.error("Error loading coords:", err);
  }
}

// === REFRESH BUTTON ===
document.querySelector("#refresh-btn").addEventListener("click", loadData);

// === SERVER DROPDOWN FILTER ===
document.querySelectorAll(".server-filter").forEach(sel => {
  sel.addEventListener("change", () => renderTable());
});

// === TEXT FILTERS ===
["filter-lv","filter-x","filter-y"].forEach(id => {
  document.getElementById(id).addEventListener("input", renderTable);
});

// === RENDER TABLE ===
function renderTable() {
  const tbody = document.querySelector("#coords-table tbody");
  tbody.innerHTML = "";

  const filterLv = document.getElementById("filter-lv").value.trim();
  const filterX = document.getElementById("filter-x").value.trim();
  const filterY = document.getElementById("filter-y").value.trim();

  const serverFilters = Array.from(document.querySelectorAll(".server-filter"))
    .map(sel => sel.value);

  coords.forEach((item, index) => {
    if (filterLv && item.lv != filterLv) return;
    if (filterX && item.x != filterX) return;
    if (filterY && item.y != filterY) return;

    // Server filter
    let hide = false;
    for (let i = 0; i < serverFilters.length; i++) {
      if (serverFilters[i] !== "" && item.servers[i].toString() !== serverFilters[i]) {
        hide = true;
        break;
      }
    }
    if (hide) return;

    const row = document.createElement("tr");

    // LV, X, Y
    ["lv","x","y"].forEach(k=>{
      const td = document.createElement("td");
      td.textContent = item[k];
      row.appendChild(td);
    });

    // Servers
    for (let i = 0; i < serverIds.length; i++) {
      const td = document.createElement("td");
      const btn = document.createElement("button");
      btn.className = "toggle-btn";
      btn.textContent = item.servers[i] ? "🟢" : "⚪️";
      btn.addEventListener("click", ()=>{
        coords[index].servers[i] = !coords[index].servers[i];
        btn.textContent = coords[index].servers[i] ? "🟢" : "⚪️";
        saveData();
      });
      td.appendChild(btn);
      row.appendChild(td);
    }

    // Delete
    const tdAction = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", ()=>{
      if(confirm("Delete this coordinate?")) {
        coords.splice(index,1);
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
    const res = await fetch(apiUpdateUrl,{
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(coords)
    });
    const data = await res.json();
    if(!data.success) console.error("Failed to save data:", data.error);
    else setTimeout(loadData,2000); // reload after 2s
  } catch(err) {
    console.error("Error saving data:",err);
  }
}

// === INLINE ADD ROW ===
document.querySelectorAll("#add-row .server-toggle").forEach(btn=>{
  btn.addEventListener("click",()=>{
    btn.dataset.value = btn.dataset.value==="true"?"false":"true";
    btn.textContent = btn.dataset.value==="true"?"🟢":"⚪️";
  });
});

document.querySelector("#add-inline-btn").addEventListener("click", ()=>{
  const lv = document.querySelector("#new-lv").
