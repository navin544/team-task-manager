import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';

const AppShell = lazy(() =>
  import('../layouts/AppShell').then((module) => ({ default: module.AppShell }))
);
const LoginPage = lazy(() =>
  import('../pages/LoginPage').then((module) => ({ default: module.LoginPage }))
);
const SignupPage = lazy(() =>
  import('../pages/SignupPage').then((module) => ({ default: module.SignupPage }))
);
const DashboardPage = lazy(() =>
  import('../pages/DashboardPage').then((module) => ({ default: module.DashboardPage }))
);
const ProjectsPage = lazy(() =>
  import('../pages/ProjectsPage').then((module) => ({ default: module.ProjectsPage }))
);
const ProjectDetailsPage = lazy(() =>
  import('../pages/ProjectDetailsPage').then((module) => ({ default: module.ProjectDetailsPage }))
);
const TasksPage = lazy(() =>
  import('../pages/TasksPage').then((module) => ({ default: module.TasksPage }))
);
const TeamMembersPage = lazy(() =>
  import('../pages/TeamMembersPage').then((module) => ({ default: module.TeamMembersPage }))
);
const ProfilePage = lazy(() =>
  import('../pages/ProfilePage').then((module) => ({ default: module.ProfilePage }))
);
const SettingsPage = lazy(() =>
  import('../pages/SettingsPage').then((module) => ({ default: module.SettingsPage }))
);
const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage }))
);
const ResetPasswordPage = lazy(() =>
  import('../pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage }))
);

export function AppRouter() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted">
          Loading workspace...
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/team-members" element={<TeamMembersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
