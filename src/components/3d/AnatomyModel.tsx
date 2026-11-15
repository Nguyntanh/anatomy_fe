import React from 'react';

interface AnatomyModelProps {
  src: string;
  position?: [number, number, number];
}

export const AnatomyModel: React.FC<AnatomyModelProps> = ({ src, position = [0, 0, 0] }) => {
  return (
    <primitive object={null} position={position} />
  );
};