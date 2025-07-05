import { ButtonHTMLAttributes, FunctionComponent } from "react";
import "./button.css";

interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  text?: string;
}

const Button: FunctionComponent<IButton> = ({ className, text, ...rest }) => {
  return (
    <button className={`button ${className}`} {...rest}>
      {text}
    </button>
  );
};

export default Button;
