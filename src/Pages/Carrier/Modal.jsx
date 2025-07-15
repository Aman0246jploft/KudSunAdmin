import React from "react";
import { useTheme } from "../../contexts/theme/hook/useTheme";

export default function Modal({ isOpen, onClose, children }) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        className="p-6 rounded-xl w-full max-w-2xl relative shadow-lg"
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.textPrimary,
        }}
      >
        {/* ❌ Close icon button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl font-bold hover:text-red-500"
        >
          &times;
        </button>

        {children}
      </div>
    </div>
  );
} 