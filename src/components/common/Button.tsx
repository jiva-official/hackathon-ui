import React from 'react';

interface ButtonProps {
    text: string;
    onClick: () => void;
    style?: React.CSSProperties;
}
interface ButtonProps {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
  }

const Button: React.FC<ButtonProps> = ({ text, onClick, style }) => {
    return (
        <button onClick={onClick} style={style}>
            {text}
        </button>
    );
};

export default Button;