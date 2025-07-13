import { useEffect, useState } from "react";
import "./search-bar.css";
import searchIcon from "../../../assets/search.svg";

type SearchBarProps = {
  placeholder?: string;
  onSearchChange: (value: string) => void;
  debounceDelay?: number;
  searchType?: string;
  minLength?: number;
  onSearchStart?: () => void;
  onSearchComplete?: (results: any[]) => void;
};

export const SearchBar = ({
  placeholder = "Search...",
  onSearchChange,
  debounceDelay = 500,
  searchType,
  minLength = 2,
}: SearchBarProps) => {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (inputValue.length >= minLength || inputValue === "") {
        setDebouncedValue(inputValue);
      }
    }, debounceDelay);

    return () => clearTimeout(timeout);
  }, [inputValue, debounceDelay, minLength]);

  useEffect(() => {
    if (debouncedValue.length >= minLength || debouncedValue === "") {
      onSearchChange(debouncedValue.trim());
    }
  }, [debouncedValue, onSearchChange, minLength]);

  return (
    <div className="search-bar">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder || `Search ${searchType ?? ""}`}
      />
      <img src={searchIcon} alt="search" className="search-bar__icon" />
    </div>
  );
};
