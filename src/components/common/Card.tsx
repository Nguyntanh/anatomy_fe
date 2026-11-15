import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};