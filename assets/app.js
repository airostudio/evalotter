const state = {
  tests: [],
  query: "",
  category: "All",
};

const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const count = document.getElementById("count");
const search = document.getElementById("search");
const filters = document.getElementById("category-filters");

function render() {
  const q = state.query.trim().toLowerCase();

  const filtered = state.tests.filter((t) => {
    const matchesCategory = state.category === "All" || t.category === state.category;
    const matchesQuery =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  grid.innerHTML = filtered
    .map(
      (t) => `
      <article class="card">
        <div class="card-top">
          <span class="card-dot" style="background:${escapeAttr(t.color || "#6366f1")}"></span>
          <span class="card-category">${escapeHtml(t.category || "General")}</span>
        </div>
        <h3 class="card-name">${escapeHtml(t.name)}</h3>
        <p class="card-desc">${escapeHtml(t.description || "")}</p>
      </article>`
    )
    .join("");

  empty.hidden = filtered.length !== 0;
  count.textContent = `${filtered.length} test${filtered.length === 1 ? "" : "s"}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}

function renderFilters() {
  const categories = ["All", ...new Set(state.tests.map((t) => t.category || "General"))];

  filters.innerHTML = categories
    .map(
      (c) =>
        `<button class="filter-btn${c === state.category ? " active" : ""}" data-category="${escapeAttr(c)}">${escapeHtml(c)}</button>`
    )
    .join("");

  filters.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.category;
      renderFilters();
      render();
    });
  });
}

search.addEventListener("input", (e) => {
  state.query = e.target.value;
  render();
});

async function init() {
  try {
    const res = await fetch("data/tests.json", { cache: "no-store" });
    state.tests = await res.json();
  } catch (err) {
    grid.innerHTML = `<p class="empty">Could not load tests.json — ${escapeHtml(err.message)}</p>`;
    return;
  }
  renderFilters();
  render();
}

init();
