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

This repo now includes two guardrails for that flow:

- `.github/workflows/ci.yml` runs lint + build on pushes and pull requests.
- `scripts/validate-env.mjs` blocks Vercel builds if the required MailerSend/contact env vars are missing.

## Required environment variables

Copy `.env.example` to `.env.local` for local work.

Required on Vercel:

- `MAILERSEND_API_TOKEN`
- `MAILERSEND_FROM_EMAIL`
- `NIS2_CONTACT_EMAIL`

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

## Notes

- A local repo remote is not configured in this workspace right now, so GitHub linkage still needs to be connected on your machine or in the hosted repo settings.
- `npm run build` skips deploy-env validation outside Vercel, but Vercel builds will fail fast if MailerSend/contact configuration is missing.
