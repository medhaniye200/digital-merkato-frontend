import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          throw new Error('Backend URL is not configured');
        }

        const response = await fetch(`${backendUrl}/api/blogs/`);
        
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        // Handle different response formats
        const receivedBlogs = Array.isArray(data) ? data : 
                            data.results || data.items || data.data || [];
        
        setBlogs(receivedBlogs);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <>
      <Head>
        <title>Latest Blogs | Digital Merkato</title>
        <meta name="description" content="Discover our latest blog posts" />
      </Head>

      <main className="container">
        <h1 className="page-title">Latest Blog Posts</h1>
        
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading posts...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="blogs-grid">
            {blogs.length > 0 ? (
              blogs.map(blog => (
                <article key={blog.id} className="blog-card">
                  {blog.image_icon && (
                    <img 
                      src={blog.image_icon} 
                      alt={blog.title}
                      className="blog-image"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-blog.jpg';
                      }}
                    />
                  )}
                  <div className="blog-content">
                    <h2>{blog.title}</h2>
                    <p className="blog-excerpt">{blog.content}</p>
                    <div className="blog-meta">
                      <time dateTime={blog.created_at}>
                        {new Date(blog.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                      <span className={`status ${blog.status}`}>
                        {blog.status}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-message">No blog posts available</p>
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .page-title {
          font-size: 2rem;
          margin-bottom: 2rem;
          text-align: center;
          color: #333;
        }
        
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-state {
          background: #ffebee;
          border-left: 4px solid #f44336;
          padding: 1rem;
          margin: 2rem 0;
          text-align: center;
        }
        
        .retry-button {
          background: #2196f3;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 1rem;
        }
        
        .blogs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .blog-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        
        .blog-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .blog-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        
        .blog-content {
          padding: 1.5rem;
        }
        
        .blog-excerpt {
          color: #555;
          line-height: 1.5;
          margin: 0.5rem 0;
        }
        
        .blog-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .status {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: capitalize;
        }
        
        .status.published {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .empty-message {
          text-align: center;
          grid-column: 1 / -1;
          color: #666;
          padding: 3rem;
        }
      `}</style>
    </>
  );
}