# Task API (Node.js + PostgreSQL)

A backend REST API for task management built with Node.js, Express, and PostgreSQL.  
This project focuses on clean structure, authentication, testing, and basic production practices.

---

## Features

- JWT-based authentication (register & login)
- User-specific task management
- Create, list, and delete tasks
- PostgreSQL integration using raw SQL (pg)
- Input validation
- Centralized error handling middleware
- Environment-based configuration
- Docker support
- Automated tests (Jest)
- CI pipeline with GitHub Actions
- Isolated test database setup

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- pg (node-postgres)
- JSON Web Token (JWT)
- bcrypt
- Jest
- Docker
- GitHub Actions

---

## Project Structure

```
controllers/        # Request handlers
routes/             # API routes
middleware/         # Auth and error handling
db/                 # Database connection and queries
validation/         # Input validation
tests/              # Tests
.github/workflows/  # CI pipeline
```

---

## Installation

```bash
git clone https://github.com/BedirAvsar/task-api.git
cd task-api
npm install
```

---

## Environment Variables

Create a `.env` file:

```
DATABASE_URL=postgresql://localhost:5432/taskdb
JWT_SECRET=your_secret_key
PORT=3000
```

---

## Database Setup

```sql
CREATE DATABASE taskdb;

\c taskdb

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL
);
```

---

## Running the Application

```bash
node index.js
```

Server runs on:

```
http://localhost:3000
```

---

## Docker

Build image:

```bash
docker build -t task-api .
```

Run container:

```bash
docker run -p 3000:3000 --env-file .env task-api
```

---
## Docker Image (GitHub Container Registry)

You can pull and run the prebuilt Docker image directly:

```bash
docker pull ghcr.io/bediravsar/task-api:latest

docker run -p 3000:3000 \
  -e DATABASE_URL=your_database_url \
  -e JWT_SECRET=your_secret \
  ghcr.io/bediravsar/task-api:latest
```

This image is automatically built and published via GitHub Actions.
----

## Testing

```bash
npm test
```

- Uses a separate test database
- Runs automatically in CI pipeline

---

## CI Pipeline

GitHub Actions pipeline includes:

- Dependency installation
- PostgreSQL test database setup
- Running test suite

---

## Deployment

Base URL:

```
https://task-api-wo1v.onrender.com
```

---

## API Endpoints

### Auth

POST /auth/register

```
{
  "email": "user@example.com",
  "password": "password"
}
```

POST /auth/login

Returns JWT token.

---

### Tasks

GET /tasks  
Returns tasks for authenticated user

POST /tasks

```
{
  "title": "my task"
}
```

DELETE /tasks/:id  
Deletes task if it belongs to the user

---

## Authentication

All task endpoints require:

```
Authorization: Bearer <token>
```

---

## Notes

- Passwords are hashed using bcrypt
- Each user can only access their own tasks
- Uses raw SQL instead of ORM
- Basic validation and error handling are implemented

---

## Screenshot

Docker image running locally:

![Docker Screenshot](https://github.com/user-attachments/assets/7203a4f7-036d-4762-a25e-6f5edc56fb4b)

## Status

This project is suitable for learning and demonstrates backend fundamentals.  
Some improvements can still be made for production use:

- Advanced validation
- Logging
- Rate limiting
- Caching (Redis)
- Pagination and filtering

---

## Author

Bedir Avşar
