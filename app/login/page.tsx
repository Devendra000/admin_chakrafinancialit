"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mustLogin, setMustLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if redirected from /admin
    if (window && window.location && window.location.search.includes("mustLogin=true")) {
      setMustLogin(true);
    }
    const token = localStorage.getItem("admin_token");
    if (token) {
      fetch("/api/verify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            router.replace("/admin");
          } else {
            localStorage.removeItem("admin_token");
          }
        })
        .catch(() => {
          localStorage.removeItem("admin_token");
        });
    }
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("admin_token", data.token);
      const intended = localStorage.getItem("intended_route");
      if (intended) {
        localStorage.removeItem("intended_route");
        router.replace(intended);
      } else {
        router.replace("/admin");
      }
    } else {
      setError(data.error || "Login failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6">Admin Login</h2>
        {mustLogin && (
          <div className="text-yellow-600 mb-4 text-center font-semibold">You must log in before accessing this page.</div>
        )}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold">Login</button>
      </form>
    </div>
  );
}
