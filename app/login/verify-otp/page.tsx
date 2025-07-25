"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./VerifyOtp.module.css";

// Main component wrapped in Suspense
export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={<div className={styles.loading}>Loading verification...</div>}
    >
      <VerifyOtpContent />
    </Suspense>
  );
}

// Component that uses the hooks
function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        "https://api.digitalmerkato.com.et/api/verifyOTP/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      if (!res.ok) {
        throw new Error("Invalid OTP");
      }

      setMessage("OTP verified successfully!");

      // Redirect to change password page after successful verification
      router.push(`/login/change-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Verify OTP</h2>

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleOtpSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Enter the OTP sent to {email}</label>
          <input
            type="text"
            className={styles.input}
            value={otp}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setOtp(e.target.value)
            }
            placeholder="Enter 6-digit OTP"
            required
            maxLength={6}
            pattern="\d{6}"
            title="Please enter a 6-digit number"
          />
        </div>

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
}
