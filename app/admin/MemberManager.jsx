"use client";

import { useState, useEffect } from "react";

export default function MemberManager() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ full_name: "", position: "", image: null });
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [token, setToken] = useState(null);

  const backendUrl = "http://192.168.1.11:8000";

  // Load token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken"); // adjust key if needed
    setToken(storedToken);

    fetch(`${backendUrl}/api/staff-members/list/`)
      .then((res) => res.json())
      .then(setMembers)
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${backendUrl}/media/${path.replace(/^\/?media\/?/, "")}`;
  };

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
    if (!token) return alert("You are not authenticated.");

    const formData = new FormData();
    formData.append("full_name", form.full_name);
    formData.append("position", form.position);
    if (form.image) {
      formData.append("image_icon", form.image);
    }

    try {
      const res = await fetch(
        `${backendUrl}/api/staff-members/list/${editId ? `${editId}/` : ""}`,
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
      } else {
        setMembers((prev) => [...prev, updated]);
      }

      setForm({ full_name: "", position: "", image: null });
      setPreview(null);
    } catch (err) {
      console.error("Submit error:", err.message);
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

  };

  const handleDelete = async (id) => {
    if (!token) return alert("You are not authenticated.");

    const res = await fetch(`${backendUrl}/api/staff-members/delete/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Manage Team Members</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Full name"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Position</label>
            <input
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="Position"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Photo</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              style={styles.inputFile}
            />
          </div>
        </div>
        {preview && (
          <img
            src={preview}
            width="80"
            style={{ marginTop: "0.5rem", borderRadius: "8px" }}
            alt="Preview"
          />
        )}
        <button type="submit" style={styles.button}>
          {editId ? "Update" : "Add"} Member
        </button>
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Image</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Position</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td style={styles.td}>
                <img
                  src={getImageUrl(m.image_icon)}
                  width="50"
                  style={{ borderRadius: "50%" }}
                  alt={m.full_name}
                />
              </td>
              <td style={styles.td}>{m.full_name}</td>
              <td style={styles.td}>{m.position}</td>
              <td style={styles.td}>
                <button onClick={() => handleEdit(m)} style={styles.editBtn}>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    border: "1px solid #ccc",
    borderRadius: "12px",
    marginBottom: "3rem",
  },
  header: {
    textAlign: "center",
    fontSize: "1.8rem",
    marginBottom: "1.5rem",
  },
  form: {
    marginBottom: "2rem",
  },
  inputRow: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  label: {
    marginBottom: "0.5rem",
    fontWeight: "600",
  },
  input: {
    padding: "0.6rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  inputFile: {
    padding: "0.3rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  button: {
    marginTop: "1rem",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    padding: "0.8rem 2rem",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "0.75rem",
    backgroundColor: "#f5f5f5",
  },
  td: {
    padding: "0.75rem",
    borderBottom: "1px solid #ddd",
  },
  editBtn: {
    marginRight: "0.5rem",
    backgroundColor: "#17a2b8",
    color: "#fff",
    border: "none",
    padding: "0.4rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "0.4rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
