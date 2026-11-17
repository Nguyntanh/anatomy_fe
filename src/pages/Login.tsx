import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '@/features/auth';
import {
  getApiErrorMessage,
  login,
  saveAuthSession,
} from '@/services/api';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      saveAuthSession(await login(email, password));
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
        <h1 className="text-2xl font-bold text-slate-900">Đăng nhập AnatomyAI</h1>
        <p className="mt-2 mb-6 text-sm text-slate-600">
          Đăng nhập để tiếp tục tư vấn sức khỏe.
        </p>
        {error && (
          <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <LoginForm onLogin={handleLogin} isSubmitting={isSubmitting} />
        <p className="mt-6 text-sm text-slate-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-medium text-sky-700 hover:underline">
            Đăng ký
          </Link>
        </p>
      </section>
    </main>
  );
}
