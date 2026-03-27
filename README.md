# Task API

## Overview
Task API is a production-ready full-stack task management system. It pairs a robust Node.js and PostgreSQL backend with a modern Next.js frontend to deliver a secure, scalable, and highly performant architecture. The system is designed following strict engineering principles, incorporating raw SQL queries for optimized database interactions, containerization for environment consistency, and comprehensive CI pipelines to ensure reliability.

## Tech Stack
**Backend:**
- Node.js & Express.js
- PostgreSQL (node-postgres, raw SQL)
- JSON Web Token (JWT)
- bcrypt
- Zod (Input Validation)
- Helmet, express-rate-limit, Morgan
- Jest & Supertest (Testing)

**Frontend:**
- Next.js (App Router)
- TypeScript
- TailwindCSS

**Infrastructure:**
- Docker & Docker Compose
- GitHub Actions (CI)

## Features
- **Secure Authentication:** JWT-based user registration and login flows with password hashing.
- **Task Management:** Full Create, Read, Update, and Delete (CRUD) operations for user-specific tasks.
- **Data Integrity:** Strict input validation and sanitization via Zod.
- **Performance & Security:** Implementation of API rate limiting, HTTP security headers, and centralized error handling masking internal SQL exceptions.
- **Advanced UI Capabilities:** Frontend support for task filtering, pagination, and optimistic UI state updates.
- **Containerized Environments:** Fully Dockerized architecture for seamless local development and deployment.
- **Testing & CI:** Automated integration testing and GitHub Actions deployment pipelines.

## Architecture
The backend strictly adheres to a layered architecture pattern, separating HTTP transport, business logic, and data access concerns.

```mermaid
graph TD
    Client[Next.js Client] -->|HTTP Request| Controller[Controller Layer]
    Controller --> Service[Service Layer]
    Service --> Repository[Repository Layer / Raw SQL]
    Repository --> Database[(PostgreSQL)]

    Service --> Validation[Zod Validation]
    Controller --> Middleware[Express Middleware]

    Middleware --> Auth[Auth Interceptor]
    Middleware --> Error[Error Handler]
    Middleware --> Security[Helmet & Rate Limit]
```

## Authentication Flow
The system utilizes stateless JWT authentication. Tokens are issued upon successful login and must be provided in the `Authorization` header for protected routes.

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB

    Client->>API: POST /auth/register
    API->>API: Validate input (Zod)
    API->>API: Hash password (bcrypt)
    API->>DB: INSERT INTO users
    API-->>Client: 201 Created

    Client->>API: POST /auth/login
    API->>DB: SELECT user
    API->>API: Verify password
    API->>API: Sign JWT
    API-->>Client: 200 OK + JWT Token

    Client->>API: Request Protected Route + Bearer Token
    API->>API: Verify JWT (Middleware)
    API->>DB: Execute Query (User ID)
    API-->>Client: 200 OK
```

## API Examples

### Register
**Request:**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
**Response (201 Created):**
```json
{
  "data": {
    "id": "c623719c-85a7-4712-a8c0-bc6f77ffbc95",
    "email": "user@example.com"
  },
  "error": null
}
```

### Login
**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
**Response (200 OK):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "error": null
}
```

### Create Task
**Request:**
```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Build distributed caching layer"
}
```
**Response (201 Created):**
```json
{
  "data": {
    "id": "e4a2bc19-5d66-4876-9d32-9cb12431fa12",
    "title": "Build distributed caching layer",
    "completed": false,
    "user_id": "c623719c-85a7-4712-a8c0-bc6f77ffbc95",
    "created_at": "2023-11-01T10:00:00Z"
  },
  "error": null
}
```

### Get Tasks
**Request:**
```http
GET /tasks?page=1&limit=10&completed=false
Authorization: Bearer <token>
```
**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "e4a2bc19-5d66-4876-9d32-9cb12431fa12",
      "title": "Build distributed caching layer",
      "completed": false,
      "user_id": "c623719c-85a7-4712-a8c0-bc6f77ffbc95",
      "created_at": "2023-11-01T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  },
  "error": null
}
```

### Dashboard (Task Table)
![Dashboard](docs/screenshots/dashboard.png)

### Edit Task Modal
![Edit Modal](docs/screenshots/edit_modal.png)

### Success Notifications
![Success Toast](docs/screenshots/toast.png)

### Login Page
![Login](docs/screenshots/login.png)

## Database Schema
The database operates on a relational model enforcing strict foreign key constraints and cascading deletions.

```mermaid
erDiagram
    USERS {
        uuid id PK
        text email UK "NOT NULL"
        text password "NOT NULL"
    }
    TASKS {
        uuid id PK
        text title "NOT NULL"
        boolean completed "DEFAULT false"
        timestamp created_at "NOT NULL"
        uuid user_id FK "ON DELETE CASCADE"
    }
    USERS ||--o{ TASKS : "owns"
```

## Running the Project

### Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://postgres:postgres@task-postgres:5432/taskdb
JWT_SECRET=production_grade_secret_key
PORT=3000
FRONTEND_URL=http://localhost:3001
NODE_ENV=development
```

### Starting the Infrastructure
Ensure Docker is running, then execute:
```bash
docker-compose up --build -d
```
The backend API will be available at `http://localhost:3000`.

### Starting the Frontend
```bash
cd task-api-frontend
npm install
npm run dev
```
The client will be accessible at `http://localhost:3001`.

## CI/CD
The project utilizes GitHub Actions for Continuous Integration. The pipeline automatically:
- Installs all Node dependencies.
- Provisions an isolated PostgreSQL instance for testing.
- Executes the Jest and Supertest test suites against the database.
- Builds and publishes the Docker image to the GitHub Container Registry.

## Design Decisions

- **Raw SQL over ORM:** Evaluated Prisma and Sequelize, but opted for raw SQL via `pg` to maximize query optimization, reduce abstraction overhead, and maintain explicit control over indexing and execution plans.
- **JSON Web Tokens (JWT):** Selected for stateless, scalable authentication, allowing the API to remain RESTful and horizontally scalable without session affinity requirements.
- **Docker Containerization:** Adopted to ensure complete parity between local development, testing, and production environments, effectively eliminating the "works on my machine" anti-pattern in deployment operations.
- **Layered Architecture:** Implemented to enforce strict separation of concerns. Controllers strictly handle HTTP transport, while Services manage business rules. This significantly improves testability and code maintainability.

## Future Improvements
- Implement Redis for caching frequently accessed user data and rate limiting state.
- Introduce robust cursor-based pagination for highly efficient task querying at scale.
- Integrate comprehensive API documentation using Swagger/OpenAPI.
- Implement Role-Based Access Control (RBAC) to support administrative functionalities.

## Author
Bedir Avşar
Backend Developer
