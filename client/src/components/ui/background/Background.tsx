import React from 'react';
import './background.css';

interface BackgroundProps {
    children: React.ReactNode;
}

export const Background = ({ children }: BackgroundProps) => {
    return (
        <div className="gradient-background">
            {children}
        </div>
    );
};
