"use client";

import { useEffect, useState } from "react";
import styles from "./ServiceManager.module.css";

export default function ServiceManager() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", image: null });
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  const getToken = () => {
    const token = localStorage.getItem("accessToken");
    console.log(
      "🔐 Access Token from localStorage:",
      token ? "Found" : "Not found"
    );
    return token;
  };

  const getImageUrl = (path) => {
    if (!path) {
      console.log("⚠️ Image path is empty or null");
      return null;
    }
    if (path.startsWith("http")) {
      console.log("🌐 Absolute image URL:", path);
      return path;
    }
    const normalizedPath = path.replace(/^\/?media\/?/, "");
    const fullUrl = `${backendUrl}/media/${normalizedPath}`;
    console.log("🖼️ Constructed image URL:", fullUrl);
    return fullUrl;
  };

  const fetchServices = async () => {
    setLoading(true);
    const token = getToken();

    if (!token) {
      setStatus({
        message: "No access token found. Please login.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    if (!backendUrl) {
      setStatus({ message: "Backend URL is not configured.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      console.log(
        "📡 Fetching services from:",
        `${backendUrl}/api/services/list/`
      );
      const response = await fetch(
        `${backendUrl}/api/services/list/?ordering=-id`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const list = (Array.isArray(data) ? data : data.results || []).map(
        (service) => ({
          ...service,
          id: String(service.id), // Ensure id is a string
        })
      );
      setServices(list);
      console.log("✅ Services fetched:", list);
      setStatus({ message: "", type: "" });
    } catch (err) {
      console.error("❌ Failed to fetch services:", err.message);
      setStatus({
        message: `Failed to load services: ${err.message}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.description.trim())
      errors.description = "Description is required";
    // Image is optional, no validation required
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setForm((prev) => ({ ...prev, image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
      setFormErrors((prev) => ({ ...prev, image: undefined }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const token = getToken();
    if (!token) {
      setStatus({
        message: "No access token found. Please login.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    if (form.image) {
      formData.append("image_icon", form.image); // Match backend field name
    }

    try {
      const url = editId
        ? `${backendUrl}/api/services/update/${editId}/`
        : `${backendUrl}/api/services/`;
      console.log(`📤 Sending ${editId ? "PUT" : "POST"} to:`, url);
      console.log("📤 FormData contents:", {
        title: form.title,
        description: form.description,
        image_icon: form.image ? form.image.name : null,
      });
      const response = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response error:", response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log("📥 Response data:", responseData);
      setStatus({
        message: editId
          ? "Service updated successfully"
          : "Service created successfully",
        type: "success",
      });
      setForm({ title: "", description: "", image: null });
      setPreview(null);
      setEditId(null);
      setFormErrors({});
      fetchServices();
    } catch (err) {
      console.error("❌ Submit error:", err.message);
      setStatus({
        message: `Failed to save service: ${err.message}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setForm({
      title: service.title,
      description: service.description,
      image: null,
    });
    const imageUrl = getImageUrl(service.image_icon);
    setPreview(imageUrl);
    setEditId(service.id);
    setStatus({ message: "", type: "" });
    setFormErrors({});
  };

  const handleDelete = async (id) => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      setStatus({
        message: "No access token found. Please login.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    try {
      console.log(
        `📤 Sending DELETE to: ${backendUrl}/api/services/delete/${id}/`
      );
      const response = await fetch(`${backendUrl}/api/services/delete/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Delete error:", response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      setServices((prev) => prev.filter((s) => s.id !== id));
      setStatus({ message: "Service deleted successfully", type: "success" });
    } catch (err) {
      console.error("❌ Delete error:", err.message);
      setStatus({
        message: `Failed to delete service: ${err.message}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Manage Services</h1>

      {status.message && (
        <div
          className={`${styles.statusMessage} ${
            styles[status.type + "Message"]
          }`}
        >
          {status.message}
        </div>
      )}

      {loading && <div className={styles.loader}>Loading...</div>}

      <form
        onSubmit={handleSubmit}
        className={styles.form}
        aria-label="Service form"
      >
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="title" className={styles.label}>
              Title
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Service Title"
              className={`${styles.input} ${
                formErrors.title ? styles.inputError : ""
              }`}
              required
              aria-invalid={!!formErrors.title}
              aria-describedby={formErrors.title ? "title-error" : undefined}
            />
            {formErrors.title && (
              <span id="title-error" className={styles.errorText}>
                {formErrors.title}
              </span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Service Description"
              className={`${styles.input} ${
                formErrors.description ? styles.inputError : ""
              }`}
              required
              aria-invalid={!!formErrors.description}
              aria-describedby={
                formErrors.description ? "description-error" : undefined
              }
            />
            {formErrors.description && (
              <span id="description-error" className={styles.errorText}>
                {formErrors.description}
              </span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="image" className={styles.label}>
              Image (Optional)
            </label>
            <input
              id="image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className={`${styles.inputFile} ${
                formErrors.image ? styles.inputError : ""
              }`}
              aria-invalid={!!formErrors.image}
              aria-describedby={formErrors.image ? "image-error" : undefined}
            />
            {formErrors.image && (
              <span id="image-error" className={styles.errorText}>
                {formErrors.image}
              </span>
            )}
          </div>
        </div>

        {preview && (
          <div className={styles.previewContainer}>
            <img
              src={preview}
              alt="Image preview"
              className={styles.previewImage}
              onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
            />
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {editId ? "Update Service" : "Add New Service"}
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
            {services.map((service) => (
              <tr key={service.id} className={styles.tr}>
                <td className={styles.td}>
                  {getImageUrl(service.image_icon) ? (
                    <img
                      src={getImageUrl(service.image_icon)}
                      alt={service.title}
                      className={styles.tableImage}
                      onError={(e) =>
                        (e.currentTarget.src = "/fallback-image.jpg")
                      }
                    />
                  ) : (
                    <span>No image available</span>
                  )}
                </td>
                <td className={styles.td}>{service.title}</td>
                <td className={styles.td}>{service.description}</td>
                <td className={styles.td}>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => handleEdit(service)}
                      className={styles.editButton}
                      aria-label={`Edit ${service.title}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className={styles.deleteButton}
                      aria-label={`Delete ${service.title}`}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && !loading && (
          <p className={styles.noData}>No services found.</p>
        )}
      </div>
    </div>
  );
}
