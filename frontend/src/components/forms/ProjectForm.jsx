import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PROJECT_STATUS_OPTIONS } from '../../utils/constants';
import { Button } from '../common/Button';
import { InputField } from '../common/InputField';

const schema = z.object({
  title: z.string().min(3, 'Project title is required'),
  description: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(PROJECT_STATUS_OPTIONS).default('PLANNING'),
  memberIds: z.array(z.string()).optional()
});

export function ProjectForm({ defaultValues, members = [], onSubmit }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      deadline: '',
      status: 'PLANNING',
      memberIds: [],
      ...defaultValues
    }
  });

  const selectedMembers = watch('memberIds') || [];

  const toggleMember = (userId) => {
    const nextMembers = selectedMembers.includes(userId)
      ? selectedMembers.filter((id) => id !== userId)
      : [...selectedMembers, userId];

    setValue('memberIds', nextMembers, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <InputField label="Project title" placeholder="Platform refresh" error={errors.title?.message} {...register('title')} />
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">Status</span>
          <select
            className="ring-focus min-h-[52px] rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm dark:bg-slate-950/40"
            {...register('status')}
          >
            {PROJECT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>
      </div>

      <InputField
        label="Description"
        textarea
        placeholder="Write a concise project brief"
        error={errors.description?.message}
        {...register('description')}
      />

      <InputField
        label="Deadline"
        type="datetime-local"
        error={errors.deadline?.message}
        {...register('deadline')}
      />

      <div className="grid gap-3">
        <span className="text-sm font-semibold text-ink">Members</span>
        <div className="grid max-h-48 gap-2 overflow-y-auto rounded-[1.5rem] border border-line bg-white/40 p-3 dark:bg-slate-950/30">
          {members.map((member) => (
            <label
              key={member.id}
              className="flex items-center justify-between rounded-2xl border border-line px-3 py-3 text-sm"
            >
              <div>
                <p className="font-semibold text-ink">{member.name}</p>
                <p className="text-xs text-muted">{member.email}</p>
              </div>
              <input
                type="checkbox"
                checked={selectedMembers.includes(member.id)}
                onChange={() => toggleMember(member.id)}
                className="h-4 w-4 rounded border-line text-brand"
              />
            </label>
          ))}
          {!members.length ? <p className="text-sm text-muted">No members available.</p> : null}
        </div>
      </div>

      <Button type="submit" className="justify-self-end" isLoading={isSubmitting}>
        Save project
      </Button>
    </form>
  );
}
