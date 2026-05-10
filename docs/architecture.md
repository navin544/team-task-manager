# Architecture Diagram

## System Overview

```mermaid
flowchart LR
  User[Browser Client] --> FE[React + Vite SPA]
  FE -->|REST + Cookies + Bearer JWT| API[Express API]
  FE -->|WebSocket| WS[Socket.io Server]
  API --> Mongoose[Mongoose ODM]
  Mongoose --> DB[(MongoDB)]
  API --> Files[(Local Upload Storage)]
  API --> Mail[SMTP Provider]
  API --> Docs[OpenAPI YAML]
```

## Backend Layers

```mermaid
flowchart TD
  Routes --> Middleware
  Middleware --> Controllers
  Controllers --> Services
  Services --> Models[Mongoose Models]
  Services --> Utils
  Services --> Jobs
```

## Frontend Layers

```mermaid
flowchart TD
  Router --> Layouts
  Layouts --> Pages
  Pages --> Components
  Pages --> Query[React Query Services]
  Pages --> Auth[Auth Context]
  Pages --> Redux[Redux UI State]
```

## Design Notes

- Authentication uses short-lived access tokens and HTTP-only refresh cookies.
- MongoDB stores the domain model, with embedded task comments and attachments plus referenced users/projects.
- Socket.io is used for realtime invalidation of dashboard and task views when notifications are emitted.
- Validation is centralized with Zod on the backend and form-level schema validation on the frontend.
