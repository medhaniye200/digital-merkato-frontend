"use client";

import { useEffect, useState, FormEvent } from "react";
export default function Home() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  // Scroll effect for header
  window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Contact form state
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<null | "success" | "error">(null);
  const [loading, setLoading] = useState(false);

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${backendUrl}/media/${path.replace(/^\/?media\/?/, "")}`;
  };

  useEffect(() => {
    fetch(`${backendUrl}/api/services/list/`)
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch((err) => console.error("Error fetching services:", err));
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/projects/list/`)
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Error fetching projects:", err));
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/staff-members/list/`)
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch((err) => console.error("Error fetching members:", err));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!contactData.name || !contactData.email || !contactData.message) {
      setStatus("error");
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${backendUrl}/api/contact/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });
      if (res.ok) {
        setStatus("success");
        setContactData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
    setLoading(false);
  };

  return (
    <>
      <header className="header">
        <div className="nav-container">
          <h1 className="logo">Digital Merkato Technology</h1>

          {/* Mobile menu button */}
          <button className="menu-toggle" onClick={toggleMenu}>
            <i className="fas fa-bars"></i>
          </button>

          <nav className={isMenuOpen ? "open" : ""}>
            <a href="#services" className="nav-link" onClick={closeMenu}>
              Services
            </a>
            <a href="#projects" className="nav-link" onClick={closeMenu}>
              Projects
            </a>
            <a href="#about" className="nav-link" onClick={closeMenu}>
              Team
            </a>
            <a href="#contact" className="nav-link" onClick={closeMenu}>
              Contact
            </a>
          </nav>
        </div>
      </header>

      <div className="hero">
        <div className="hero-container">
          <div className="hero-text">
            <h2>
              Digital Merkato digitalizes ideas into local{" "}
              <span>business systems</span>
            </h2>
            <p>Digital solutions for modern businesses in Ethiopia.</p>
            <div className="hero-buttons">
              <a href="#services" className="animated-button">
                digital Services
              </a>
              <a href="#" className="animated-button secondary">
                Watch Video
              </a>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="/images/software.webp"
              alt="Business Software Solutions"
            />
          </div>
        </div>
      </div>

      <section id="services" className="services transparent-bg">
        <h3>Our Services</h3>
        <p>
          We deliver tailored software solutions including ERP, POS, eCommerce,
          and custom business applications.
        </p>
        <div className="service-cards">
          {services.map((s, i) => (
            <div
              key={i}
              className="card"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <img
                src={getImageUrl(s.image_icon)}
                alt={s.title}
                className="card-icon"
              />
              <h4>{s.title}</h4>B <p>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="projects" className="projects transparent-bg">
        <h3>Our Projects</h3>
        <p>
          Take a look at some of the innovative solutions we've crafted for
          diverse industries.
        </p>
        <div className="project-container">
          {projects.map((p, i) => (
            <div
              key={i}
              className="project-card"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <img
                src={getImageUrl(p.image_icon)}
                alt={p.title}
                className="card-icon"
              />
              <h4>{p.title}</h4>
              <p>{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="about-us transparent-bg">
        <h3>Our Team</h3>
        <p>
          Meet the dedicated professionals driving your digital transformation.
        </p>
        <div className="about-container">
          {members.map((m, i) => (
            <div
              key={i}
              className="about-card"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <img
                src={getImageUrl(m.image_icon)}
                alt={m.full_name}
                className="card-icon"
              />
              <h4>{m.full_name}</h4>
              <p>{m.position}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="Contact" className="contact">
        <h3>Contact Us</h3>
        <p>
          Have a question or want to work with us? We'd love to hear from you.
        </p>

        <div className="contact-details">
          <div className="contact-card">
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <span>digitalmerkato@outlook.com</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone-alt"></i>
              <span>+251 929 078 786</span>
            </div>
            <div className="contact-item">
              <i className="fab fa-telegram-plane"></i>
              <span>@digitalmerkato</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>Addis Ababa, Ethiopia</span>
            </div>
          </div>

          <div className="contact-form">
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                name="name"
                placeholder="Your Full Name"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email Address"
                required
              />
              <input type="text" name="subject" placeholder="Subject" />
              <textarea
                name="message"
                rows={5}
                placeholder="Your Message..."
                required
              ></textarea>
              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div>
            <h4>Digital Merkato Technology PLC</h4>
            <p>Addis Ababa, Ethiopia</p>
            <p>
              Delivering cutting-edge ERP, POS, and custom software solutions
              for modern businesses.
            </p>
            <p>Email: digitalmerkato@outlook.com | Phone: +251 929 078 786</p>
          </div>
          <div className="footer-social">
            <p>Follow Us</p>
            <a
              href="#"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="#"
              aria-label="Telegram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-telegram-plane"></i>
            </a>
            <a
              href="#"
              aria-label="WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-whatsapp"></i>
            </a>
          </div>
        </div>
        <p className="copyright">
          &copy; 2025 Digital Merkato Technology PLC. All rights reserved.
        </p>
      </footer>
    </>
  );
}
