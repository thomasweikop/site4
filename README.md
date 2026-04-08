# SITE4

Landing page for Weikop's NIS2 offer, built with Next.js 16 App Router.

## Local development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

## Deploy flow

The intended deployment path is:

1. Code lives in GitHub.
2. Vercel is connected directly to the GitHub repository.
3. Every push to the deployed branch triggers a new Vercel deployment.
4. The contact form sends leads through MailerSend in the deployed environment.

## Production contract

For this repository, production means:

- GitHub repo: `thomasweikop/site4`
- Production branch: `main`
- Vercel project: `nis2-prod`
- Production delivery: Vercel
- Production domains live under `complycheck.dk` and `weikop.me`

Fly.io is part of the broader infrastructure toolbox, but it is not the
default production target for this app unless that decision is changed
explicitly.

Use this command before a release push:

```bash
npm run release:check
```

It verifies the current branch, GitHub remote, linked Vercel project, and
whether the worktree is clean enough for a production push.

This repo now includes two guardrails for that flow:

- `.github/workflows/ci.yml` runs lint + build on pushes and pull requests.
- `scripts/validate-env.mjs` blocks Vercel builds if the required MailerSend/contact env vars are missing.

## Required environment variables

Copy `.env.example` to `.env.local` for local work.

Required on Vercel:

- `MAILERSEND_API_TOKEN`
- `MAILERSEND_FROM_EMAIL`
- `NIS2_CONTACT_EMAIL`
- `DATABASE_URL` for Supabase/Postgres-backed sessions, users, logs and superadmin
- `SUPERADMIN_SESSION_SECRET` for signed superadmin login sessions

Optional fallback / legacy variables still supported by the mail helper:

- `INVITE_FROM_EMAIL`
- `RESEND_API_KEY`

## Vercel setup checklist

In Vercel Project Settings:

1. Connect the correct GitHub repository.
2. Confirm the production branch is the branch you actually deploy from.
3. Add the required environment variables for `Production`.
4. Add the same environment variables for `Preview` if preview deployments should also send mail correctly.
5. Redeploy after any environment variable change.

## Supabase setup checklist

This app uses plain Postgres over `DATABASE_URL`, so Supabase is used as the
database backend rather than through the Supabase JavaScript client.

For Vercel/serverless use, copy the **Supavisor transaction mode** connection
string from Supabase into `DATABASE_URL`. The app already uses `postgres` with
`prepare: false`, which matches Supabase's guidance for transaction mode.

1. Open the correct Supabase project.
2. Go to `Connect`.
3. Copy the **Transaction pooler** connection string (port `6543`).
4. Put that full connection string into Vercel as `DATABASE_URL`.
5. Keep `sslmode=require` if Supabase includes it in the string.
6. No manual SQL migration is required for the MVP; the app creates the
   required tables automatically on first use.

## Database-backed sessions and superadmin

The scan now persists report sessions in Postgres when `DATABASE_URL` is set.
Superadmin also stores admins, logs, specialist overrides, question overrides
and scoring overrides in the same database. The app creates the required tables
automatically on first use, so no separate migration step is required for the
MVP.

Without `DATABASE_URL`, the UI falls back to browser-local storage for sessions.

## Notes

- `npm run build` skips deploy-env validation outside Vercel, but Vercel builds will fail fast if MailerSend/contact configuration is missing.
