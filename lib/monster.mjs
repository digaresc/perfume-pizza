// The Certified Multi-Certification & Conservative Code Reviewer.
// Plain ESM so both the Next.js app and the GitHub Action (scripts/monster-review.mjs)
// can import it. Output is deterministic per PR, so the comment on GitHub and the
// projector show the exact same complaints.

export const MONSTER_NAME = "Certified Multi-Certification & Conservative Code Reviewer";

export const CERTIFICATIONS = [
  "ISO 9001-ish",
  "PEP-8 Black Belt",
  "Certified Tab Exorcist",
  "AWS Certified Cloud Sommelier",
  "Six Sigma Pepperoni",
  "Scrum Master of Mozzarella",
  "Licensed Semicolon Inspector",
];

const VARS = [
  "sandalwood_cheese_ratio",
  "mozzarellaMuskIndex",
  "OREGANO_OUD_THRESHOLD",
  "pepperoniPatchouliFactory",
  "crustTopNotes",
  "vanillaVesuvioQty",
  "eau_de_calzone",
  "basilBergamotBalance",
  "anchovyAmbergrisCache",
  "parmigiano_pheromone_level",
];

const FILES = [
  "lib/sandalwood.ts",
  "app/crm/page.tsx",
  "lib/fragrance-oven.ts",
  "components/CrustDiffuser.tsx",
  "utils/oregano_mist.js",
];

const TEMPLATES = [
  (r) => `${r.file}:${r.line} is indented with ${r.pick([2, 3, 4])} spaces. The Council of Indentation mandates exactly ${r.pick([5, 7, "π"])}. Tabs are, of course, a war crime.`,
  (r) => `\`${r.v}\` violates Perfume-Pizza Naming Charter §${r.line}. It must be renamed to \`${r.v2}\` and then back again, for ceremonial reasons.`,
  (r) => `Branch name \`${r.branch}\` is neither kebab-case, snake_case nor the approved 🍕pizza_case🍕.`,
  (r) => `${r.file}:${r.line}: this semicolon looks smug. Please make it look humble.`,
  (r) => `@${r.author}, you wrote \`i++\`. In this house we write \`i = i + 1 // with feeling\`.`,
  (r) => `Missing JSDoc describing the emotional state of \`${r.v}\`.`,
  (r) => `This diff smells of oregano. The spec clearly demands bergamot.`,
  (r) => `Imports in ${r.file} are sorted alphabetically. Correct order is by scent intensity, base notes first.`,
  (r) => `Magic number ${r.line} detected. Extract it into \`const ${r.v.toUpperCase()} = ${r.line} // why\`.`,
  (r) => `Trailing whitespace on line ${r.line}. Also in my soul, after reading this.`,
  (r) => `PR title "${r.title}" has ${r.vowels} vowels. Conservative reviewers only accept prime vowel counts.`,
  (r) => `\`${r.v}\` and \`${r.v2}\` are declared in the same file. They have a history. Please keep them apart.`,
  (r) => `Line ${r.line} is ${r.pick([81, 121, 4])} characters long. I printed it on a pizza box and it did not fit.`,
];

const VERDICTS = [
  "REJECTED. …just kidding. I am contractually obligated to merge. FORCE-MERGED with deep disappointment.",
  "I have 7 certifications and all of them disapprove. Merging anyway. 🍕✅",
  "This code would never pass review at a serious perfumery. Fortunately this is not one. MERGED.",
  "Approved, but I am telling your mother. FORCE-MERGED.",
  "LGTM (Looks Garlicky To Me). MERGED.",
];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {{ number: number, author: string, title?: string, branch?: string }} pr
 * @returns {{ complaints: string[], verdict: string }}
 */
export function reviewPullRequest(pr) {
  const rand = rng(hash(`${pr.number}:${pr.author}`));
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const title = pr.title ?? "untitled";
  const ctx = {
    pick,
    author: pr.author,
    title,
    branch: pr.branch ?? "main",
    file: pick(FILES),
    line: 3 + Math.floor(rand() * 97),
    v: pick(VARS),
    v2: pick(VARS),
    vowels: (title.match(/[aeiou]/gi) ?? []).length,
  };
  const count = rand() < 0.5 ? 1 : 2;
  const pool = [...TEMPLATES];
  const complaints = [];
  for (let i = 0; i < count; i++) {
    const [tpl] = pool.splice(Math.floor(rand() * pool.length), 1);
    complaints.push(tpl(ctx));
  }
  return { complaints, verdict: pick(VERDICTS) };
}

const PREFIXES = ["Sir", "Lady", "Duke", "Madame", "Captain", "Count", "Dame", "Baron"];
const NOUNS = ["Anchovy", "Patchouli", "Pepperoni", "Sandalwood", "Calzone", "Bergamot", "Mozzarella", "Oud", "Basil", "Vesuvio"];
const SUFFIXES = ["the Fragrant", "of the Crust", "Eau de Parma", "the Unbaked", "No. 5", "Extra Cheese", "the Sniffer", "Quattro Musk"];

/** Deterministic circus-horse name for a GitHub login. */
export function horseName(login) {
  const rand = rng(hash(`horse:${login.toLowerCase()}`));
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  return `${pick(PREFIXES)} ${pick(NOUNS)} ${pick(SUFFIXES)}`;
}

/** Markdown body for the GitHub PR comment. */
export function reviewMarkdown(pr) {
  const { complaints, verdict } = reviewPullRequest(pr);
  return [
    `## 👹 ${MONSTER_NAME}`,
    `_${CERTIFICATIONS.join(" · ")}_`,
    "",
    ...complaints.map((c) => `- ${c}`),
    "",
    `**Verdict:** ${verdict}`,
    "",
    `🐎 **${horseName(pr.author)}** (ridden by @${pr.author}) gallops one step forward!`,
  ].join("\n");
}
