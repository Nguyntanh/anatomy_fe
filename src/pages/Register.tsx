import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '@/features/auth';
import {
  getApiErrorMessage,
  register,
  saveAuthSession,
} from '@/services/api';

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (data: {
    email: string;
    password: string;
    fullName: string;
  }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      saveAuthSession(
        await register(data.email, data.password, data.fullName)
      );
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Tạo tài khoản</h1>
        <p className="mt-2 mb-6 text-sm text-slate-600">
          Đăng ký để lưu thông tin tư vấn an toàn theo tài khoản của bạn.
        </p>
        {error && (
          <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <RegisterForm onRegister={handleRegister} isSubmitting={isSubmitting} />
        <p className="mt-6 text-sm text-slate-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-sky-700 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </section>
    </main>
  );
}
