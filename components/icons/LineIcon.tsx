import React from 'react';

interface LineIconProps {
    size?: number;
}

export const LineIcon: React.FC<LineIconProps> = ({ size = 36 }) => (
    <img 
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/LINE_logo.svg/2048px-LINE_logo.svg.png" 
        alt="LINE Logo"
        style={{ width: `${size}px`, height: `${size}px`, borderRadius: '4px' }}
    />
);
