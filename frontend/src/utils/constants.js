import {
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users
} from 'lucide-react';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Tasks', to: '/tasks', icon: ClipboardList },
  { label: 'Team Members', to: '/team-members', icon: Users },
  { label: 'Settings', to: '/settings', icon: Settings }
];

export const TASK_STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'];
export const TASK_PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];
export const PROJECT_STATUS_OPTIONS = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'];
