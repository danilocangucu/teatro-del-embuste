"use client";

import React from "react";

interface ButtonProps {
  onClick?: () => void;
  type?: "submit";
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({ onClick, type, disabled, children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type === "submit" ? "submit" : "button"}
      style={{
        padding: "8px 16px",
        borderRadius: 4,
        border: "1px solid",
        borderColor: disabled ? "#ccc" : "#0070f3",
        backgroundColor: disabled ? "#f0f0f0" : "#0070f3",
        color: disabled ? "#999" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none",
      }}
    >
      {children}
    </button>
  );
}
