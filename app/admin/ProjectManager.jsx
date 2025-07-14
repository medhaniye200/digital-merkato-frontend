"use client";

import { useState, useEffect } from "react";

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", image: null });
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [token, setToken] = useState(null); // New state for token

  const backendUrl = "http://192.168.1.6:8000";

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${backendUrl}/media/${path.replace(/^\/?media\/?/, "")}`;
  };

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem("accessToken"); // adjust the key if different
    setToken(storedToken);

    // Fetch projects
    fetch(`${backendUrl}/api/projects/list/`)
      .then((res) => res.json())
      .then(setProjects)
      .catch((err) => console.error("Fetch error:", err));
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
    if (!token) return alert("You are not authenticated.");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    if (form.image) {
      formData.append("image_icon", form.image);
    }

    try {
      const res = await fetch(
        `${backendUrl}/api/projects/${editId ? `${editId}/` : ""}`,
        {
          method: editId ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Failed to save project");

      const updated = await res.json();
      if (editId) {
        setProjects((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        setEditId(null);
      } else {
        setProjects((prev) => [...prev, updated]);
      }

      setForm({ title: "", description: "", image: null });
      setPreview(null);
    } catch (err) {
      console.error("Submit error:", err.message);
    }
  };

  const handleEdit = (project) => {
    setForm({
      title: project.title,
      description: project.description,
      image: null,
    });
    setPreview(getImageUrl(project.image_icon));
    setEditId(project.id);
  };

  const handleDelete = async (id) => {
    if (!token) return alert("You are not authenticated.");

    const res = await fetch(`${backendUrl}/api/projects/delete/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Manage Projects</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Project title"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Project description"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Image</label>
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
            alt="Preview"
            style={{ marginTop: "0.5rem", borderRadius: "8px" }}
          />
        )}
        <button type="submit" style={styles.button}>
          {editId ? "Update" : "Add"} Project
        </button>
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Image</th>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td style={styles.td}>
                <img
                  src={getImageUrl(p.image_icon)}
                  width="60"
                  alt="project"
                  style={{ borderRadius: "8px" }}
                />
              </td>
              <td style={styles.td}>{p.title}</td>
              <td style={styles.td}>{p.description}</td>
              <td style={styles.td}>
                <button
                  onClick={() => handleEdit(p)}
                  style={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  style={styles.deleteButton}
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
  editButton: {
    marginRight: "0.5rem",
    backgroundColor: "#17a2b8",
    color: "#fff",
    border: "none",
    padding: "0.4rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "0.4rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
