import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../common/Button';
import { InputField } from '../common/InputField';

const passwordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\W_]{8,64}$/;

function getSchema(mode) {
  if (mode === 'signup') {
    return z.object({
      name: z.string().min(2, 'Name is required'),
      email: z.string().email('Valid email required'),
      password: z
        .string()
        .regex(
          passwordRule,
          'Password must include upper, lower, number, and symbol characters'
        )
    });
  }

  if (mode === 'reset') {
    return z.object({
      password: z
        .string()
        .regex(
          passwordRule,
          'Password must include upper, lower, number, and symbol characters'
        )
    });
  }

  return z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(1, 'Password is required')
  });
}

export function AuthForm({
  defaultValues,
  mode = 'login',
  onForgotPassword,
  onSubmit,
  submitLabel
}) {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const schema = getSchema(mode);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues
  });

  const submitForgotPassword = async () => {
    if (!forgotEmail || !onForgotPassword) {
      return;
    }

    setIsForgotLoading(true);
    try {
      await onForgotPassword({ email: forgotEmail });
      setShowForgotPassword(false);
      setForgotEmail('');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mode === 'signup' ? (
          <InputField
            label="Full name"
            placeholder="Alex Morgan"
            error={errors.name?.message}
            {...register('name')}
          />
        ) : null}

        {mode !== 'reset' ? (
          <InputField
            label="Email"
            type="email"
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register('email')}
          />
        ) : null}

        <InputField
          label={mode === 'reset' ? 'New password' : 'Password'}
          type="password"
          placeholder="Enter a strong password"
          error={errors.password?.message}
          helperText={mode !== 'login' ? 'Use 8+ characters with uppercase, lowercase, number and symbol.' : undefined}
          {...register('password')}
        />

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </form>

      {mode === 'login' && onForgotPassword ? (
        <div className="space-y-4 rounded-[1.5rem] border border-line bg-white/40 p-4 dark:bg-slate-900/30">
          <button
            type="button"
            onClick={() => setShowForgotPassword((value) => !value)}
            className="text-sm font-semibold text-brand"
          >
            Forgot your password?
          </button>
          {showForgotPassword ? (
            <div className="grid gap-3">
              <InputField
                label="Recovery email"
                type="email"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
                placeholder="you@company.com"
              />
              <Button variant="secondary" onClick={submitForgotPassword} isLoading={isForgotLoading}>
                Send reset link
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
