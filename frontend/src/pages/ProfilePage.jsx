import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { InputField } from '../components/common/InputField';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../hooks/useAuth';

export function ProfilePage() {
  const { updateProfile, user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Manage your personal details, account identity, and role-aware workspace presence."
      />

      <div className="grid gap-5 xl:grid-cols-[0.9fr,1.1fr]">
        <Card className="grid gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-brand text-2xl font-bold text-white">
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-ink">{user?.name}</p>
              <p className="text-sm text-muted">{user?.email}</p>
              <p className="mt-2 inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                {user?.role}
              </p>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-line bg-white/40 p-4 text-sm text-muted dark:bg-slate-950/30">
            Use this page to keep your visible profile current for assignments, comments, and activity logs.
          </div>
        </Card>

        <Card>
          <form onSubmit={submit} className="grid gap-4">
            <InputField
              label="Full name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <InputField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <InputField
              label="Avatar URL"
              value={form.avatar}
              onChange={(event) => setForm((current) => ({ ...current, avatar: event.target.value }))}
              placeholder="https://..."
            />
            <Button type="submit" className="justify-self-end" isLoading={isSaving}>
              Save profile
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
