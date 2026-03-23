# Task API (Node.js + PostgreSQL)

A REST API for task management built with Node.js, Express, and PostgreSQL.  
This project focuses on clean architecture, authentication, testing, and basic production practices.

---

## Features

- JWT-based authentication (register & login)
- User-specific task management
- Create, list, update, and delete tasks
- PostgreSQL integration using raw SQL (pg)
- Input validation with Zod
- Centralized error handling (middleware)
- Rate limiting (express-rate-limit)
- HTTP request logging (Morgan)
- Environment-based configuration
- Docker and Docker Compose support
- Automated tests (Jest & Supertest)
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
- Zod
- Morgan
- express-rate-limit
- Jest & Supertest
- Docker
- GitHub Actions

---

## Project Structure

```
controllers/        # Request handlers
routes/             # API routes
middleware/         # Authentication and error handling
db/                 # Database connection and queries
validation/         # Zod validation schemas
tests/              # Test files
.github/workflows/  # CI configuration
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

```env
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
npm start
```

Development mode:

```bash
npm run dev
```

Server runs on:

```
http://localhost:3000
```

---

## Docker

```bash
docker build -t task-api .

docker run -p 3000:3000 --env-file .env task-api
```

---

## Docker Image (GitHub Container Registry)

You can pull and run the prebuilt Docker image:

```bash
docker pull ghcr.io/bediravsar/task-api:latest

docker run -p 3000:3000 \
  -e DATABASE_URL=your_database_url \
  -e JWT_SECRET=your_secret \
  ghcr.io/bediravsar/task-api:latest
```

The image is automatically built and published via GitHub Actions.

---

## Testing

```bash
npm test
```

- Uses a separate test database  
- Runs automatically in the CI pipeline  

---

## CI Pipeline

GitHub Actions pipeline includes:

- Installing dependencies  
- Setting up PostgreSQL test database  
- Running test suite  

---

## API Endpoints

### Auth

POST /auth/register

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

POST /auth/login  
Returns a JWT token.

---

### Tasks

All task endpoints require authentication:

```
Authorization: Bearer <token>
```

GET /tasks  
Returns tasks for the authenticated user

POST /tasks

```json
{
  "title": "Task title"
}
```

PUT /tasks/:id  
Updates a task

DELETE /tasks/:id  
Deletes a task

---

## Example Query Parameters (Planned)

The API is designed to support pagination and filtering for scalability.

Example:

```
GET /tasks?page=1&limit=10&search=test
```

This allows:

- Pagination with page and limit  
- Basic filtering with search  

---

## Notes

- Passwords are hashed using bcrypt  
- Users can only access their own data  
- Raw SQL is used instead of an ORM  
- Validation and error handling are centralized  
- Rate limiting and logging are implemented  

---

## Screenshot

Docker image running locally:

![Docker Screenshot](https://github.com/user-attachments/assets/7203a4f7-036d-4762-a25e-6f5edc56fb4b)

---

## Status

This project demonstrates backend fundamentals with a production-oriented approach.

Possible improvements:

- Caching (Redis)  
- Pagination and filtering  

---

## Author

Bedir Avşar
