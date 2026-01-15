// searchBarResults.js
(() => {
  const API_BASE = "http://localhost:4000";

  const resultsEl = document.getElementById("results");
  if (!resultsEl) {
    console.warn("[searchBarResults.js] Missing #results container.");
    return;
  }

  const queryInput = document.getElementById("query");   // optional
  const schoolEl = document.getElementById("school");    // optional

  function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      school: params.get("school") || schoolEl?.value || "Drexel",
      query: params.get("query") || queryInput?.value || "",
    };
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    }[m]));
  }

  function renderEmpty() {
    resultsEl.innerHTML = `<p>No dining halls found.</p>`;
  }

  function renderCards(items) {
    resultsEl.innerHTML = items.map((h) => `
      <div class="dining-option card" data-id="${escapeHtml(h.id)}">
        <h3>${escapeHtml(h.name)}</h3>
        <p>${escapeHtml(h.school)}${h.location ? " • " + escapeHtml(h.location) : ""}</p>
        <button class="view-btn" data-id="${escapeHtml(h.id)}">View</button>
      </div>
    `).join("");

    resultsEl.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        // Adjust page name if yours differs
        window.location.href = `diningHall.html?id=${encodeURIComponent(id)}`;
      });
    });
  }

  async function loadResults() {
    const { school, query } = getParams();
    const url = `${API_BASE}/dining-halls?school=${encodeURIComponent(school)}&query=${encodeURIComponent(query)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const json = await res.json();

    const items = json.data || [];
    if (items.length === 0) renderEmpty();
    else renderCards(items);
  }

  // Optional: if there is a search form on the results page
  const searchForm = document.getElementById("searchForm"); // optional
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const school = schoolEl?.value || "Drexel";
      const query = queryInput?.value || "";
      const params = new URLSearchParams({ school, query });
      window.location.search = params.toString();
    });
  }

  loadResults().catch((e) => {
    console.error(e);
    resultsEl.innerHTML = `<p>Failed to load results.</p>`;
  });
})();
