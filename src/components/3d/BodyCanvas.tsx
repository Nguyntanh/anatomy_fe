import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

interface BodyCanvasProps {
  className?: string;
}

export const BodyCanvas: React.FC<BodyCanvasProps> = ({ className }) => {
  return (
    <div className={`relative w-full h-[500px] ${className ?? ''}`}>
      <Suspense fallback={<div>Đang tải mô hình 3D...</div>}>
        <Canvas>
          {/* Anatomy models will be rendered here */}
        </Canvas>
      </Suspense>
    </div>
  );
};