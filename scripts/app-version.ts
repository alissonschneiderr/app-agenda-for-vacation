// Feature 014 (R3): versão do app = data UTC do build + 7 primeiros caracteres do commit.
import { execSync } from 'node:child_process';

export function appVersion(now = new Date()): string {
  const date = now.toISOString().slice(0, 10);
  let sha = process.env.GITHUB_SHA?.slice(0, 7);
  if (!sha) {
    try {
      sha = execSync('git rev-parse --short=7 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {
      sha = 'dev';
    }
  }
  return `${date} · ${sha}`;
}
