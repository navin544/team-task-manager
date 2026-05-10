import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AuthForm } from '../components/forms/AuthForm';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const handleSubmit = async (values) => {
    try {
      await resetPassword({
        token,
        password: values.password
      });
      toast.success('Password updated');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to reset password');
    }
  };

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a strong password and continue back into the workspace."
      sideNote={
        <p>
          Return to{' '}
          <Link to="/login" className="font-semibold text-brand">
            login
          </Link>
        </p>
      }
    >
      <AuthForm mode="reset" submitLabel="Update password" onSubmit={handleSubmit} />
    </AuthLayout>
  );
}
