const requiredOnVercel = [
  {
    name: "MAILERSEND_API_TOKEN",
    reason: "used to send leads from the contact form through MailerSend",
  },
  {
    name: "MAILERSEND_FROM_EMAIL",
    reason: "used as the verified sender address for MailerSend",
  },
  {
    name: "NIS2_CONTACT_EMAIL",
    reason: "used as the inbox that receives new lead notifications",
  },
  {
    name: "DATABASE_URL",
    reason: "used for Supabase/Postgres-backed sessions, users, logs and superadmin",
  },
  {
    name: "SUPERADMIN_SESSION_SECRET",
    reason: "used to sign and verify the protected superadmin login session cookie",
  },
];

const isVercelBuild = process.env.VERCEL === "1";

if (!isVercelBuild) {
  console.log("Skipping deploy env validation outside Vercel.");
  process.exit(0);
}

const missing = requiredOnVercel.filter(({ name }) => {
  const value = process.env[name];
  return !value || !value.trim();
});

if (missing.length === 0) {
  console.log("Vercel env validation passed.");
  process.exit(0);
}

console.error("Vercel deployment blocked because required environment variables are missing:");

for (const item of missing) {
  console.error(`- ${item.name}: ${item.reason}`);
}

console.error("");
console.error(
  "Add the missing variables in Vercel Project Settings -> Environment Variables before redeploying.",
);
console.error(
  "Make sure they are set for the environments you actually deploy from, typically Production and Preview.",
);

process.exit(1);
