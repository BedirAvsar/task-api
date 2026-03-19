# Task API (Node.js + PostgreSQL)

A simple REST API for managing tasks. This project demonstrates a basic backend application with database integration, clean structure, and error handling.

---

## Features

- Create task (UUID)
- List all tasks
- Delete task
- PostgreSQL integration
- Error handling
- Clean and structured code

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- pg (node-postgres)

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

## Database Setup

Make sure PostgreSQL is running, then:

```sql
CREATE DATABASE taskdb;

\c taskdb

CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);
```

---

## API Endpoints

### GET /tasks

Returns all tasks.

---

### POST /tasks

Create a new task.

```json
{
  "title": "my task"
}
```

---

### DELETE /tasks/:id

Delete a task by ID.

---

## Environment Variables (optional)

You can use a `.env` file:

```env
DATABASE_URL=postgresql://localhost:5432/taskdb
PORT=3000
```
