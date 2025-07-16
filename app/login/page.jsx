"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDecodedToken } from "../../utils/auth"; // ✅ works with baseUrl config or Next.js alias

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("https:/api.digitalmerkato.com.et/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await res.json();
      const decoded = parseJwt(data.access);

      if (decoded?.role === "admin") {
        localStorage.setItem("accessToken", data.access);
        console.log("succed");
        router.push("/admin");
      } else {
        setError("You do not have admin access");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Admin Login</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        <a
          href="/"
          style={{
            color: "#0070f3",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          forget password
        </a>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: "4rem auto",
    padding: "2rem",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  error: {
    color: "#dc3545",
    marginBottom: "1rem",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "1.25rem",
  },
  label: {
    marginBottom: "0.5rem",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "0.6rem 0.8rem",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
    backgroundColor: "#fefefe",
  },
  button: {
    padding: "0.75rem",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "1.1rem",
    cursor: "pointer",
    marginTop: "1rem",
  },
};
