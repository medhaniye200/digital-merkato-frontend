"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const backendUrl = "http://192.168.1.6:8000";

  // Helper to fix image path
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${backendUrl}/media/${path.replace(/^\/?media\/?/, "")}`;
  };

  useEffect(() => {
    fetch(`${backendUrl}/api/services/list/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Services API Response:", data);
        setServices(data);
      })
      .catch((err) => console.error("Error fetching services:", err));
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/projects/list/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Projects API Response:", data);
        setProjects(data);
      })
      .catch((err) => console.error("Error fetching projects:", err));
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/staff-members/list/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Members API Response:", data);
        setMembers(data);
      })
      .catch((err) => console.error("Error fetching members:", err));
  }, []);

  return (
    <>
      <header className="fixed-element">
        <h1>Digital Merkato Technology</h1>
      </header>

      <section className="hero">
        <div className="hero-text">
          <h2>
            Digital Merkato transforms ideas into innovative business systems
            and digital solutions.
          </h2>
          <p>Digital solutions for modern businesses in Ethiopia.</p>
          <div className="hero-buttons">
            <a className="animated-button" href="#services">Our Services</a>
            <a className="animated-button " href="#">Watch Video</a>
          </div>
        </div>
      </section>

      <section id="services" className="services">
        <h3>Our Services</h3>
        <p>We are committed to delivering the following services, and beyond.</p>
        <div className="service-cards">
          {services.map((s, i) => (
            <div className="card" key={i}>
              <img
                src={getImageUrl(s.image_icon)}
                alt={s.title}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                }}
              />
              <h4>{s.title}</h4>
              <p>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="projects" className="projects">
        <h3 className="section-heading">Our Projects</h3>
        <div className="project-container">
          {projects.map((p, i) => (
            <div className="project-card" key={i}>
              <img
                src={getImageUrl(p.image_icon)}
                alt={p.title}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                }}
              />
              <h4>{p.title}</h4>
              <p>{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="about-us">
        <h3 className="section-heading">Our Team</h3>
        <div className="about-container">
          {members.map((m, i) => (
            <div className="about-card" key={i}>
              <img
                src={getImageUrl(m.image_icon)}
                alt={m.name}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                }}
              />
              <h4>{m.full_name}</h4>
              <p>{m.position}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="Contact" className="contact">
        <h3>Contact Us</h3>
        <p>Email: digitalmerkato@outlook.com</p>
        <p>Phone: +251 929 078 786</p>
        <p>Telegram: @digitalmerkato</p>
        <p>
          Follow us:
          <a href="#">Facebook</a> | <a href="#">Telegram</a> |{" "}
          <a href="#">WhatsApp</a>
        </p>
      </section>

      <footer>
        <p>&copy; 2025 Digital Merkato Technology PLC. All rights reserved.</p>
      </footer>
    </>
  );
}
