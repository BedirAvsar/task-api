# Task API (Node.js + PostgreSQL)

A simple REST API for managing user-specific tasks. This project demonstrates a backend application with authentication, database integration, and basic API structure using Node.js and PostgreSQL.

---

## Features

- User registration and login (JWT-based authentication)
- Create task
- List tasks (user-specific)
- Delete task
- PostgreSQL integration using raw SQL (pg)
- Error handling middleware
- Environment-based configuration

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- pg (node-postgres)
- JSON Web Token (JWT)
- bcrypt

---

## Installation

Clone the repository:

```bash
git clone https://github.com/BedirAvsar/task-api.git
cd task-api
```

Install dependencies:

```bash
npm install
```

Run the server:

```bash
node index.js
```

Server will start on:

```
http://localhost:3000
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://localhost:5432/taskdb
JWT_SECRET=your_secret_key
PORT=3000
```

---

## Database Setup

Make sure PostgreSQL is running, then:

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

## API Endpoints

### Auth

#### POST /auth/register
Register a new user.

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

#### POST /auth/login
Authenticate user and return JWT.

```json
{
  "email": "user@example.com",
  "password": "password"
}
```
###Authorization header example:
Authorization: Bearer your_token_here
---

### Tasks

#### GET /tasks
Returns all tasks for the authenticated user.

#### POST /tasks
Create a new task.

```json
{
  "title": "my task"
}
```

#### DELETE /tasks/:id
Delete a task by ID (only if it belongs to the authenticated user).

---

## Docker

Build the image:

```bash
docker build -t task-api .
```

Run the container:

```bash
docker run -p 3000:3000 \
--env-file .env \
task-api

---

## Deployment

Base URL:

https://task-api-wo1v.onrender.com

---

## Notes

- All task endpoints require a valid JWT token in the `Authorization` header.
- Passwords are hashed using bcrypt before storing.
- Each user can only access their own tasks.
- This project uses raw SQL queries via `pg` (no ORM).
- Basic validation and error handling are implemented, but not exhaustive.

---

## Screenshot

Docker image running locally:

![Docker Screenshot](https://github.com/user-attachments/assets/7203a4f7-036d-4762-a25e-6f5edc56fb4b)

---

## Status

This project is a learning-focused backend application and may require additional improvements for production use.
