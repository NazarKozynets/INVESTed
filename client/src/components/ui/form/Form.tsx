import React from 'react';

interface FormProps {
    children: React.ReactNode;
    className?: string;
}

export const Form = ({children, className}: FormProps) => {
    return (
        <div className={className} style={{
            border: '1px solid #ccc',
            borderRadius: '20px',
            boxShadow: '-6px 0 10px rgba(0, 0, 0, 0.3), 0 6px 10px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)'
        }}>
            {children}
        </div>
    );
};