// Run by .github/workflows/monster-review.yml on every PR.
// Posts the monster's pedantic review, then force-merges the PR (squash).
import { reviewMarkdown } from "../lib/monster.mjs";

const { GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER } = process.env;
const api = `https://api.github.com/repos/${GITHUB_REPOSITORY}`;
const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

async function gh(method, path, body) {
  const res = await fetch(`${api}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

const comment = (body) => gh("POST", `/issues/${PR_NUMBER}/comments`, { body });

// GitHub computes mergeability asynchronously; poll until it settles.
let pr;
for (let i = 0; i < 10; i++) {
  pr = (await gh("GET", `/pulls/${PR_NUMBER}`)).data;
  if (pr.mergeable !== null) break;
  await new Promise((r) => setTimeout(r, 3000));
}

if (pr.state !== "open") {
  console.log(`PR #${PR_NUMBER} is ${pr.state}; nothing to do.`);
  process.exit(0);
}

const ref = { number: pr.number, author: pr.user.login, title: pr.title, branch: pr.head.ref };

if (pr.mergeable === false) {
  await comment(
    `## 👹 MERGE CONFLICT\n\nI cannot even *begin* to complain about this until you resolve your conflicts with \`${pr.base.ref}\`. ` +
      `Rebase or merge \`${pr.base.ref}\` into your branch and push; I will be back.`,
  );
  process.exit(0);
}

await comment(reviewMarkdown(ref));

const merge = await gh("PUT", `/pulls/${PR_NUMBER}/merge`, {
  merge_method: "squash",
  commit_title: `${pr.title} (#${pr.number}) — force-merged by the Monster`,
});

if (!merge.ok) {
  console.error("Merge failed", merge.status, merge.data);
  await comment(
    `## 👹 The merge button resisted me\n\nGitHub said: \`${merge.status} ${merge.data.message ?? ""}\`. ` +
      `Fix it and push again. (PRs touching \`.github/workflows\` can't be auto-merged — ask a host.)`,
  );
  process.exit(1);
}

console.log(`Force-merged #${PR_NUMBER}: ${merge.data.sha}`);
