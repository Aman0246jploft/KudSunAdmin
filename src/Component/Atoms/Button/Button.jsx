import React from "react";
import classNames from "classnames";
import { SIZES } from "./variants";
import { useTheme } from "../../../contexts/theme/hook/useTheme";
import { FiLoader } from "react-icons/fi";

const Button = ({
  children,
  variant = "primary",
  size = "sm",
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  loaderText = "Loading...",
  leftIcon = null,
  rightIcon = null,
  ...props
}) => {
  const { theme } = useTheme();

  const variantStyles = {
    primary: {
      bg: theme.colors.buttonPrimary,
      text: theme.colors.buttonTextOnPrimary,
      hoverBg: theme.colors.buttonPrimaryHover,
      shadow: "shadow-md",
    },
    secondary: {
      bg: theme.colors.buttonSecondary,
      text: theme.colors.buttonTextOnSecondary,
      hoverBg: theme.colors.buttonSecondaryHover,
      shadow: "shadow-md",
    },
    danger: {
      bg: theme.colors.buttonDanger,
      text: theme.colors.buttonTextOnDanger,
      hoverBg: theme.colors.buttonDangerHover,
      shadow: "shadow-md",
    },
    ghost: {
      bg: theme.colors.buttonGhost, // which is "transparent"
      text: theme.colors.buttonTextOnGhost,
      hoverBg: theme.colors.buttonGhostHover,
      shadow: "",
    },
  };

  const current = variantStyles[variant] || variantStyles.primary;

  const baseStyles =
    "rounded-xl transition-colors duration-200 ease-in-out font-semibold focus:outline-none transition duration-200 active:scale-95 inline-flex items-center justify-center  focus:ring-primary/50 " +
    (current.shadow || "");

  const finalClass = classNames(baseStyles, SIZES[size], className, {
    "opacity-50 cursor-not-allowed": disabled || loading,
  });

  return (
    <button
      type={type}
      className={finalClass}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        backgroundColor: current.bg,
        color: current.text,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = current.hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = current.bg;
        }
      }}
      {...props}
    >
      {loading ? (
        <FiLoader className="animate-spin h-5 w-5 mr-2" />
      ) : (
        leftIcon && <span className="mr-2 flex items-center">{leftIcon}</span>
      )}
      {loading ? loaderText : children}
      {!loading && rightIcon && <span className="ml-2 flex items-center">{rightIcon}</span>}
    </button>
  );
};

export default Button;
