// commenting.js
(() => {
  const API_BASE = "http://localhost:4000";

  const commentEl = document.getElementById("comment");
  const ratingEl = document.getElementById("ratingValue"); // hidden input set by rating.js
  const listEl = document.getElementById("comment-list");  // where we render reviews
  const form = document.getElementById("reviewForm");      // optional

  function getDiningHallId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function getToken() {
    return localStorage.getItem("token");
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    }[m]));
  }

  async function fetchReviews() {
    const hallId = getDiningHallId();
    if (!hallId || !listEl) return;

    const res = await fetch(`${API_BASE}/dining-halls/${encodeURIComponent(hallId)}/reviews?page=1&limit=20`);
    if (!res.ok) throw new Error(`Fetch reviews failed: ${res.status}`);
    const json = await res.json();

    const items = json.data || [];
    listEl.innerHTML = items.map((r) => `
      <div class="comment">
        <div><strong>${escapeHtml(r.user_email || "user")}</strong> • ${escapeHtml(r.rating)}</div>
        ${r.comment ? `<div>${escapeHtml(r.comment)}</div>` : ""}
      </div>
    `).join("");
  }

  async function submitReview() {
    const hallId = getDiningHallId();
    if (!hallId) return alert("Missing dining hall id in URL (?id=...).");

    const token = getToken();
    if (!token) return alert("You must login first (no token found).");

    const comment = commentEl?.value?.trim() || "";
    const rating = Number(ratingEl?.value || window.getSelectedRating?.() || 0);

    if (!(rating >= 1 && rating <= 5)) return alert("Please choose a rating (1–5).");

    const res = await fetch(`${API_BASE}/dining-halls/${encodeURIComponent(hallId)}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return alert(err.message || `Failed to submit review (${res.status})`);
    }

    // clear and reload
    if (commentEl) commentEl.value = "";
    await fetchReviews();
  }

  // expose for onclick handlers
  window.submitReview = submitReview;

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitReview();
    });
  }

  fetchReviews().catch(console.error);
})();
