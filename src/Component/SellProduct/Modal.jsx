import React, { useEffect, useRef } from "react";
import { useTheme } from "../../contexts/theme/hook/useTheme";

export default function Modal({ isOpen, onClose, children }) {
  const { theme } = useTheme();
  const modalRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        ref={modalRef}
        className="p-6 rounded-xl w-full max-w-2xl relative shadow-lg"
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
