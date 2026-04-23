import React from "react";

function Button({
  title,
  variant = "contained",
  color = "primary",
  type = "button",
  onClick,
  fullWidth = false,
  disabled,
  icon,
  size,
}) {
  let className = "btn ";
  if (size === "sm") className += "btn-sm ";
  if (fullWidth) className += "w-100 ";

  if (disabled) {
    className += "btn-disabled";
  } else if (variant === "outlined") {
    className += "btn-outlined";
  } else if (color === "danger") {
    className += "btn-danger";
  } else if (variant === "ghost") {
    className += "btn-ghost";
  } else {
    className += "btn-primary";
  }

  return (
    <button
      className={className}
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {icon && <i className={icon}></i>}
      {title}
    </button>
  );
}

export default Button;
