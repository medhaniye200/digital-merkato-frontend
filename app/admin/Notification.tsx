"use client";

import { useEffect, useState, useCallback } from "react";
import styles from './Notifications.module.css';

interface Notification {
  id: string;
  full_name: string;
  email: string;
  title?: string;
  message: string;
  created_at: string;
}

interface GroupedNotifications {
  recent: Notification[];
  thisWeek: Notification[];
  older: Notification[];
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'recent' | 'thisWeek' | 'older'>('all');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.digitalmerkato.com.et';

  const getToken = (): string | null => {
    const token = localStorage.getItem("accessToken");
    console.log("🔐 Access Token from localStorage:", token ? "Found" : "Not found");
    return token;
  };

  const fetchNotifications = useCallback(async (): Promise<void> => {
    setLoading(true);
    const token = getToken();

    if (!token) {
      setError("No access token found. Please login.");
      setLoading(false);
      return;
    }

    if (!backendUrl) {
      setError("Backend URL is not configured.");
      setLoading(false);
      return;
    }

    let url = `${backendUrl}/api/notifications/list/?ordering=-created_at`;
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }

    try {
      console.log("📡 Fetching notifications from:", url);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data: Notification[] | { results: Notification[] } = await response.json();
      const fetchedNotifications = (Array.isArray(data) ? data : data.results || []).map((note) => ({
        ...note,
        id: String(note.id),
      }));
      
      setNotifications(fetchedNotifications);
      console.log("✅ Notifications fetched:", fetchedNotifications);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      console.error("❌ Failed to fetch notifications:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, backendUrl]); // Add dependencies here

  const handleReply = (email: string): void => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
    window.open(gmailUrl, '_blank');
  };

  useEffect(() => {
    console.log("🔍 Fetching notifications with search:", searchQuery);
    const debounceTimer = setTimeout(() => {
      fetchNotifications();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, fetchNotifications]); // Now includes fetchNotifications in dependencies

  // ... rest of the component remains the same ...
  const groupNotifications = (): GroupedNotifications => {
    const now = new Date();
    const recent = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const grouped: GroupedNotifications = {
      recent: [],
      thisWeek: [],
      older: [],
    };

    notifications.forEach((note) => {
      const noteDate = new Date(note.created_at);
      if (noteDate >= recent) {
        grouped.recent.push(note);
      } else if (noteDate >= oneWeekAgo) {
        grouped.thisWeek.push(note);
      } else {
        grouped.older.push(note);
      }
    });

    switch (timeFilter) {
      case 'recent':
        return { ...grouped, thisWeek: [], older: [] };
      case 'thisWeek':
        return { ...grouped, recent: [], older: [] };
      case 'older':
        return { ...grouped, recent: [], thisWeek: [] };
      default:
        return grouped;
    }
  };

  const groupedNotifications = groupNotifications();

  if (loading) {
    return (
      <div className={styles.tabSection}>
        <div className={styles.tabContent}>
          <div className={styles.loader}>Loading notifications...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.tabSection}>
        <div className={styles.tabContent}>
          <p className={styles.error}>Error: {error}</p>
          <button 
            className={styles.retryButton} 
            onClick={fetchNotifications}
            aria-label="Retry fetching notifications"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderNotificationGroup = (group: Notification[], title: string) => (
    group.length > 0 && (
      <>
        <h2 className={styles.groupTitle}>{title}</h2>
        {group.map((note) => (
          <div key={note.id} className={styles.messageRow}>
            <div className={styles.messageContent}>
              <h3 className={styles.messageName}>{note.full_name}</h3>
              <p className={styles.messageEmail}>{note.email}</p>
              {note.title && <p><strong>Title:</strong> {note.title}</p>}
              <p className={styles.messageText}>{note.message}</p>
              <p className={styles.messageDate}>
                <em>{new Date(note.created_at).toLocaleString()}</em>
              </p>
            </div>
            <div className={styles.actionButtons}>
              <button
                className={styles.actionButton}
                onClick={() => handleReply(note.email)}
                aria-label={`Reply to ${note.full_name}`}
              >
                Reply
              </button>
            </div>
          </div>
        ))}
      </>
    )
  );

  return (
    <div className={styles.tabSection}>
      <div className={styles.tabContent}>
        <h1 className={styles.tabTitle}>User Notifications</h1>
        <div className={styles.searchFilterContainer}>
          <div className={styles.filterDropdownContainer}>
            <select
              className={styles.filterDropdown}
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as typeof timeFilter)}
              aria-label="Filter notifications by time"
            >
              <option value="all">All</option>
              <option value="recent">Recent (Last 24 Hours)</option>
              <option value="thisWeek">This Week</option>
              <option value="older">Older</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search by title or message"
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search notifications"
          />
        </div>

        {notifications.length > 0 ? (
          <div className={styles.messagesList}>
            {renderNotificationGroup(groupedNotifications.recent, "Recent (Last 24 Hours)")}
            {renderNotificationGroup(groupedNotifications.thisWeek, "This Week")}
            {renderNotificationGroup(groupedNotifications.older, "Older")}
            
            {groupedNotifications.recent.length === 0 &&
             groupedNotifications.thisWeek.length === 0 &&
             groupedNotifications.older.length === 0 && (
              <p>No notifications found for this filter.</p>
            )}
          </div>
        ) : (
          <p>No notifications found.</p>
        )}
      </div>
    </div>
  );
}