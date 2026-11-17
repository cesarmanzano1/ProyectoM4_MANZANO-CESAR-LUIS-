// src/components/UserProfileHeader.tsx
import type { JSX } from "react";
import type { User } from "firebase/auth";

export function UserProfileHeader({ user }: { user: User | null }): JSX.Element {
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Usuario";
  const email = user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", backgroundColor: "#fff", padding: "0.4rem 1rem 0.4rem 0.5rem", borderRadius: "99px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
      {user?.photoURL ? (
        <img src={user.photoURL} alt="Avatar" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
      ) : (
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.95rem" }}>
          {initial}
        </div>
      )}
      <div style={{ textAlign: "left" }}>
        <span style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>{displayName}</span>
        <span style={{ display: "block", fontSize: "0.7rem", color: "#64748b" }}>{email}</span>
      </div>
    </div>
  );
}