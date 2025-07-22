"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./MemberManager.module.css";

export default function MemberManager() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    position: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState({ message: "", type: "" });
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter();

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${backendUrl}/media/${path.replace(/^\/?media\/?/, "")}`;
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    setToken(storedToken);

    fetch(`${backendUrl}/api/staff-members/list`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch members");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched member data:", data); // ✅ Inspect structure

        // Try different property names depending on the backend response
        const membersArray = Array.isArray(data)
          ? data
          : data.results || data.data || [];

        if (!Array.isArray(membersArray)) {
          throw new Error("Fetched data is not an array");
        }

        setMembers(membersArray);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setStatus({ message: "Failed to load team members", type: "error" });
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setForm((prev) => ({ ...prev, image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatus({ message: "You are not authenticated", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("full_name", form.full_name);
    formData.append("position", form.position);
    if (form.image) {
      formData.append("image_icon", form.image);
    }

    try {
      const res = await fetch(
        `${backendUrl}${
          editId
            ? `/api/staff-members/update/${editId}/`
            : `/api/staff-members/`
        }`,
        {
          method: editId ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Failed to save member");

      const updated = await res.json();
      if (editId) {
        setMembers((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
        setEditId(null);
        setStatus({ message: "Member updated successfully", type: "success" });
      } else {
        setMembers((prev) => [...prev, updated]);
        setStatus({ message: "Member added successfully", type: "success" });
      }

      setForm({ full_name: "", position: "", image: null });
      setPreview(null);
    } catch (err) {
      console.error("Submit error:", err.message);
      setStatus({
        message: err.message || "Failed to save member",
        type: "error",
      });
    }
  };

  const handleEdit = (member) => {
    setForm({
      full_name: member.full_name,
      position: member.position,
      image: null,
    });
    setPreview(getImageUrl(member.image_icon));
    setEditId(member.id);
    setStatus({ message: "", type: "" });
  };

  const handleDelete = async (id) => {
    if (!token) {
      setStatus({ message: "You are not authenticated", type: "error" });
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/staff-members/delete/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        setStatus({ message: "Member deleted successfully", type: "success" });
      } else {
        throw new Error("Failed to delete member");
      }
    } catch (err) {
      console.error("Delete error:", err.message);
      setStatus({
        message: err.message || "Failed to delete member",
        type: "error",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}></div>

      {status.message && (
        <div
          className={`${styles.statusMessage} ${
            styles[`${status.type}Message`]
          }`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Full name"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Position</label>
            <input
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="Position"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className={styles.inputFile}
            />
          </div>
        </div>

        {preview && (
          <div className={styles.previewContainer}>
            <img src={preview} alt="Preview" className={styles.previewImage} />
          </div>
        )}

        <button type="submit" className={styles.submitButton}>
          {editId ? "Update Member" : "Add New Member"}
        </button>
      </form>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Image</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Position</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className={styles.tr}>
                <td className={styles.td}>
                  <img
                    src={getImageUrl(m.image_icon)}
                    alt={m.full_name}
                    className={styles.tableImage}
                  />
                </td>
                <td className={styles.td}>{m.full_name}</td>
                <td className={styles.td}>{m.position}</td>
                <td className={styles.td}>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => handleEdit(m)}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
