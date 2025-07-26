"use client";
import {
  FaBell,
  FaRegNewspaper,
  FaTasks,
  FaUsers,
  FaTools,
  FaSignOutAlt,
} from "react-icons/fa";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./AdminDashboard.module.css";
import blogStyles from "./BlogManagement.module.css";
import notificationStyles from "./Notifications.module.css";
import servicesStyles from "./ServiceManager.module.css";
import projectStyles from "./Project.module.css";
import memberStyles from "./Member.module.css";
import AdminNotifications from "./Notification";
import MemberManager from "./MemberManager";
import ProjectManager from "./ProjectManager";
import ServiceManager from "./ServiceManager";

type BlogStatus = "draft" | "published";
type TimeFilter = "all" | "last_7_days" | "last_30_days" | "last_year";
type ActiveTab = "blog" | "notifications" | "project" | "member" | "services";
type BlogView = "create" | "view";

interface Blog {
  id: string;
  title: string;
  content: string;
  status: BlogStatus;
  created_at: string;
  image_icon?: string;
}

interface ApiResponse<T> {
  results: T[];
  total_pages: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("blog");
  const [blogView, setBlogView] = useState<BlogView>("create");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<BlogStatus>("draft");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [blogFilter, setBlogFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<TimeFilter>("all");
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toggledStatuses, setToggledStatuses] = useState<Record<string, BlogStatus>>({});

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchBlogs = useCallback(async (pageNum: number = 1): Promise<void> => {
    setLoading(true);
    try {
      let url = `${backendUrl}/api/blogs/?ordering=-created_at&page=${pageNum}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (blogFilter !== "all") url += `&status=${blogFilter}`;
      if (dateFilter !== "all") url += `&date_filter=${dateFilter}`;

      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("No access token found. Please login.");
        setLoading(false);
        return;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status} - ${await res.text()}`);
      }

      const data: ApiResponse<Blog> | Blog[] = await res.json();
      const results = Array.isArray(data) ? data : data.results || [];
      setBlogs(results);
      setTotalPages(Array.isArray(data) ? 1 : data.total_pages || 1);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      setBlogs([]);
      const message = error instanceof Error ? error.message : "Failed to fetch blogs";
      alert(`Failed to fetch blogs: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, searchQuery, blogFilter, dateFilter]);

  useEffect(() => {
    if (activeTab === "blog" && blogView === "view") {
      fetchBlogs(page);
    }
  }, [activeTab, blogView, searchQuery, blogFilter, dateFilter, page, fetchBlogs]);

  const handleTabClick = (tab: ActiveTab): void => {
    setActiveTab(tab);
  };

  const handleBlogViewClick = (view: BlogView): void => {
    setBlogView(view);
    if (view === "view") {
      setPage(1);
      fetchBlogs(1);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required.");
      return;
    }
    if (title.length > 200) {
      alert("Title must not exceed 200 characters.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("No access token found. Please login.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("status", status);
    if (selectedImage) {
      formData.append("image_icon", selectedImage);
    }

    try {
      const url = editingBlogId
        ? `${backendUrl}/api/blogs/edit/${editingBlogId}/`
        : `${backendUrl}/api/blogs/create/`;
      const method = editingBlogId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      alert(
        editingBlogId
          ? "Blog updated successfully!"
          : "Blog created successfully!"
      );
      resetForm();
      if (blogView === "view") {
        fetchBlogs(page);
      }
    } catch (error) {
      console.error("Failed to save blog:", error);
      const message = error instanceof Error ? error.message : "Failed to save blog";
      alert(`Failed to save blog. Please try again.\nError: ${message}`);
    }
  };

  const resetForm = (): void => {
    setTitle("");
    setContent("");
    setStatus("draft");
    setSelectedImage(null);
    setEditingBlogId(null);
  };

  const handleCancel = (): void => {
    resetForm();
  };

  const handleEdit = (blog: Blog): void => {
    setBlogView("create");
    setEditingBlogId(blog.id);
    setTitle(blog.title);
    setContent(blog.content);
    setStatus(blog.status);
    setSelectedImage(null);
  };

  const handleDelete = async (blogId: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("No access token found. Please login.");
      return;
    }

    try {
      const response = await fetch(
        `${backendUrl}/api/blogs/delete/${blogId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status}: ${errorText}`);
      }

      alert("Blog deleted successfully!");
      fetchBlogs(page);
    } catch (error) {
      console.error("Failed to delete blog:", error);
      const message = error instanceof Error ? error.message : "Failed to delete blog";
      alert(`Failed to delete blog: ${message}`);
    }
  };

  const handleToggleStatus = async (blogId: string, currentStatus: BlogStatus): Promise<void> => {
    const newStatus = currentStatus === "draft" ? "published" : "draft";
    
    // Optimistic UI update
    setToggledStatuses((prev) => ({ ...prev, [blogId]: newStatus }));
    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) =>
        blog.id === blogId ? { ...blog, status: newStatus } : blog
      )
    );

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("No access token found. Please login.");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/blogs/edit/${blogId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      alert(`Blog status toggled to ${newStatus} successfully!`);
      fetchBlogs(page);
    } catch (error) {
      console.error("Failed to toggle status:", error);
      // Revert optimistic update on error
      setToggledStatuses((prev) => {
        const newStatuses = { ...prev };
        delete newStatuses[blogId];
        return newStatuses;
      });
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.id === blogId ? { ...blog, status: currentStatus } : blog
        )
      );
      const message = error instanceof Error ? error.message : "Failed to toggle status";
      alert(`Failed to toggle status: ${message}`);
    }
  };

  const handleLogout = (): void => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  const handleClearSearch = (): void => {
    setSearchQuery("");
  };

  const renderBlogCreateView = () => (
    <div className={blogStyles.createBlog}>
      <h4 className={blogStyles.formTitle}>
        {editingBlogId ? "Edit Blog" : "Create Blog"}
      </h4>
      <div className={blogStyles.form}>
        <input
          type="text"
          placeholder="Enter blog title"
          className={blogStyles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          aria-label="Blog title"
        />
        <textarea
          placeholder="Write your content here..."
          className={blogStyles.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          aria-label="Blog content"
        ></textarea>
        <input
          type="file"
          accept="image/*"
          className={blogStyles.input}
          onChange={(e) =>
            setSelectedImage(e.target.files ? e.target.files[0] : null)
          }
          aria-label="Upload blog image"
        />
        <div className={blogStyles.dropdownGroup}>
          <select
            className={blogStyles.dropdown}
            value={status}
            onChange={(e) => setStatus(e.target.value as BlogStatus)}
            aria-label="Blog status"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className={blogStyles.buttonGroup}>
          <button
            className={blogStyles.saveButton}
            onClick={handleSave}
          >
            {editingBlogId ? "Update" : "Save"}
          </button>
          <button
            className={blogStyles.cancelButton}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderBlogListView = () => (
    <div className={blogStyles.viewBlogs}>
      <div className={blogStyles.searchFilterContainer}>
        <div className={blogStyles.filterDropdownContainer}>
          <select
            className={blogStyles.filterDropdown}
            value={blogFilter}
            onChange={(e) => setBlogFilter(e.target.value)}
            aria-label="Filter blogs by status"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className={blogStyles.filterDropdownContainer}>
          <select
            className={blogStyles.filterDropdown}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as TimeFilter)}
            aria-label="Filter blogs by date"
          >
            <option value="all">All Dates</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_year">Last Year</option>
          </select>
        </div>
        <div className={blogStyles.searchInputContainer}>
          <input
            type="text"
            placeholder="Search by title or content"
            className={blogStyles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search blogs"
          />
          {searchQuery && (
            <button
              className={blogStyles.clearButton}
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      {loading ? (
        <div className={blogStyles.loader}>Loading blogs...</div>
      ) : blogs.length > 0 ? (
        <div className={blogStyles.blogList}>
          {blogs.map((blog) => (
            <div key={blog.id} className={blogStyles.blogRow}>
              <div className={blogStyles.blogContent}>
                <h5 className={blogStyles.blogTitle}>
                  {blog.title}{" "}
                  <span
                    className={`${blogStyles.statusBadge} ${
                      (toggledStatuses[blog.id] || blog.status) === "draft"
                        ? blogStyles.draft
                        : blogStyles.published
                    }`}
                  >
                    {toggledStatuses[blog.id] || blog.status}
                  </span>
                </h5>
                <p className={blogStyles.blogPreview}>
                  {blog.content.substring(0, 100)}...
                </p>
                <p className={blogStyles.blogDate}>
                  {new Date(blog.created_at).toLocaleString()}
                </p>
              </div>
              <div className={blogStyles.actionButtons}>
                <button
                  className={`${blogStyles.actionButton} ${blogStyles.editButton}`}
                  onClick={() => handleEdit(blog)}
                  aria-label={`Edit blog ${blog.title}`}
                >
                  Edit
                </button>
                <button
                  className={`${blogStyles.actionButton} ${blogStyles.deleteButton}`}
                  onClick={() => handleDelete(blog.id)}
                  aria-label={`Delete blog ${blog.title}`}
                >
                  Delete
                </button>
                <button
                  className={`${blogStyles.actionButton} ${blogStyles.toggleButton}`}
                  onClick={() => handleToggleStatus(blog.id, blog.status)}
                  aria-label={`Toggle status of blog ${blog.title}`}
                >
                  Toggle Status
                </button>
              </div>
            </div>
          ))}
          <div className={blogStyles.pagination}>
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <p>No blogs found for the selected filters.</p>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Image
          src="/images/logo.png"
          alt="logo"
          width={80}
          height={60}
          style={{ borderRadius: "50%" }}
        />
        <h1 className={styles.title}>Admin Panel</h1>
        <FaSignOutAlt
          className={styles.logoutIcon}
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
        />
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarButtons}>
            <h2
              className={`${styles.sidebarItem} ${
                activeTab === "blog" ? styles.active : ""
              }`}
              onClick={() => handleTabClick("blog")}
            >
              <FaRegNewspaper className={styles.icon} /> Blogs
            </h2>
            <h2
              className={`${styles.sidebarItem} ${
                activeTab === "notifications" ? styles.active : ""
              }`}
              onClick={() => handleTabClick("notifications")}
            >
              <FaBell className={styles.icon} /> Notifications
            </h2>
            <h2
              className={`${styles.sidebarItem} ${
                activeTab === "project" ? styles.active : ""
              }`}
              onClick={() => handleTabClick("project")}
            >
              <FaTasks className={styles.icon} /> Add Projects
            </h2>
            <h2
              className={`${styles.sidebarItem} ${
                activeTab === "member" ? styles.active : ""
              }`}
              onClick={() => handleTabClick("member")}
            >
              <FaUsers className={styles.icon} /> Members
            </h2>
            <h2
              className={`${styles.sidebarItem} ${
                activeTab === "services" ? styles.active : ""
              }`}
              onClick={() => handleTabClick("services")}
            >
              <FaTools className={styles.icon} /> Add Services
            </h2>
          </div>
        </div>

        <div className={styles.mainContent}>
          {activeTab === "blog" && (
            <div className={blogStyles.tabSection}>
              <div className={blogStyles.tabContent}>
                <div className={blogStyles.blogNav}>
                  <button
                    className={`${blogStyles.navButton} ${
                      blogView === "create" ? blogStyles.activeNav : ""
                    }`}
                    onClick={() => handleBlogViewClick("create")}
                  >
                    {editingBlogId ? "Edit Blog" : "Create Blog"}
                  </button>
                  <button
                    className={`${blogStyles.navButton} ${
                      blogView === "view" ? blogStyles.activeNav : ""
                    }`}
                    onClick={() => handleBlogViewClick("view")}
                  >
                    View Blogs
                  </button>
                </div>
                {blogView === "create" ? renderBlogCreateView() : renderBlogListView()}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className={notificationStyles.tabSection}>
              <div className={notificationStyles.tabContent}>
                <AdminNotifications />
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className={servicesStyles.tabSection}>
              <div className={servicesStyles.tabContent}>
                <ServiceManager />
              </div>
            </div>
          )}

          {activeTab === "project" && (
            <div className={projectStyles.tabSection}>
              <div className={projectStyles.tabContent}>
                <ProjectManager />
              </div>
            </div>
          )}

          {activeTab === "member" && (
            <div className={memberStyles.tabSection}>
              <div className={memberStyles.tabContent}>
                <MemberManager />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}