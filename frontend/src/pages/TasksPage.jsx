import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { CalendarDays, LayoutGrid, List, MessageSquarePlus, Paperclip, Plus, Trash2 } from 'lucide-react';
import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { InputField } from '../components/common/InputField';
import { Modal } from '../components/common/Modal';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { TaskForm } from '../components/forms/TaskForm';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { useAuth } from '../hooks/useAuth';
import { setTaskView } from '../redux/slices/uiSlice';
import { getProjects } from '../services/projectService';
import {
  createComment,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  uploadAttachment
} from '../services/taskService';
import { formatDate, formatRelativeTime, isTaskLate } from '../utils/formatters';

function buildCalendarDays(referenceDate) {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let cursor = calendarStart;

  while (cursor <= calendarEnd) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return days;
}

export function TasksPage() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();
  const taskView = useSelector((state) => state.ui.taskView);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [projectId, setProjectId] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [page, setPage] = useState(1);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [calendarMonth] = useState(new Date());
  const deferredSearch = useDeferredValue(search);

  const { data: projectsData } = useQuery({
    queryKey: ['projects', 'task-form'],
    queryFn: () => getProjects({ page: 1, limit: 50 })
  });

  const projects = projectsData?.items || [];

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', deferredSearch, status, priority, projectId, sortBy, page],
    queryFn: () =>
      getTasks({
        page,
        limit: 16,
        search: deferredSearch || undefined,
        status: status || undefined,
        priority: priority || undefined,
        projectId: projectId || undefined,
        sortBy
      })
  });

  const tasks = useMemo(() => tasksData?.items || [], [tasksData?.items]);
  const meta = tasksData?.meta;
  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId),
    [activeTaskId, tasks]
  );

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success('Task saved');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsTaskModalOpen(false);
      setEditingTask(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Unable to save task')
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, payload }) => updateTask(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Unable to update task')
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success('Task deleted');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setActiveTaskId(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Unable to delete task')
  });

  const commentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      toast.success('Comment added');
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Unable to add comment')
  });

  const uploadMutation = useMutation({
    mutationFn: ({ taskId, file }) => uploadAttachment(taskId, file),
    onSuccess: () => {
      toast.success('Attachment uploaded');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Unable to upload attachment')
  });

  const submitTask = async (values) => {
    const payload = {
      ...values,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : ''
    };

    if (editingTask) {
      await updateMutation.mutateAsync({
        taskId: editingTask.id,
        payload
      });
      setIsTaskModalOpen(false);
      setEditingTask(null);
      return;
    }

    await createMutation.mutateAsync(payload);
  };

  const calendarDays = buildCalendarDays(calendarMonth);

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Execution board"
        title="Tasks"
        description="Search, sort, drag, comment, and move work across the team’s live delivery workflow."
        actions={
          <div className="flex flex-wrap gap-3">
            <div className="flex rounded-2xl border border-line bg-white/40 p-1 dark:bg-slate-950/30">
              <button
                type="button"
                onClick={() => dispatch(setTaskView('board'))}
                className={`rounded-2xl px-3 py-2 text-sm font-semibold ${taskView === 'board' ? 'bg-brand text-white' : 'text-muted'}`}
              >
                <LayoutGrid className="mr-2 inline h-4 w-4" />
                Board
              </button>
              <button
                type="button"
                onClick={() => dispatch(setTaskView('list'))}
                className={`rounded-2xl px-3 py-2 text-sm font-semibold ${taskView === 'list' ? 'bg-brand text-white' : 'text-muted'}`}
              >
                <List className="mr-2 inline h-4 w-4" />
                List
              </button>
              <button
                type="button"
                onClick={() => dispatch(setTaskView('calendar'))}
                className={`rounded-2xl px-3 py-2 text-sm font-semibold ${taskView === 'calendar' ? 'bg-brand text-white' : 'text-muted'}`}
              >
                <CalendarDays className="mr-2 inline h-4 w-4" />
                Calendar
              </button>
            </div>
            {isAdmin ? (
              <Button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                New task
              </Button>
            ) : null}
          </div>
        }
      />

      <Card className="grid gap-4 xl:grid-cols-[1.5fr,repeat(4,minmax(0,1fr))]">
        <InputField
          label="Search tasks"
          placeholder="Search by title or description"
          value={search}
          onChange={(event) => {
            startTransition(() => {
              setSearch(event.target.value);
              setPage(1);
            });
          }}
        />
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">Project</span>
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="ring-focus min-h-[52px] rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm dark:bg-slate-950/40"
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="ring-focus min-h-[52px] rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm dark:bg-slate-950/40"
          >
            <option value="">All statuses</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">Priority</span>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="ring-focus min-h-[52px] rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm dark:bg-slate-950/40"
          >
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">Sort by</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="ring-focus min-h-[52px] rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm dark:bg-slate-950/40"
          >
            <option value="updatedAt">Recently updated</option>
            <option value="createdAt">Newest created</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
          </select>
        </label>
      </Card>

      {isLoading ? (
        <Card className="h-72 animate-pulse" />
      ) : !tasks.length ? (
        <EmptyState
          title="No tasks found"
          description="Adjust your filters or create a task to start filling the board."
          actionLabel={isAdmin ? 'Create task' : undefined}
          onAction={() => setIsTaskModalOpen(true)}
        />
      ) : null}

      {!isLoading && tasks.length ? (
        <>
          {taskView === 'board' ? (
            <KanbanBoard
              tasks={tasks}
              onSelectTask={(task) => setActiveTaskId(task.id)}
              onStatusChange={(taskId, nextStatus) => updateMutation.mutate({ taskId, payload: { status: nextStatus } })}
            />
          ) : null}

          {taskView === 'list' ? (
            <div className="grid gap-4">
              {tasks.map((task) => (
                <Card key={task.id} className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr,0.7fr,0.6fr,auto]">
                  <div>
                    <button
                      type="button"
                      onClick={() => setActiveTaskId(task.id)}
                      className="text-left font-display text-xl font-bold text-ink"
                    >
                      {task.title}
                    </button>
                    <p className="mt-2 text-sm text-muted">{task.description || 'No description provided.'}</p>
                  </div>
                  <div className="space-y-2 text-sm text-muted">
                    <p>Project: {task.project.title}</p>
                    <p>Assignee: {task.assignee?.name || 'Unassigned'}</p>
                    <p className={isTaskLate(task) ? 'text-danger' : ''}>Due: {formatDate(task.dueDate)}</p>
                  </div>
                  <div className="space-y-2">
                    <StatusBadge value={task.status} />
                    <StatusBadge value={task.priority} type="priority" />
                  </div>
                  <div className="text-sm text-muted">
                    <p>{task.comments.length} comments</p>
                    <p>{task.attachments.length} files</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingTask({
                          ...task,
                          projectId: task.project.id,
                          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''
                        });
                        setIsTaskModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    {isAdmin ? (
                      <Button variant="ghost" className="text-danger" onClick={() => deleteMutation.mutate(task.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          ) : null}

          {taskView === 'calendar' ? (
            <Card className="overflow-hidden">
              <div className="mb-4">
                <h3 className="font-display text-2xl font-bold text-ink">{format(calendarMonth, 'MMMM yyyy')}</h3>
                <p className="text-sm text-muted">Due dates mapped across the current month.</p>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
                  <div key={label}>{label}</div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const tasksForDay = tasks.filter(
                    (task) =>
                      task.dueDate &&
                      format(new Date(task.dueDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                  );

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-32 rounded-[1.2rem] border border-line p-3 ${isSameMonth(day, calendarMonth) ? 'bg-white/40 dark:bg-slate-950/30' : 'bg-slate-100/40 opacity-60 dark:bg-slate-950/10'}`}
                    >
                      <p className="mb-2 text-sm font-semibold text-ink">{format(day, 'd')}</p>
                      <div className="grid gap-2">
                        {tasksForDay.slice(0, 3).map((task) => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => setActiveTaskId(task.id)}
                            className="rounded-xl bg-brand/10 px-2 py-1 text-left text-xs font-semibold text-brand"
                          >
                            {task.title}
                          </button>
                        ))}
                        {tasksForDay.length > 3 ? (
                          <span className="text-xs text-muted">+{tasksForDay.length - 3} more</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : null}

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
      ) : null}

      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit task' : 'Create task'}
        description="Set ownership, priority, dates, and expected task flow."
      >
        <TaskForm projects={projects} defaultValues={editingTask} onSubmit={submitTask} />
      </Modal>

      <Modal
        isOpen={Boolean(activeTask)}
        onClose={() => {
          setActiveTaskId(null);
          setCommentText('');
        }}
        title={activeTask?.title || 'Task details'}
        description={activeTask?.description || 'Detailed view for collaboration, files, and status changes.'}
      >
        {activeTask ? (
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-line bg-white/40 p-4 text-sm dark:bg-slate-950/30">
                <p className="text-muted">Project</p>
                <p className="mt-1 font-semibold text-ink">{activeTask.project.title}</p>
              </div>
              <div className="rounded-[1.5rem] border border-line bg-white/40 p-4 text-sm dark:bg-slate-950/30">
                <p className="text-muted">Assignee</p>
                <p className="mt-1 font-semibold text-ink">{activeTask.assignee?.name || 'Unassigned'}</p>
              </div>
              <div className="rounded-[1.5rem] border border-line bg-white/40 p-4 text-sm dark:bg-slate-950/30">
                <p className="text-muted">Due date</p>
                <p className={`mt-1 font-semibold ${isTaskLate(activeTask) ? 'text-danger' : 'text-ink'}`}>
                  {formatDate(activeTask.dueDate)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatusBadge value={activeTask.status} />
              <StatusBadge value={activeTask.priority} type="priority" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <div className="mb-4 flex items-center gap-2">
                  <MessageSquarePlus className="h-5 w-5 text-brand" />
                  <h3 className="font-display text-xl font-bold text-ink">Comments</h3>
                </div>
                <div className="grid gap-3">
                  {activeTask.comments.map((comment) => (
                    <div key={comment.id} className="rounded-[1.5rem] border border-line bg-white/40 p-4 dark:bg-slate-950/30">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-ink">{comment.author.name}</p>
                        <span className="text-xs text-muted">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted">{comment.content}</p>
                    </div>
                  ))}
                  {!activeTask.comments.length ? <p className="text-sm text-muted">No comments yet.</p> : null}
                </div>
                <div className="mt-4 grid gap-3">
                  <InputField
                    label="Add a comment"
                    textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Add implementation notes, blockers, or updates"
                  />
                  <Button
                    onClick={() =>
                      commentMutation.mutate({
                        taskId: activeTask.id,
                        content: commentText
                      })
                    }
                    disabled={!commentText.trim()}
                  >
                    Post comment
                  </Button>
                </div>
              </Card>

              <Card>
                <div className="mb-4 flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-brand" />
                  <h3 className="font-display text-xl font-bold text-ink">Attachments</h3>
                </div>
                <div className="grid gap-3">
                  {activeTask.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${attachment.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-[1.5rem] border border-line bg-white/40 p-4 text-sm text-brand dark:bg-slate-950/30"
                    >
                      {attachment.originalName}
                    </a>
                  ))}
                  {!activeTask.attachments.length ? <p className="text-sm text-muted">No attachments uploaded yet.</p> : null}
                </div>
                <div className="mt-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-ink">Upload file</span>
                    <input
                      type="file"
                      className="text-sm text-muted"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) {
                          return;
                        }

                        uploadMutation.mutate({ taskId: activeTask.id, file });
                        event.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </Card>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
