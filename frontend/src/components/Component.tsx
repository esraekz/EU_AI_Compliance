import React from 'react';

interface ComponentProps {
  title: string;
}

export const Component: React.FC<ComponentProps> = ({ title }) => {
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
};
