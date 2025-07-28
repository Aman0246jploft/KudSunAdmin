import React, { useEffect, useRef } from "react";
import { useTheme } from "../../contexts/theme/hook/useTheme";

export default function Modal({ isOpen, onClose, children, className = "" }) {
  const { theme } = useTheme();
  const modalRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-start"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        ref={modalRef}
        className={`mt-4 mb-4 rounded-xl w-full max-w-4xl max-h-[calc(100vh-2rem)] relative shadow-2xl ${className}`}
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.textPrimary,
        }}
      >
        {children}
      </div>
    </div>
  );
}
