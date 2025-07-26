"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ForgotPassword.module.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://api.digitalmerkato.com.et/api/requestOTP/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to send reset link");

      // Redirect to OTP verification page with email as query param
      router.push(`/login/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Forgot Password</h2>

      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            className={styles.input}
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}