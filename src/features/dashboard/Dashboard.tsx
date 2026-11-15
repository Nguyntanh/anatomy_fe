import React from 'react';
import { BodyCanvas } from '@/components/3d';
import { Card } from '@/components/common';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan cơ thể</h1>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Trạng thái: <span className="text-green-600 font-medium">Bình thường</span></p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Mô hình 3D</h2>
          <BodyCanvas className="h-[400px]" />
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Chỉ số sức khỏe</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Nhịp tim</span>
              <span className="font-medium">72 bpm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Huyết áp</span>
              <span className="font-medium">120/80 mmHg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Nhiệt độ</span>
              <span className="font-medium">36.5°C</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};