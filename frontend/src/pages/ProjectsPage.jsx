import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startTransition, useDeferredValue, useState } from 'react';
import { CalendarClock, Plus, Trash2, Users2 } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  createProject,
  deleteProject,
  getProjects,
  updateProject
} from '../services/projectService';
import { getUsers } from '../services/userService';
import { formatDate } from '../utils/formatters';

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading } = useQuery({
    queryKey: ['projects', deferredSearch, status, page],
    queryFn: () =>
      getProjects({
        page,
        limit: 6,
        search: deferredSearch || undefined,
        status: status || undefined
      })
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: isAdmin
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      toast.success('Project saved');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsModalOpen(false);
      setEditingProject(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Unable to save project');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ projectId, payload }) => updateProject(projectId, payload),
    onSuccess: () => {
      toast.success('Project updated');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setEditingProject(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Unable to update project');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success('Project deleted');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Unable to delete project');
    }
  });

  const submitProject = async (values) => {
    const payload = {
      ...values,
      deadline: values.deadline ? new Date(values.deadline).toISOString() : ''
    };

    if (editingProject) {
      await updateMutation.mutateAsync({ projectId: editingProject.id, payload });
      return;
    }

    await createMutation.mutateAsync(payload);
  };

  const projects = data?.items || [];
  const meta = data?.meta;

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Plan initiatives, assign teammates, and keep progress visible from kickoff to delivery."
        actions={
          isAdmin ? (
            <Button
              onClick={() => {
                setEditingProject(null);
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New project
            </Button>
          ) : null
        }
      />

      <Card className="grid gap-4 lg:grid-cols-[1fr,220px]">
        <InputField
          label="Search projects"
          placeholder="Search by name or description"
          value={search}
          onChange={(event) => {
            startTransition(() => {
              setSearch(event.target.value);
              setPage(1);
            });
          }}
        />
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">Status</span>
          <select
            value={status}
            onChange={(event) => {
              startTransition(() => {
                setStatus(event.target.value);
                setPage(1);
              });
            }}
            className="ring-focus min-h-[52px] rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm dark:bg-slate-950/40"
          >
            <option value="">All statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </label>
      </Card>

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-60 animate-pulse" />
          ))}
        </div>
      ) : projects.length ? (
        <>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="grid gap-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-ink">{project.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted">
                      {project.description || 'No project description yet.'}
                    </p>
                  </div>
                  <StatusBadge value={project.status} type="project" />
                </div>

                <div className="grid gap-3 rounded-[1.5rem] border border-line bg-white/40 p-4 text-sm dark:bg-slate-950/30">
                  <div className="flex items-center justify-between text-muted">
                    <span className="inline-flex items-center gap-2">
                      <Users2 className="h-4 w-4" />
                      Members
                    </span>
                    <span className="font-semibold text-ink">{project._count.members}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted">
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" />
                      Deadline
                    </span>
                    <span className="font-semibold text-ink">{formatDate(project.deadline)}</span>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted">Progress</span>
                    <span className="font-semibold text-ink">{project.progress}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/projects/${project.id}`}
                    className="ring-focus inline-flex items-center rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white"
                  >
                    View details
                  </Link>
                  {isAdmin ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingProject({
                            ...project,
                            memberIds: project.members.map((member) => member.userId),
                            deadline: project.deadline
                              ? new Date(project.deadline).toISOString().slice(0, 16)
                              : ''
                          });
                          setIsModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-danger"
                        onClick={() => deleteMutation.mutate(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-[1.5rem] border border-line bg-white/40 px-4 py-3 text-sm dark:bg-slate-950/30">
            <span className="text-muted">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="No projects match the current filters"
          description="Adjust the search or create a fresh project to start coordinating work."
          actionLabel={isAdmin ? 'Create project' : undefined}
          onAction={() => setIsModalOpen(true)}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        title={editingProject ? 'Edit project' : 'Create project'}
        description="Define the goal, timeline, and initial team allocation."
      >
        <ProjectForm defaultValues={editingProject} members={users} onSubmit={submitProject} />
      </Modal>
    </div>
  );
}
