import { execSync } from "node:child_process";

function lastCommitDate(): string {
  try {
    return execSync("git log -1 --format=%cI", { cwd: process.cwd() })
      .toString()
      .trim();
  } catch {
    return new Date().toISOString();
  }
}

// Evaluated once at build time (static export), so it reflects the last
// commit baked into the deployed build rather than the moment a visitor loads the page.
export const LAST_UPDATED_ISO = lastCommitDate();
