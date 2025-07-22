"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./ProjectManager.module.css";

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", image: null });
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

    fetch(`${backendUrl}/api/projects/list/`, {
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch projects");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched project data:", data); // 👀 Debug: inspect response
        const projectArray = Array.isArray(data)
          ? data
          : data.results || data.projects || data.data || [];

        if (!Array.isArray(projectArray)) {
          throw new Error("Projects data is not an array");
        }

        setProjects(projectArray);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setStatus({ message: "Failed to load projects", type: "error" });
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
    formData.append("title", form.title);
    formData.append("description", form.description);
    if (form.image) {
      formData.append("image_icon", form.image);
    }

    try {
      const res = await fetch(
        `${backendUrl}${
          editId ? `/api/projects/update/${editId}/` : `/api/projects/`
        }`,
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
        setStatus({ message: "Project updated successfully", type: "success" });
      } else {
        setProjects((prev) => [...prev, updated]);
        setStatus({ message: "Project added successfully", type: "success" });
      }

      setForm({ title: "", description: "", image: null });
      setPreview(null);
    } catch (err) {
      console.error("Submit error:", err.message);
      setStatus({
        message: err.message || "Failed to save project",
        type: "error",
      });
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
    setStatus({ message: "", type: "" });
  };

  const handleDelete = async (id) => {
    if (!token) {
      setStatus({ message: "You are not authenticated", type: "error" });
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/projects/delete/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setStatus({ message: "Project deleted successfully", type: "success" });
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (err) {
      console.error("Delete error:", err.message);
      setStatus({
        message: err.message || "Failed to delete project",
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
            <label className={styles.label}>Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Project title"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Project description"
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
          {editId ? "Update Project" : "Add New Project"}
        </button>
      </form>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Image</th>
              <th className={styles.th}>Title</th>
              <th className={styles.th}>Description</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className={styles.tr}>
                <td className={styles.td}>
                  <img
                    src={getImageUrl(p.image_icon)}
                    alt={p.title}
                    className={styles.tableImage}
                  />
                </td>
                <td className={styles.td}>{p.title}</td>
                <td className={styles.td}>{p.description}</td>
                <td className={styles.td}>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => handleEdit(p)}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
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
