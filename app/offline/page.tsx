"use client";

import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)",
        color: "#ffffff",
        fontFamily: "var(--font-plus-jakarta-sans, system-ui, sans-serif)",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      {/* Animated icon */}
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "24px",
          marginBottom: "2rem",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          animation: "pulse 2s ease-in-out infinite",
        }}
      >
        <img src="/icon-192x192.png" alt="WIP Administrator" style={{ width: "100%", height: "100%" }} />
      </div>

      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          marginBottom: "0.75rem",
          background: "linear-gradient(90deg, #a5b4fc, #e0e7ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Anda Sedang Offline
      </h1>

      <p
        style={{
          fontSize: "1rem",
          color: "rgba(255,255,255,0.65)",
          maxWidth: "380px",
          lineHeight: "1.7",
          marginBottom: "2.5rem",
        }}
      >
        Koneksi internet tidak tersedia. Periksa koneksi Anda dan coba lagi.
      </p>

      {/* Status indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.6rem 1.2rem",
          borderRadius: "9999px",
          background: isOnline
            ? "rgba(34, 197, 94, 0.15)"
            : "rgba(239, 68, 68, 0.15)",
          border: `1px solid ${isOnline ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
          marginBottom: "2rem",
          transition: "all 0.3s ease",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isOnline ? "#22c55e" : "#ef4444",
            display: "inline-block",
            animation: isOnline ? "none" : "blink 1.2s ease-in-out infinite",
          }}
        />
        <span style={{ fontSize: "0.875rem", color: isOnline ? "#86efac" : "#fca5a5" }}>
          {isOnline ? "Koneksi pulih" : "Tidak ada koneksi"}
        </span>
      </div>

      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "0.75rem 2rem",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#ffffff",
          fontWeight: "600",
          fontSize: "0.9rem",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.transform = "translateY(-2px)";
          (e.target as HTMLButtonElement).style.boxShadow = "0 8px 30px rgba(99,102,241,0.5)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.transform = "translateY(0)";
          (e.target as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(99,102,241,0.4)";
        }}
      >
        Coba Lagi
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
