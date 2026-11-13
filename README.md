# Task Manager

A full-stack task manager: a **NestJS** REST API (`/api`, SQLite via Prisma) and a **Next.js + shadcn/ui** frontend (`/web`).

- Create, edit, delete and list tasks (title, description, status, due date)
- Status badges you can click to change a task's status in one step
- Filter by status, sort by due date or creation date, search by text
- Loading, error and empty states, plus a toast on every successful action
- Confirmation dialog before deleting
- Light and dark theme, animated progress overview, keyboard shortcuts (`N` new task, `/` search)
- Input validation with DTOs and `class-validator` (400 on bad input, 404 on unknown id)
- Unit tests and end-to-end tests for the API
- Docker Compose setup for both apps

## Structure

| Folder | Description |
| ------ | ----------- |
| `api/` | NestJS backend (REST API, Prisma + SQLite) |
| `web/` | Next.js frontend (App Router, shadcn/ui, Tailwind 4) |
| `docker-compose.yml` | Runs both apps with one command |

## Prerequisites

- **Node.js 22 or newer** (developed and tested on Node 24.16). Prisma 7 needs Node 20.19+, 22.12+ or 24+.
- **npm 10 or newer** (comes with Node). The repo uses npm and `package-lock.json`.
- Nothing else. SQLite is embedded, so there is no database server to install.

## Run locally

Open two terminals, starting from the repository root.

### 1. Backend (terminal 1)

```bash
cd api
npm install
npm run db:deploy
npm run start:dev
```

- `npm install` also runs `prisma generate` (via `postinstall`) to create the database client.
- `npm run db:deploy` applies the migration and creates the SQLite file `api/dev.db`.
- The API now listens on **http://localhost:4000**. Try http://localhost:4000/tasks.

### 2. Frontend (terminal 2)

```bash
cd web
npm install
npm run dev
```

Open **http://localhost:3000**.

### Environment variables

Both apps have working defaults, so **you do not need to create any `.env` file** for the commands above. To change them, copy the example files:

```bash
cp api/.env.example api/.env
cp web/.env.example web/.env.local
```

| App | Variable | Default | Purpose |
| --- | -------- | ------- | ------- |
| api | `PORT` | `4000` | Port the API listens on |
| api | `WEB_ORIGIN` | `http://localhost:3000` | Frontend origin allowed by CORS |
| api | `DATABASE_URL` | `file:./dev.db` | SQLite file, relative to `api/` |
| web | `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Base URL of the API (read at build/start time) |

If you change the API port or the frontend port, update `NEXT_PUBLIC_API_URL` and `WEB_ORIGIN` to match, then restart both apps.

### Production build (optional)

```bash
# api
cd api && npm run build && npm run start:prod

# web
cd web && npm run build && npm run start
```

## Docker Compose (optional)

With Docker running:

```bash
docker compose up --build
```

- Web: http://localhost:3000, API: http://localhost:4000/tasks
- The API container applies the migration on start. Data is kept in the `api-data` volume, so it survives restarts. Remove it with `docker compose down -v`.
- `NEXT_PUBLIC_API_URL` is baked into the web image at build time (set in `docker-compose.yml`).

> Note: I could only validate `docker-compose.yml` and run the same start commands locally. I did not get to build the images on my machine, so if Docker misbehaves, use the "Run locally" steps above.

## Tests

```bash
cd api
npm test          # unit tests (service, mocked Prisma)
npm run test:e2e  # end-to-end tests: real HTTP requests against a throwaway SQLite file
npm run lint

cd ../web
npm run lint
```

## API reference

Base URL: `http://localhost:4000`

| Method | Path | Description | Success |
| ------ | ---- | ----------- | ------- |
| GET | `/tasks` | List tasks. Query: `status` (`TODO`, `IN_PROGRESS`, `DONE`), `sort` (`dueDate` or `createdAt`), `order` (`asc` or `desc`) | 200 |
| GET | `/tasks/:id` | Get one task | 200 |
| POST | `/tasks` | Create a task | 201 |
| PATCH | `/tasks/:id` | Update any subset of fields | 200 |
| DELETE | `/tasks/:id` | Delete a task | 204 |

Task shape:

```json
{
  "id": 1,
  "title": "Write the README",
  "description": "Optional, up to 1000 characters",
  "status": "TODO",
  "dueDate": "2026-12-01T00:00:00.000Z",
  "createdAt": "2026-11-13T09:00:00.000Z"
}
```

Validation rules: `title` is required (trimmed, max 120 characters); `description` is optional (max 1000); `status` must be `TODO`, `IN_PROGRESS` or `DONE` (default `TODO`); `dueDate` is an optional ISO date (`2026-12-01`) and can be `null`. Unknown fields are rejected. Invalid input returns **400** with a list of messages, an unknown id returns **404**, and a non-numeric id returns **400**.

Example:

```bash
curl -X POST http://localhost:4000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship it","status":"IN_PROGRESS","dueDate":"2026-12-01"}'
```

## Design notes

- **Prisma 7 with SQLite** through the `better-sqlite3` driver adapter. The generated client lives in `api/src/generated` (git-ignored) and is rebuilt by `npm install`.
- **Sorting is done by the server** (due dates, with tasks that have no due date last). **Search and the status filter run in the browser**, so the overview counters always reflect every task.
- A small typed `fetch` client (`web/src/lib/api.ts`) turns every failure, including "API is down", into a readable message shown in the UI.
- Dates are shown in UTC so a due date never shifts by a day depending on the viewer's time zone.

## How I used AI

I used claude code and chatgpt to get help for design and working tasks in this project.

What it helped with: scaffolding the NestJS and Next.js projects, the Prisma schema and migration, the CRUD module, DTOs, the unit and e2e tests, the shadcn/ui components, the Dockerfiles, and the visual redesign.

What I had to correct in the generated code:

- The Prisma CLI resolved to an incompatible release candidate, so I pinned `prisma` to the same version as the client and added a `postinstall` to generate the client.
- shadcn's setup pointed the sans font variable at itself, which fell back to a serif font; I pointed it at the Geist font.
- Fixed UI bugs found while testing in the browser: the status dropdown stayed open after choosing, the search icon was hidden behind the blurred input, and the table truncated titles on phones.
- Reviewed and ran the API with curl, the unit and e2e tests, and the UI by hand (create, edit, validation errors, delete confirmation, filter, sort, search, dark mode, mobile width).
- I could not build the Docker images on my machine, and I say so in this README rather than claim otherwise.

I read and can explain every file in this repository.

## Author

Kaveesha Athukorala
