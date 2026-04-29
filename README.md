# Verify Dashboard

Fullstack project with React frontend and NestJS backend.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Query
- Axios
- Redux Toolkit
- TailwindCSS

### Backend

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- bcrypt
- Swagger

## Setup

Install dependencies:

```bash
npm install
```

Create backend environment file:

```bash
cp apps/server/.env.example apps/server/.env
```

Start database:

```bash
npm run db:up
```

Start backend / frontend:

```bash
npm run dev
```

## URLs

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:3000
```

Swagger:

```txt
http://localhost:3000/api/docs
```
