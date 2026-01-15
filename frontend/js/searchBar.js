// searchBar.js
(() => {
  const API_BASE = "http://localhost:4000";

  const input = document.getElementById("query");
  const list = document.getElementById("list");
  const schoolEl = document.getElementById("school"); // optional

  if (!input || !list) {
    console.warn("[searchBar.js] Missing #query or #list in the DOM.");
    return;
  }

  let abortController = null;

  function getSchool() {
    const val = schoolEl?.value?.trim();
    return val && val.length > 0 ? val : "Drexel";
  }

  function showList() {
    list.classList.add("show");
  }

  function hideList() {
    list.classList.remove("show");
  }

  function clearList() {
    list.innerHTML = "";
  }

  function renderSuggestions(items) {
    clearList();

    if (!items || items.length === 0) {
      hideList();
      return;
    }

    // Use your existing CSS class name: ".colleges"
    items.slice(0, 8).forEach((hall) => {
      const el = document.createElement("li");
      el.className = "colleges";
      el.textContent = `${hall.name}${hall.location ? " — " + hall.location : ""}`;
      el.tabIndex = 0;

      el.addEventListener("mousedown", () => {
        // mousedown fires before blur (prevents dropdown from disappearing before click)
        input.value = hall.name;
        hideList();

        // Navigate to results page (adjust path if yours differs)
        const params = new URLSearchParams({
          school: hall.school || getSchool(),
          query: hall.name,
        });
        window.location.href = `searchBarResults.html?${params.toString()}`;
      });

      list.appendChild(el);
    });

    showList();
  }

  async function fetchSuggestions(query) {
    if (abortController) abortController.abort();
    abortController = new AbortController();

    const school = encodeURIComponent(getSchool());
    const q = encodeURIComponent(query);

    const res = await fetch(`${API_BASE}/dining-halls?school=${school}&query=${q}`, {
      signal: abortController.signal,
    });
    if (!res.ok) throw new Error(`Failed suggestions: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  }

  let debounceTimer = null;

  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (q.length === 0) {
      clearList();
      hideList();
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const data = await fetchSuggestions(q);
        renderSuggestions(data);
      } catch (e) {
        // Ignore abort errors; log others
        if (String(e).includes("AbortError")) return;
        console.error(e);
        hideList();
      }
    }, 200);
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!list.contains(target) && target !== input) hideList();
  });

  input.addEventListener("focus", () => {
    // if list already has items, show
    if (list.children.length > 0) showList();
  });
})();
