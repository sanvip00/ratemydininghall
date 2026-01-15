// rating.js
(() => {
  const stars = Array.from(document.querySelectorAll(".star"));
  const output = document.getElementById("output");
  const ratingInput = document.getElementById("ratingValue"); // optional hidden input

  if (stars.length === 0) {
    console.warn("[rating.js] No .star elements found.");
    return;
  }

  let current = 0;

  function apply(n) {
    current = n;

    stars.forEach((s) => {
      const v = Number(s.getAttribute("data-value") || 0);
      s.classList.toggle("active", v <= n);
    });

    if (output) output.textContent = `Rating: ${n}/5`;
    if (ratingInput) ratingInput.value = String(n);
  }

  stars.forEach((s) => {
    s.addEventListener("click", () => {
      const n = Number(s.getAttribute("data-value") || 0);
      if (n >= 1 && n <= 5) apply(n);
    });
  });

  // default
  apply(0);

  // expose getter if needed
  window.getSelectedRating = () => current;
})();
