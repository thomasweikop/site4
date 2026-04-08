<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deploy Policy

- This repository deploys to production through GitHub -> Vercel.
- Production target for this app is the Vercel project `nis2-prod`.
- Production domains for this app are managed under `complycheck.dk` and `weikop.me`.
- Fly.io is available in the broader stack, but it is not the default deployment target for this repository unless explicitly changed.
- When changes are meant to go live, they are not considered deployed until they are pushed to the correct GitHub branch and Vercel has deployed the linked production project.
- Be explicit about the difference between local code changes and live production state.
