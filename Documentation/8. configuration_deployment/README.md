# 8. Configuration and Deployment

[Back to documentation index](../README.md)

## Prerequisites

- Git
- Node.js 18+ and npm
- Java 17
- Maven 3.9+
- PostgreSQL 14+
- Redis 6+

## Frontend environment

Create `frontend/.env` locally. Do not commit real credentials.

```env
VITE_API_URL=http://localhost:8080
VITE_ENABLE_API=false
```

`VITE_ENABLE_API=false` keeps the application in local/seeded mode. Set it to `true` to activate authentication, LMS, assessment, file, student, and analytics API paths when Spring, PostgreSQL, Redis, and required headers are ready.

The repository still contains an unused Google client placeholder from an earlier prototype. Google Forms is not an assessment type in the current UI and no Google credential is required for current assessment flows.

## Backend environment

`application.yml` reads:

```env
PORT=8080
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=postgresql://localhost:5432/lms_course
DB_USERNAME=postgres
DB_PASSWORD=replace_me
REDIS_URL=redis://localhost:6379
```

The configured JDBC URL is `jdbc:${DATABASE_URL}`. Therefore `DATABASE_URL` should not already include the `jdbc:` prefix.

## Local startup

### Backend

```bash
cd backend
mvn clean test
mvn spring-boot:run
```

Flyway runs on startup and Hibernate validates the resulting schema.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL: `http://127.0.0.1:5173`.

## Production builds

```bash
cd frontend
npm ci
npm run build
```

```bash
cd backend
mvn clean verify
mvn package
```

The frontend artifact is `frontend/dist/`. The backend artifact is under `backend/target/`.

## Health verification

1. Confirm PostgreSQL accepts connections.
2. Confirm Redis is available or define an intentional cache fallback strategy.
3. Start Spring Boot and confirm Flyway completes.
4. Open `/swagger-ui.html`.
5. Call a read endpoint with tenant/user headers.
6. Build and serve the frontend.
7. Test Admin with API mode enabled.
8. Test Teacher/Student prototype flows and verify localStorage behavior.

## Deployment checklist

- Use secret management for database and Redis credentials.
- Persist the backend `uploads/` directory or replace it with object storage before production.
- Restrict CORS to approved frontend origins.
- Replace mock authentication headers with a trusted identity/token flow.
- Hash passwords; do not retain plaintext checks.
- Disable or restrict Swagger in production as required.
- Set `show-sql=false` in production.
- Add database backups and migration rollback procedures.
- Configure Redis timeouts and monitoring.
- Serve the frontend through HTTPS with cache headers for hashed assets.
- Add observability for API latency, errors, cache hit rate, and database pool health.
- Add CI steps for frontend build and backend tests.

## Git workflow

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c docs/<topic>
```

After validation:

```bash
git add Documentation
git commit -m "docs: add LMS technical documentation"
git push -u origin docs/<topic>
```

Open a pull request to `main` and request review from frontend and backend owners.
