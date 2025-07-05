import { useCallback, useEffect, useRef, useState } from "react";
import "./dropdown-menu.css";

interface DropdownMenuProps {
  options: string[];
  placeholder?: string;
  onSelect?: (e: any) => void;
}

export const DropdownMenu = ({
  options,
  placeholder = "SELECT OPTION",
  onSelect,
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownMenuRef.current &&
      !dropdownMenuRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    onSelect && onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="dropdown-menu" ref={dropdownMenuRef}>
      <div
        className={`dropdown-header ${isOpen ? "open" : ""}`}
        onClick={toggleDropdown}
      >
        {selectedOption || placeholder}
        <span className={`dropdown-arrow ${isOpen ? "open" : ""}`}>▼</span>
      </div>

      <ul className={`dropdown-list ${isOpen ? "open" : ""}`}>
        {options.map((option, index) => (
          <li
            key={index}
            className="dropdown-item"
            onClick={() => handleOptionClick(option)}
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
};
