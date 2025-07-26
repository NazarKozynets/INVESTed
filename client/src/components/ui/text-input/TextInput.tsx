import "./text-input.css";
import { InputHTMLAttributes } from "react";
import sendIcon from "../../../assets/send.svg";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  type: string;
  className?: string;
  id?: string;
  showSendIcon?: boolean;
  onSendClick?: () => void;
}

export const TextInput = ({
  name,
  placeholder,
  value,
  setValue,
  type,
  className,
  id,
  showSendIcon = false,
  onSendClick,
  ...rest
}: TextInputProps) => {
  const shouldShowIcon =
    showSendIcon && value.length > 0 && typeof onSendClick === "function";

  return (
    <div
      className={`text-input-container ${className}`}
      id={id}
      style={{ position: "relative" }}
    >
      <input
        id={name}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && typeof onSendClick === "function") {
            e.preventDefault();
            onSendClick();
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: "100%",
          paddingRight: shouldShowIcon ? "36px" : "10px",
        }}
        {...rest}
      />

      {shouldShowIcon && (
        <img
          src={sendIcon}
          alt="send"
          onClick={onSendClick}
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "20px",
            height: "20px",
            cursor: "pointer",
            opacity: 0.8,
            filter: "brightness(0) invert(1)",
          }}
        />
      )}
    </div>
  );
};
