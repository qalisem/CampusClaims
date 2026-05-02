# Self-hosted Supabase for CampusClaims

This folder is the **official** `supabase/docker` self-host stack with a CampusClaims-specific `.env` and a schema migration.

## First-time setup (already done; for reference)

1. Cloned `supabase/supabase` into here.
2. Generated `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY`, `POSTGRES_PASSWORD`, `DASHBOARD_PASSWORD`, `VAULT_ENC_KEY`, `SECRET_KEY_BASE` and wrote them into `.env`.
3. The Next.js app's `.env.local` was repointed:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<the ANON_KEY from this folder's .env>
   ```

## Running the stack

From this directory (`/Users/qasemali/CampusClaims/supabase`):

```bash
docker compose up -d              # start everything (~12 services)
docker compose ps                 # check health
docker compose logs -f db         # follow a single service
docker compose down               # stop (data persists in volumes/db/data)
docker compose down -v            # stop AND wipe data
```

## Applying the schema

The schema lives in `migrations/00001_campusclaims.sql`. Apply it once after the first `up`:

```bash
docker compose exec -T db psql -U postgres -d postgres < migrations/00001_campusclaims.sql
```

It's idempotent — safe to re-run.

## Useful URLs

- App API gateway (Kong): http://localhost:8000
- Studio (admin UI):       http://localhost:8000  (basic auth: `admin` / see `.env` `DASHBOARD_PASSWORD`)
- Postgres direct:         localhost:5432         (user `postgres`, pwd in `.env` `POSTGRES_PASSWORD`)
