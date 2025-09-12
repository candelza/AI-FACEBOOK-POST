import React from 'react';

// Using the specific LINE logo URL provided by the user.
export const LineIcon: React.FC = () => (
    <img 
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/LINE_logo.svg/2048px-LINE_logo.svg.png" 
        alt="LINE Logo"
        // Set a fixed size for the icon within the floating button.
        // The button is 3.5rem (56px), so a 36px icon should fit well.
        style={{ width: '36px', height: '36px', borderRadius: '4px' }}
    />
);