import { useState } from 'react';
import './dropdown-menu.css';

export const DropdownMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const options = [
        "OPTION 1",
        "OPTION 2",
        "OPTION 3",
        "OPTION 4"
    ];

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option: string) => {
        setSelectedOption(option);
        setIsOpen(false);
    };

    return (
        <div className="dropdown-menu">
            <div className={`dropdown-header ${isOpen ? 'open' : ''}`} onClick={toggleDropdown}>
                {selectedOption || "SELECT OPTION"}
                <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </div>

            <ul className={`dropdown-list ${isOpen ? 'open' : ''}`}>
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
