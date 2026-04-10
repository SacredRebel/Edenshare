import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-ghost';
  return <button className={`${base} ${className}`} {...props}>{children}</button>;
}
