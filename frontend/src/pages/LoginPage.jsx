import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AuthForm } from '../components/forms/AuthForm';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { forgotPassword, login } = useAuth();

  const handleSubmit = async (values) => {
    try {
      await login(values);
      toast.success('Welcome back');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const handleForgotPassword = async (payload) => {
    try {
      await forgotPassword(payload);
      toast.success('Reset instructions sent if the account exists');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to request reset');
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage projects, tasks, and analytics."
      sideNote={
        <p>
          New here?{' '}
          <Link to="/signup" className="font-semibold text-brand">
            Create an account
          </Link>
        </p>
      }
    >
      <AuthForm mode="login" submitLabel="Login" onSubmit={handleSubmit} onForgotPassword={handleForgotPassword} />
      <div className="rounded-[1.5rem] border border-line bg-white/40 p-4 text-sm text-muted dark:bg-slate-900/30">
        <p className="font-semibold text-ink">Demo credentials</p>
        <p className="mt-2">Admin: `admin@teamtaskmanager.dev` / `Admin@12345`</p>
        <p>Member: `member@teamtaskmanager.dev` / `Member@12345`</p>
      </div>
    </AuthLayout>
  );
}
