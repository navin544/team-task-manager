# API Reference

Base URL: `http://localhost:5000/api`

## Authentication

### `POST /auth/register`

Registers a new member user.

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "Strong@123"
}
```

### `POST /auth/login`

Returns:

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Alex Morgan",
      "email": "alex@example.com",
      "role": "MEMBER"
    },
    "accessToken": "jwt"
  }
}
```

### `POST /auth/refresh`

Rotates the refresh token cookie and returns a fresh access token.

### `POST /auth/forgot-password`

```json
{
  "email": "alex@example.com"
}
```

### `POST /auth/reset-password`

```json
{
  "token": "<reset-token>",
  "password": "NewStrong@123"
}
```

## Users

### `GET /users`

Returns the visible user directory.

### `PUT /users/:id`

Supports:

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "avatar": "https://example.com/avatar.png",
  "role": "ADMIN"
}
```

`role` updates are restricted to admins.

## Projects

### `POST /projects`

Admin only.

```json
{
  "title": "Platform Refresh",
  "description": "Rebuild billing workflows",
  "deadline": "2026-06-30T12:00:00.000Z",
  "status": "ACTIVE",
  "memberIds": ["uuid-1", "uuid-2"]
}
```

### `GET /projects`

Query params:

- `page`
- `limit`
- `search`
- `status`

### `PUT /projects/:id`

Supports title, description, deadline, status, and `memberIds`.

### `POST /projects/:id/members`

```json
{
  "userId": "uuid"
}
```

or

```json
{
  "email": "member@example.com"
}
```

## Tasks

### `POST /tasks`

Admin only.

```json
{
  "title": "Refine onboarding flow",
  "description": "Update empty states and validation copy",
  "projectId": "project-uuid",
  "assignedToId": "user-uuid",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2026-06-01T14:30:00.000Z"
}
```

### `GET /tasks`

Query params:

- `page`
- `limit`
- `projectId`
- `status`
- `priority`
- `assignedTo`
- `search`
- `sortBy`
- `sortOrder`

### `PUT /tasks/:id`

- Admin can edit full task details.
- Member can update status only for their own assigned tasks.

### `POST /tasks/:id/attachments`

Upload multipart form field `file`.

## Comments

### `POST /comments`

```json
{
  "taskId": "task-uuid",
  "content": "Blocked by missing product copy."
}
```

### `GET /comments/:taskId`

Returns task comments ordered oldest to newest.

## Analytics

### `GET /dashboard/summary`

Returns:

- Summary cards
- Status breakdown
- Priority breakdown
- Completion trend
- Recent activity
- User performance

## Notifications

### `GET /notifications`

Returns latest notifications for the current user.

### `PATCH /notifications/:id/read`

Marks one notification as read.
