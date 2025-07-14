"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode"; // <-- default import, no {}

import ServiceManager from "./ServiceManager";
import ProjectManager from "./ProjectManager";
import MemberManager from "./MemberManager";

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);

      console.log("Decoded token:", decoded);
      console.log("Current time (seconds):", now);
      console.log("Token expiration time:", decoded.exp);

      if (decoded.role=="admin") {
        router.push("/admin");
        setAuthorized(true);
      } else if (decoded.role !== "admin") {
        console.warn("Not an admin:", decoded.role);
        localStorage.removeItem("accessToken");
        router.push("/login");
      } 
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("accessToken");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) return <p>Loading...</p>;
  if (!authorized) return null;

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center" }}>Admin Dashboard</h1>
      <ServiceManager />
      <ProjectManager />
      <MemberManager />
    </main>
  );
}
