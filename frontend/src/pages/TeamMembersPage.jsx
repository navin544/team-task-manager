import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Trash2, UserCog2 } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { InputField } from '../components/common/InputField';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { usePagination } from '../hooks/usePagination';
import { deleteUser, getUsers, updateUser } from '../services/userService';

export function TeamMembersPage() {
  const queryClient = useQueryClient();
  const { isAdmin, user } = useAuth();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });

  const filteredUsers = users.filter((member) =>
    [member.name, member.email].some((value) =>
      value.toLowerCase().includes(deferredSearch.toLowerCase())
    )
  );

  const { page, pagedItems, setPage, totalPages } = usePagination(filteredUsers, 8);

  const updateMutation = useMutation({
    mutationFn: ({ userId, payload }) => updateUser(userId, payload),
    onSuccess: () => {
      toast.success('Member updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Unable to update member')
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('Member removed');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Unable to remove member')
  });

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="People"
        title="Team members"
        description="Review the active user directory, role assignments, and workspace access footprint."
      />

      <Card className="grid gap-4 lg:grid-cols-[1fr,220px]">
        <InputField
          label="Search team"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <div className="rounded-[1.5rem] border border-line bg-white/40 p-4 dark:bg-slate-950/30">
          <p className="text-sm text-muted">Directory size</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{users.length}</p>
        </div>
      </Card>

      {isLoading ? (
        <Card className="h-64 animate-pulse" />
      ) : pagedItems.length ? (
        <>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {pagedItems.map((member) => (
              <Card key={member.id} className="grid gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl font-bold text-ink">{member.name}</p>
                    <p className="mt-1 text-sm text-muted">{member.email}</p>
                  </div>
                  <div className="rounded-2xl bg-brand/10 p-3 text-brand">
                    {member.role === 'ADMIN' ? (
                      <ShieldCheck className="h-5 w-5" />
                    ) : (
                      <UserCog2 className="h-5 w-5" />
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-line bg-white/40 p-4 text-sm dark:bg-slate-950/30">
                  <p className="text-muted">Role</p>
                  <p className="mt-2 font-semibold text-ink">{member.role}</p>
                </div>

                {isAdmin ? (
                  <div className="grid gap-3">
                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-ink">Change role</span>
                      <select
                        defaultValue={member.role}
                        onChange={(event) =>
                          updateMutation.mutate({
                            userId: member.id,
                            payload: { role: event.target.value }
                          })
                        }
                        className="ring-focus min-h-[52px] rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm dark:bg-slate-950/40"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Member</option>
                      </select>
                    </label>
                    {member.id !== user.id ? (
                      <Button variant="ghost" className="justify-start text-danger" onClick={() => deleteMutation.mutate(member.id)}>
                        <Trash2 className="h-4 w-4" />
                        Remove user
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-[1.5rem] border border-line bg-white/40 px-4 py-3 text-sm dark:bg-slate-950/30">
            <span className="text-muted">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page === totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="No team members match this search"
          description="Try a different query or invite new contributors into a project."
        />
      )}
    </div>
  );
}
