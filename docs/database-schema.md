# Database Schema Explanation

## User

Stores identity, password hash, role, avatar, and timestamps.

## RefreshToken

Stores hashed refresh tokens for rotation, revocation, and persistent login.

## PasswordResetToken

Stores hashed reset tokens with expiry and usage tracking.

## Project

Top-level planning document with title, description, creator, deadline, status, progress, and embedded member records.

### Embedded `members[]`

Each member entry stores:

- `userId`
- `role`
- `joinedAt`

## Task

Work item tied to a project. Includes assignee, creator, status, priority, due date, completion time, and timestamps.

### Embedded `comments[]`

Each comment stores:

- `authorId`
- `content`
- `createdAt`
- `updatedAt`

### Embedded `attachments[]`

Each attachment stores:

- `uploadedById`
- `filename`
- `originalName`
- `url`
- `mimeType`
- `size`
- `createdAt`

## Notification

Per-user event feed for assignments, updates, project invites, and comments.

## ActivityLog

Cross-cutting audit and activity-feed collection for auth, project, task, and comment events.

## Why MongoDB + Mongoose

- Flexible document structure for embedded comments, attachments, and membership records
- Good fit for fast-moving collaboration data with nested task activity
- Straightforward population of related users and projects where needed
- Reduced schema-management overhead for this kind of product workflow application
