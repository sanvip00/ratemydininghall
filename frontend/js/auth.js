// frontend/js/auth.js
(() => {
  const API_BASE = "http://localhost:4000";

  async function postJson(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  }

  function setToken(token) {
    localStorage.setItem("token", token);
  }

  // LOGIN PAGE: <form class="login-form"> with #email and #password
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email")?.value?.trim();
      const password = document.getElementById("password")?.value;

      if (!email || !password) return alert("Missing email or password.");

      const { ok, data } = await postJson("/auth/login", { email, password });

      if (!ok) return alert(data.message || "Login failed.");

      // expected: { token: "..." }
      setToken(data.token);
      window.location.href = "ratemydininghall-home.html";
    });
  }

  // SIGNUP PAGE: <form class="signup-form"> with #email and #password
  const signupForm = document.querySelector(".signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email")?.value?.trim();
      const password = document.getElementById("password")?.value;

      if (!email || !password) return alert("Missing email or password.");

      const { ok, status, data } = await postJson("/auth/register", {
        email,
        password,
      });

      if (!ok) {
        if (status === 409) return alert("Email already exists. Try logging in.");
        return alert(data.message || "Signup failed.");
      }

      // expected: { user: {...}, token: "..." }
      setToken(data.token);
      window.location.href = "ratemydininghall-home.html";
    });
  }
})();
