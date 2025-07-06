# Total

## Overview

A minimalist, web-based expense tracker.

## Local Development

1. Copy the environment file and populate it with your secrets:

```bash
cp .env.example .env.local
```

2. Install the dependencies:

```bash
npm install
```

3. Set up local PostgreSQL database:

```bash
docker run --name postgres -e POSTGRES_PASSWORD=password -p "5432:5432" postgres
```

4. Run a migration to set up the database schema:

```bash
cd prisma
npx prisma migrate dev
```

5. Run the local development server:

```bash
npm run dev
