import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function readJson(relativePath) {
  const fullPath = resolve(root, relativePath);

  if (!existsSync(fullPath)) {
    return null;
  }

  return JSON.parse(readFileSync(fullPath, "utf8"));
}

function run(command) {
  return execSync(command, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function printStatus(label, value) {
  console.log(`${label}: ${value}`);
}

function printCheck(ok, message) {
  console.log(`${ok ? "OK" : "WARN"}  ${message}`);
}

const expectedBranch = "main";
const expectedRemoteFragment = "github.com/thomasweikop/site4.git";
const expectedVercelProject = "nis2-prod";

const branch = run("git branch --show-current");
const originUrl = run("git remote get-url origin");
const statusLines = run("git status --short");
const vercelProject = readJson(".vercel/project.json");

printStatus("Branch", branch || "(unknown)");
printStatus("Origin", originUrl || "(missing)");
printStatus(
  "Vercel project",
  vercelProject?.projectName || "(missing .vercel/project.json)",
);
printStatus(
  "Worktree",
  statusLines.length === 0 ? "clean" : "has local changes",
);

console.log("");

printCheck(
  branch === expectedBranch,
  `deploy branch should be '${expectedBranch}'`,
);
printCheck(
  originUrl.includes(expectedRemoteFragment),
  `origin should point to '${expectedRemoteFragment}'`,
);
printCheck(
  vercelProject?.projectName === expectedVercelProject,
  `Vercel project should be '${expectedVercelProject}'`,
);
printCheck(
  statusLines.length === 0,
  "worktree should be clean before a release push",
);

console.log("");
console.log(
  "Production flow for this repo: GitHub -> Vercel project 'nis2-prod' -> domains under complycheck.dk / weikop.me",
);
