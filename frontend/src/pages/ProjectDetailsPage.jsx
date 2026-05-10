import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, FolderKanban, UserPlus2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { InputField } from '../components/common/InputField';
import { Modal } from '../components/common/Modal';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProjectForm } from '../components/forms/ProjectForm';
import { useAuth } from '../hooks/useAuth';
import {
  addProjectMember,
  getProjectById,
  removeProjectMember,
  updateProject
} from '../services/projectService';
import { getUsers } from '../services/userService';
import { formatDate, formatDateTime } from '../utils/formatters';

export function ProjectDetailsPage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [memberUserId, setMemberUserId] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId)
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: isAdmin
  });

  const candidateUsers = useMemo(
    () =>
      users.filter((user) => !project?.members?.some((member) => member.userId === user.id)),
    [project?.members, users]
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateProject(id, payload),
    onSuccess: () => {
      toast.success('Project updated');
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsEditOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Unable to update project');
    }
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ id, payload }) => addProjectMember(id, payload),
    onSuccess: () => {
      toast.success('Member added');
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setMemberUserId('');
      setMemberEmail('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Unable to add member');
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ id, userId }) => removeProjectMember(id, userId),
    onSuccess: () => {
      toast.success('Member removed');
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Unable to remove member');
    }
  });

  if (isLoading) {
    return <Card className="h-80 animate-pulse" />;
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="The requested project could not be loaded or is outside your access scope."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Project deep-dive"
        title={project.title}
        description={project.description || 'Detailed coordination view for this project.'}
        actions={
          isAdmin ? (
            <Button onClick={() => setIsEditOpen(true)}>Edit project</Button>
          ) : null
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.25fr,0.75fr]">
        <Card className="grid gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge value={project.status} type="project" />
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm text-muted dark:bg-slate-950/40">
              <FolderKanban className="h-4 w-4" />
              {project.tasks.length} tasks
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm text-muted dark:bg-slate-950/40">
              <CalendarClock className="h-4 w-4" />
              {formatDate(project.deadline)}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted">Overall progress</span>
              <span className="font-semibold text-ink">{project.progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full rounded-full bg-brand" style={{ width: `${project.progress}%` }} />
            </div>
          </div>

          <div className="grid gap-3">
            <h3 className="font-display text-xl font-bold text-ink">Project tasks</h3>
            {project.tasks.length ? (
              project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-[1.5rem] border border-line bg-white/40 p-4 dark:bg-slate-950/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{task.title}</p>
                      <p className="mt-1 text-sm text-muted">{task.description || 'No description'}</p>
                    </div>
                    <StatusBadge value={task.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
                    <span>Assignee: {task.assignee?.name || 'Unassigned'}</span>
                    <span>Due: {formatDate(task.dueDate)}</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No tasks yet"
                description="Create the first task from the Tasks page to start tracking project delivery."
              />
            )}
          </div>
        </Card>

        <div className="grid gap-5">
          <Card className="grid gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-ink">Team members</h3>
              <span className="text-sm text-muted">{project.members.length} people</span>
            </div>

            {project.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-line bg-white/40 p-4 dark:bg-slate-950/30"
              >
                <div>
                  <p className="font-semibold text-ink">{member.user.name}</p>
                  <p className="text-sm text-muted">{member.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge value={member.role} type="project" />
                  {isAdmin && member.userId !== project.createdById ? (
                    <button
                      type="button"
                      onClick={() => removeMemberMutation.mutate({ id: project.id, userId: member.user.id })}
                      className="ring-focus inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-line text-danger"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}

            {isAdmin ? (
              <div className="grid gap-3 rounded-[1.5rem] border border-dashed border-line p-4">
                <h4 className="font-semibold text-ink">Add member</h4>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-ink">Existing user</span>
                  <select
                    value={memberUserId}
                    onChange={(event) => setMemberUserId(event.target.value)}
                    className="ring-focus min-h-[52px] rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm dark:bg-slate-950/40"
                  >
                    <option value="">Select teammate</option>
                    {candidateUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </label>
                <InputField
                  label="Or invite by email"
                  type="email"
                  placeholder="member@company.com"
                  value={memberEmail}
                  onChange={(event) => setMemberEmail(event.target.value)}
                />
                <Button
                  onClick={() =>
                    addMemberMutation.mutate({
                      id: project.id,
                      payload: memberUserId ? { userId: memberUserId } : { email: memberEmail }
                    })
                  }
                >
                  <UserPlus2 className="h-4 w-4" />
                  Add member
                </Button>
              </div>
            ) : null}
          </Card>

          <Card className="grid gap-3">
            <h3 className="font-display text-xl font-bold text-ink">Recent project activity</h3>
            {project.activities.map((activity) => (
              <div key={activity.id} className="rounded-[1.5rem] border border-line bg-white/40 p-4 dark:bg-slate-950/30">
                <p className="font-semibold text-ink">{activity.actor?.name || 'System'}</p>
                <p className="mt-1 text-sm text-muted">{activity.action.replaceAll('.', ' ')}</p>
                <p className="mt-2 text-xs text-muted">{formatDateTime(activity.createdAt)}</p>
              </div>
            ))}
            {!project.activities.length ? <p className="text-sm text-muted">No recent project activity yet.</p> : null}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit project"
        description="Update the project definition, timing, or member allocation."
      >
        <ProjectForm
          members={users}
          defaultValues={{
            ...project,
            deadline: project.deadline ? new Date(project.deadline).toISOString().slice(0, 16) : '',
            memberIds: project.members.map((member) => member.userId)
          }}
          onSubmit={(values) =>
            updateMutation.mutate({
              id: project.id,
              payload: {
                ...values,
                deadline: values.deadline ? new Date(values.deadline).toISOString() : ''
              }
            })
          }
        />
      </Modal>
    </div>
  );
}
