import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AuthForm } from '../components/forms/AuthForm';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';

export function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (values) => {
    try {
      await register(values);
      toast.success('Account created');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create account');
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start coordinating work with secure authentication and role-aware workflows."
      sideNote={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand">
            Sign in
          </Link>
        </p>
      }
    >
      <AuthForm mode="signup" submitLabel="Create account" onSubmit={handleSubmit} />
    </AuthLayout>
  );
}
