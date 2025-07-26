"use client";

import { useEffect, useState } from "react";
import styles from "../AdminDashboard.module.css";

interface Notification {
  _id: string;
  created_at: string;
  full_name: string;
  email: string;
  title?: string;
  message: string;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      setError("Backend URL is not defined");
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You are not logged in as admin.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${backendUrl}/api/notifications/list/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading)
    return (
      <div className={styles.adminContainer}>
        <p>Loading notifications...</p>
      </div>
    );

  if (error)
    return (
      <div className={styles.adminContainer}>
        <p>Error loading notifications: {error}</p>
        <button onClick={() => location.reload()}>Retry</button>
      </div>
    );

  return (
    <div className={styles.adminContainer}>
      <h1>User Notifications</h1>
      {notifications.length > 0 ? (
        <div className={styles.messagesGrid}>
          {notifications.map((note) => (
            <div key={note._id} className={styles.messageCard}>
              <div className={styles.messageHeader}>
                <div>
                  {new Date(note.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
                <h3>{note.full_name}</h3>
                <p className={styles.messageEmail}>{note.email}</p>
              </div>
              <div className={styles.messageBody}>
                {note.title && (
                  <p>
                    <strong>Title:</strong> {note.title}
                  </p>
                )}
                <p>{note.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No notifications found</p>
      )}
    </div>
  );
};

export default AdminNotifications;
