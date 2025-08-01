import React from "react";
import classNames from "classnames";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  name,
  placeholder,
  error,
  helperText,
  disabled = false,
  fullWidth = false,
  className = "",
  endAdornment,  // new prop for icon/button on the right
  ...props
}) => {
  return (
    <div className={classNames("mb-4", { "w-full": fullWidth })}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={classNames(
            "border rounded-lg px-4 py-2 w-full focus:outline-none transition",
            {
              "border-gray-300  ": !error,
              "border-red-500  focus:ring-red-300": error,
              "bg-gray-100 cursor-not-allowed": disabled,
              // add padding right to avoid text under icon
              "pr-10": !!endAdornment,
            },
            className
          )}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer select-none">
            {endAdornment}
          </div>
        )}
      </div>
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {typeof error === "string" ? error : "Invalid input"}
        </p>
      )}
    </div>
  );
};

export default Input;
