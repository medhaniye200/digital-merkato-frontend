"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./ChangePassword.module.css";

export default function ChangePassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      setError("Missing email. Please restart the reset process.");
    }
  }, [email]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Email not found. Please go back and verify OTP again.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://api.digitalmerkato.com.et/api/change_password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        try {
          const data = JSON.parse(text);
          throw new Error(data.message || "Password change failed.");
        } catch {
          throw new Error("Server returned an unexpected response.");
        }
      }

      setMessage("Password changed successfully! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Change Password</h2>

      {error && <p className={styles.error}>{error}</p>}
      {message && <p className={styles.success}>{message}</p>}

      <form onSubmit={handleChangePassword} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>New Password</label>
          <input
            type="password"
            className={styles.input}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
            minLength={6}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Confirm Password</label>
          <input
            type="password"
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            minLength={6}
          />
        </div>

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
