import React, {useEffect, useRef} from 'react';
import "./modal-window.css";

interface ModalWindowProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const ModalWindow = ({ isOpen, onClose, children } : ModalWindowProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" ref={modalRef}>
                <button className="modal-close" onClick={onClose}>
                    ×
                </button>
                {children}
            </div>
        </div>
    );
};