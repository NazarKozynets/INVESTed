import "./text-input.css";
import { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  type: string;
  className?: string;
  id?: string;
}

export const TextInput = ({
  name,
  placeholder,
  value,
  setValue,
  type,
  className,
  id,
  ...rest
}: TextInputProps) => {
  return (
    <div className={`text-input-container ${className}`} id={id}>
      <input
        id={name}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: "95%",
        }}
        {...rest}
      />
    </div>
  );
};
