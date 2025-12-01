import React from "react";
import { useNavigate } from "react-router-dom";

export default function CloseButton({ to = -1, title = "Back", className = "" }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (typeof to === "number") navigate(to);
    else navigate(to);
  };

  return (
    <button
      aria-label={title}
      title={title}
      onClick={handleClick}
      className={`close-btn ${className}`}
      style={{ display: "inline-grid", placeItems: "center" }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
