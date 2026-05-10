import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from '../../utils/constants';
import { Button } from '../common/Button';
import { InputField } from '../common/InputField';

const schema = z.object({
  title: z.string().min(3, 'Task title is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  assignedToId: z.string().optional(),
  priority: z.enum(TASK_PRIORITY_OPTIONS).default('MEDIUM'),
  status: z.enum(TASK_STATUS_OPTIONS).default('TODO'),
  dueDate: z.string().optional()
});

export function TaskForm({ defaultValues, onSubmit, projects = [] }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      projectId: projects[0]?.id || '',
      assignedToId: '',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: '',
      ...defaultValues
    }
  });

  const projectId = watch('projectId');
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId),
    [projectId, projects]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <InputField label="Task title" placeholder="Refine onboarding flow" error={errors.title?.message} {...register('title')} />
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">Project</span>
          <select
            className="ring-focus min-h-[52px] rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm dark:bg-slate-950/40"
            {...register('projectId')}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
          {errors.projectId?.message ? (
            <span className="text-xs text-danger">{errors.projectId.message}</span>
          ) : null}
        </label>
      </div>

      <InputField
        label="Description"
        textarea
        placeholder="Define the outcome, dependencies, and acceptance criteria"
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">Assignee</span>
          <select
            className="ring-focus min-h-[52px] rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm dark:bg-slate-950/40"
            {...register('assignedToId')}
          >
            <option value="">Unassigned</option>
            {(selectedProject?.members || []).map((member) => (
              <option key={member.user.id} value={member.user.id}>
                {member.user.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">Priority</span>
          <select
            className="ring-focus min-h-[52px] rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm dark:bg-slate-950/40"
            {...register('priority')}
          >
            {TASK_PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">Status</span>
          <select
            className="ring-focus min-h-[52px] rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm dark:bg-slate-950/40"
            {...register('status')}
          >
            {TASK_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <InputField label="Due date" type="datetime-local" error={errors.dueDate?.message} {...register('dueDate')} />
      </div>

      <Button type="submit" className="justify-self-end" isLoading={isSubmitting}>
        Save task
      </Button>
    </form>
  );
}
