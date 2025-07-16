"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    const res = await fetch("http://192.168.1.6:8000/api/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) 
      {
      alert("Signup successful. Please log in.");
      router.push("/login");
    } else {
      alert("Signup failed.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          required
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" style={styles.button}>Sign Up</button>
        <p>
          Already have an account? <a href="/login" style={{ color: "#0070f3", textDecoration: "none" }}>Login</a>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "3rem auto",
    padding: "2rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.05)",
    textAlign: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.8rem",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "0.8rem",
    fontSize: "1rem",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
