# Coffee Ninja – Customer Inquiry Management System

A full-stack customer inquiry management application built with React, Node.js, Express and PostgreSQL.

Staff members can sign in, create customer inquiries, search and filter inquiries, view inquiry details, and update inquiry statuses.

## Technology Stack

- Frontend: React 19, Vite
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: JWT and bcryptjs
- Testing: Vitest, React Testing Library, Node.js test runner and Supertest

## Project Structure

```text
coffee-ninja/
├── client/
│   ├── src/
│   │   ├── components/
│   │   └── services/
│   └── package.json
├── server/
│   ├── database/
│   │   └── schema.sql
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── test/
│   ├── db.js
│   ├── server.js
│   └── package.json
├── README.md
└── DECISIONS.md
```

## Prerequisites

Install the following before running the application:

- Node.js and npm
- PostgreSQL
- Git

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/devFelina/coffee-ninja-cims.git
cd coffee-ninja-cims
```

### 2. Set up the database

Create a PostgreSQL database:

```sql
CREATE DATABASE coffee_ninja;
```

Run the schema from the project root:

```bash
psql -U YOUR_POSTGRES_USER -d coffee_ninja -f server/database/schema.sql
```

Replace `YOUR_POSTGRES_USER` with your PostgreSQL username.

### 3. Configure the backend

Open the server directory:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coffee_ninja
DB_USER=YOUR_POSTGRES_USER
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
```

Replace the example values with your local PostgreSQL credentials and a secure JWT secret.

### 4. Create a staff account

The application does not include a public staff registration page. Create a password hash from the `server` directory:

```bash
node -e "console.log(require('bcryptjs').hashSync('YourOwnPassword123!', 10))"
```

Copy the generated hash.

Open PostgreSQL:

```bash
psql -U YOUR_POSTGRES_USER -d coffee_ninja
```

Insert a staff account, replacing the example name, email and hash:

```sql
INSERT INTO users (name, email, password_hash)
VALUES ('Demo Staff', 'staff@example.com', 'PASTE_GENERATED_HASH_HERE');
```

Exit PostgreSQL:

```sql
\q
```

Use the email and password you selected to sign in.

### 5. Start the backend

From the `server` directory:

```bash
npm run dev
```

The backend runs at:

`http://localhost:5005`

Health check:

`http://localhost:5005/api/health`

### 6. Start the frontend

Open a second terminal and navigate to the client directory:

```bash
cd ~/Desktop/coffee-ninja/client
npm install
npm run dev
```

Open the frontend address displayed in the terminal, normally:

`http://localhost:5173`

## Main Features

- Staff login using email and password.
- JWT-based authentication.
- Create customer inquiries with name, contact, subject and description.
- View inquiry details.
- Search inquiries and filter by status.
- Update inquiry statuses: New, In Progress and Resolved.
- Restrict inquiry access to the staff member who created it.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Staff login |
| GET | `/api/inquiries` | List and filter inquiries |
| POST | `/api/inquiries` | Create an inquiry |
| GET | `/api/inquiries/:id` | View an inquiry |
| PATCH | `/api/inquiries/:id/status` | Update inquiry status |

Protected inquiry endpoints require a valid Bearer token.

## Running Tests

### Backend

From the `server` directory:

```bash
npm test
```

### Frontend

From the `client` directory:

```bash
npm test
```

### Production build

From the `client` directory:

```bash
npm run build
```

## Implementation Notes

- Staff members can access only inquiries they created.
- Inquiry status values are restricted to New, In Progress and Resolved.
- Duplicate inquiries are allowed.
- The dashboard supports manual refreshing rather than real-time synchronisation between browser tabs.
- The frontend currently uses the local backend URL `http://localhost:5005/api`.

For further details about technical decisions, assumptions and trade-offs, see [DECISIONS.md](DECISIONS.md).