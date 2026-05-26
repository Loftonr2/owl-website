# Supabase — OWL Sing Together

This folder contains:

- `migrations/` — versioned SQL migrations. Run in order.
- `config.toml` — Supabase CLI config for local dev.

## First-time setup (production)

1. Create a project at <https://supabase.com/dashboard/new>.
2. Copy the project URL + anon key + service-role key into `.env.local`:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL` (= `SUPABASE_URL`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (= `SUPABASE_ANON_KEY`)
3. Run the migration. Two options:

   **Option A — Dashboard SQL Editor (easiest):**
   - Open the SQL Editor in your Supabase project.
   - Paste the contents of `migrations/0001_initial.sql`.
   - Click Run.

   **Option B — Supabase CLI:**
   ```powershell
   npm install -g supabase
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
4. In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` and your production callback URLs to the allow-list.
5. In **Authentication → Email Templates**, switch the "Magic Link" template to use your domain copy (OWL voice, not Supabase defaults).
6. Seed your first admin user:
   - In **Authentication → Users → Add user → Send invitation**, invite `larissa@owlsingtogether.com` and `rickoflv@gmail.com`.
   - After they sign in once, open **Table Editor → profiles** and set `role = 'owner'` on both rows.

## Type generation

After any schema change, regenerate the TypeScript types:

```powershell
npm run supabase:gen-types
```

This writes `src/types/database.ts` (used by the Supabase clients for inference).

## Conventions

- Every new migration is a new numbered file (`0002_*.sql`, `0003_*.sql`). Never edit a shipped migration.
- Every table gets RLS enabled in the same migration that creates it.
- Every mutation route in the app should write an `audit_log` row.
