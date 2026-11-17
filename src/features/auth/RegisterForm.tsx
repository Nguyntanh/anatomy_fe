import React, { useState } from 'react';
import { Button } from '@/components/common';

interface RegisterFormProps {
  onRegister: (data: { email: string; password: string; fullName: string }) => void;
  isSubmitting?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegister,
  isSubmitting = false,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({ fullName, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Họ tên</label>
        <input
          type="text"
          autoComplete="name"
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          autoComplete="email"
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
        <input
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
      </Button>
    </form>
  );
};