# WOZCODE Setup Report

**Project:** `owl-website`
**Generated:** 2026-05-15
**Target environment:** Windows · Claude Code (CLI) · Next.js 15 + React 19 + TS 5

This report is a **persistent record** of the WOZCODE install on this machine
plus a complete, copy-pasteable runbook for the steps that have to run on
Windows. Fill in the **VERIFICATION OUTPUT** boxes as you go — they're the
official record of what was actually installed.

---

## 1. Why WOZCODE

> Smarter tools for Claude Code that reduce token usage and cost. Replaces
> built-in file tools with optimized alternatives — fewer tokens per tool
> call means cheaper sessions that compound over time.
> — [WithWoz/wozcode-plugin README](https://github.com/WithWoz/wozcode-plugin)

**The mechanic, in one sentence:** vanilla Claude Code does "find and edit 3
files" in ~12 tool calls (3× Glob + 3× Grep + 3× Read + 3× Edit). WOZCODE
collapses that to roughly 2 calls (one batched search, one batched edit).
Token volume falls because intermediate output stops being re-read as input
on every step.

**Source links (verify before each install on a new machine):**
- Code: https://github.com/WithWoz/wozcode-plugin
- Marketing + how-it-works: https://www.wozcode.com/ · https://www.wozcode.com/how-it-works
- YC company page: https://www.ycombinator.com/companies/woz
- Product Hunt: https://www.producthunt.com/products/wozcode

---

## 2. Variants — what to install

There's **one** official source:

| Variant | Source | Status | Verdict |
|---|---|---|---|
| `WithWoz/wozcode-plugin` | github.com/WithWoz · marketplace `woz@wozcode-marketplace` | **Official.** Linked from wozcode.com + YC + Product Hunt. | **Install this.** |
| Forks | several forks visible on GitHub | Community forks — no auth flow, no support guarantees. | Skip. |
| `uipro-cli`-style npm wrapper | not advertised by Woz | Doesn't exist for WOZCODE — Woz ships as a Claude Code marketplace plugin only. | Skip. |

If you ever see a different `npm install -g wozcode` claim or a different
GitHub org, treat it as untrusted until verified against wozcode.com.

---

## 3. Environment audit

### What was detected from the sandbox

| Field | Value |
|---|---|
| Repo | `owl-website` (this directory) |
| Project type | Next.js 15.5.18 + React 19 + TypeScript 5.6 |
| Tailwind | 3.4.14 |
| Node target | 22 (`@types/node@^22.0.0`); no `engines` field |
| Existing Claude Code plugins | `nextlevelbuilder/ui-ux-pro-max-skill` (per CLAUDE.md) |
| Project-scope skill | `.claude/skills/ui-ux-pro-max/SKILL.md` |
| Wozcode references in repo before this install | none |
| Backups created | `CLAUDE.md.bak-<timestamp>-pre-wozcode`, `SETUP_MCP.md.bak-<timestamp>-pre-wozcode` |

### What couldn't be detected remotely (fill in)

```text
[ ] node --version           = _________________________ (expect: v20.x or v22.x)
[ ] npm --version            = _________________________ (expect: 10.x+)
[ ] claude --version         = _________________________ (Claude Code CLI version)
[ ] where claude             = _________________________ (Windows PATH location)
[ ] claude mcp list (before) = _________________________
[ ] Windows ExecutionPolicy  = _________________________ (Get-ExecutionPolicy)
```

To capture all six in one paste:

```powershell
Write-Host "node="    -NoNewline; node --version
Write-Host "npm="     -NoNewline; npm --version
Write-Host "claude="  -NoNewline; claude --version
Write-Host "where claude="; where.exe claude
Write-Host "mcp list:"; claude mcp list
Write-Host "ExecutionPolicy="; Get-ExecutionPolicy
```

---

## 4. Prerequisites — required + how to fix if missing

| Need | Check | If missing |
|---|---|---|
| **Node.js 20+** | `node --version` | Install LTS from https://nodejs.org/, OR via winget: `winget install OpenJS.NodeJS.LTS` |
| **npm 10+** | `npm --version` | Comes with Node. If old: `npm install -g npm@latest` |
| **Claude Code CLI** | `claude --version` | https://docs.claude.com/en/docs/claude-code/install — or `npm install -g @anthropic-ai/claude-code` |
| **Browser available** | Default browser launches for OAuth | If SSH/headless: use `/woz-login --token` paste mode (§7.2) |
| **PowerShell execution policy** | `Get-ExecutionPolicy` returns `RemoteSigned` or `Unrestricted` | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` (one-time, requires elevation only if `LocalMachine` is locked) |
| **No PATH collision on `claude`** | `where.exe claude` returns ONE path | If multiple paths, the wrong `claude` may load. See §10. |
| **`%APPDATA%\npm` and `%APPDATA%\claude` writable** | Default for current user | If denied, `Set-Acl` or run install elevated once |

No API keys, tokens, or `.env` entries are required.

---

## 5. The install — exact commands to run

Run the four blocks below in order. Each one has an "expected output" line
beneath it; if your real output doesn't match, jump to §10 troubleshooting
before continuing.

### Block A — pre-flight (PowerShell)

```powershell
cd "C:\Users\Ricko\OneDrive\Documents\Claude\Projects\OWL Website Build\owl-website"
node --version
npm --version
claude --version
claude mcp list
```

Expected: each version line prints; `claude mcp list` runs cleanly (may
return zero servers or whatever you already installed — both fine).

### Block B — install (inside Claude Code)

```powershell
claude
```

Then inside the Claude Code session:

```
/plugin marketplace add WithWoz/wozcode-plugin
/plugin install woz@wozcode-marketplace
```

Expected: each `/plugin` command confirms with a success message. The
marketplace is fetched from `github.com/WithWoz/wozcode-plugin`.

### Block C — restart (PowerShell)

```powershell
exit          # leaves the Claude Code session
claude
```

Expected: a fresh prompt. Look for the **`woz:code`** badge at the right
side of the input bar. If absent, see §10.

### Block D — login + verify (inside Claude Code)

```
/woz-login
```

Expected: browser opens, sign in (free; no card; corporate-email gets the
$200/mo savings tier instead of $100). When done, status displays as logged
in. Tokens are stored in Claude Code's user-scope credential store — NOT in
this repo, NOT in `.env*`.

```
/woz-status
```

Expected: `authenticated as <your email>`.

```
/woz
```

Expected: autocomplete shows `/woz-login`, `/woz-logout`, `/woz-status`,
`/woz-recall`, `/woz-savings`, `/reload-plugins`.

---

## 6. Configuration changes recorded

### Files modified

| File | Change |
|---|---|
| `CLAUDE.md` | Added **Claude Code Plugins** table listing WOZCODE and UI UX Pro Max |
| `SETUP_MCP.md` | Added **§9 WOZCODE** with install / verify / commands / disable |
| `WOZCODE_SETUP_REPORT.md` | This file — created in this turn |

### Files NOT modified

- `package.json` — WOZCODE is not an npm dep
- `next.config.ts` — no runtime touchpoint
- `.env`, `.env.local`, `.env.local.example` — no secrets to add
- `.gitignore` — no new ignores needed
- `tailwind.config.ts`, `globals.css` — unrelated to WOZCODE
- Project source under `src/` — untouched

### Backups created (in repo root)

- `CLAUDE.md.bak-<UTC timestamp>-pre-wozcode`
- `SETUP_MCP.md.bak-<UTC timestamp>-pre-wozcode`

Roll back any of the two modifications by copying the relevant `.bak` file
back over the original.

---

## 7. Environment variables / secrets

**None required.** WOZCODE auth = browser OAuth, tokens are stored in
Claude Code's user-scope credential store. Specifically you do NOT need to:

- Add any `WOZ_*` or `WOZCODE_*` env var to `.env.local`
- Set any Vercel env
- Add anything to `next.config.ts → env`
- Run `claude mcp add` with an `-e` flag

If a future WOZCODE release introduces optional API-key auth, the official
upstream README at `WithWoz/wozcode-plugin` is the source of truth. Re-check
before adding anything here.

### 7.2 Headless / SSH fallback (no browser)

If your default browser cannot launch (CI agents, raw SSH session):

1. Run `/woz-login` — Claude Code prints an auth URL.
2. Open the URL manually in any browser on any machine.
3. Complete sign-in. The success page displays a JSON token blob.
4. Copy it back into Claude Code:

```
/woz-login --token '{"access_token":"...","refresh_token":"..."}'
```

The pasted token JSON is single-quoted so PowerShell doesn't interpolate.

---

## 8. Verification matrix

Tick each row as you complete it. The values you paste become the official
"what shipped on this machine" record.

| # | Check | Command | Expected | Actual |
|---|---|---|---|---|
| 1 | Marketplace registered | `/plugin marketplace list` | shows `WithWoz/wozcode-plugin` | ☐ |
| 2 | Plugin installed | `/plugin list` | shows `woz@wozcode-marketplace` enabled | ☐ |
| 3 | Agent badge visible | Look at input bar in Claude Code | `woz:code` badge present | ☐ |
| 4 | Slash commands present | Type `/woz` | autocomplete shows 6 commands | ☐ |
| 5 | Authenticated | `/woz-status` | `authenticated as <email>` | ☐ |
| 6 | Subagents resolve | Ask Claude "use woz:explore to list every file under src/lib/seed" | response uses `woz:explore` | ☐ |
| 7 | Savings instrumented | After a multi-file task: `/woz-savings` | non-zero roundtrips/tokens/cost lines | ☐ |
| 8 | MCP host healthy | `claude mcp list` | no errored servers | ☐ |

---

## 9. Test task — exercise the batched search-edit path

Once verification rows 1–5 are ticked, run this in Claude Code from the
repo root. It exercises the exact pattern WOZCODE is designed to shrink
(multi-file search + per-file edit + verification).

```
Find every component file under src/components/marketing that imports
`headers` from `@/lib/images` but no longer uses any specific header
constant (the variable is imported but unreferenced). Return:
  (a) the file path
  (b) the exact import line
  (c) the smallest possible diff to remove the unused import.
Then verify your diffs would still typecheck.
```

What to watch for in the response:

- The lead agent reports as `woz:code`.
- It delegates to `woz:explore` for the read-only pass.
- Total tool-call count printed at the bottom is materially lower than the
  same task on a vanilla Claude Code session.
- `/woz-savings` after the task shows accumulated savings.

A smaller smoke test if you want a 30-second check first:

```
Use woz:explore to list every file under src/lib/seed and report the
export count per file in one table.
```

---

## 10. Troubleshooting matrix

| Symptom | Likely cause | Fix |
|---|---|---|
| `/plugin marketplace add` errors `unknown command` | Claude Code is too old | Upgrade: `npm install -g @anthropic-ai/claude-code@latest` then `exit`+`claude` |
| `/plugin install` errors `marketplace not found` | Marketplace add didn't actually complete (network / TLS) | Re-run `/plugin marketplace add WithWoz/wozcode-plugin`; check `claude mcp list` doesn't show config errors |
| Plugin installs but no `woz:code` badge | Forgot the restart between Block B and C | `exit` + `claude` |
| `/woz-login` says browser blocked / never opens | Default browser broken, or running over SSH | Use `/woz-login --token` paste mode (§7.2) |
| `Get-ExecutionPolicy` returns `Restricted` and `claude` fails to spawn helpers | PowerShell policy blocks plugin scripts | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `where.exe claude` lists two paths | Old global install + new install side-by-side | Uninstall the older one: `npm uninstall -g <old package>` or remove the stray dir from PATH |
| `/woz-status` says `not authenticated` after browser flow | Token didn't reach the credential store | Try `/woz-logout` then `/woz-login` again; if the auth URL never returned a token, use the paste-mode fallback |
| Agent loads but tools time out | `claude mcp list` may show a stalled server | `claude mcp list`; restart Claude Code; if persistent, `/plugin disable` + `/plugin enable` |
| Savings report is empty | Haven't done a tool-using task yet | Run §9 test task first |
| `/woz-savings` complains about quota | Free tier $100/mo cap | Sign up with a corporate email for the $200/mo tier, or wait for monthly rollover |
| OneDrive sync lag corrupts a file mid-edit | Pause OneDrive while running multi-file edits | OneDrive icon → pause syncing → run the task → resume |
| Plugin appears stale after upstream release | Cached marketplace fetch | `/reload-plugins`; if that doesn't help, `/plugin marketplace remove WithWoz/wozcode-plugin` + add + install again, then restart |

If a fix isn't here, file at https://github.com/WithWoz/wozcode-plugin/issues
with `/woz-status` output redacted of email and a `claude mcp list` snippet.

---

## 11. Disable / uninstall

| Goal | Command(s) |
|---|---|
| Pause WOZCODE for this session only | `/plugin disable woz@wozcode-marketplace` |
| Resume | `/plugin enable woz@wozcode-marketplace` |
| Full removal | `/plugin marketplace remove WithWoz/wozcode-plugin` |
| Sign out (clears stored tokens) | `/woz-logout` |
| Restore previous configs from backup | Rename `*.bak-<timestamp>-pre-wozcode` files back over `CLAUDE.md` / `SETUP_MCP.md` |

---

## 12. Best-practice prompts (maximise the WOZCODE win)

WOZCODE's gain compounds when prompts map cleanly to "one batched search + one
batched edit + one verification". Patterns:

1. **Multi-file in one prompt.** "Update all 12 page files…" > 12 separate
   prompts.
2. **State exclusions in the same sentence.** "All call sites of `<BannerHero>`
   that pass an explicit `banner` prop, ignoring the alias `<HeroBanner>`."
3. **Use `woz:explore` for audits.** It's read-only and runs on Haiku — cheap
   and fast. Save `woz:code` for actual writes.
4. **Prefer semantic queries.** "All component files that import `headers`
   but don't use any constant" beats grepping for a literal string.
5. **Batch the verification.** End edit prompts with "then list the diff lines
   and confirm typecheck would pass" — one verify pass, not one per file.
6. **`/woz-recall` at the start of a new session** on the same project, so
   the agent doesn't re-explore the codebase from scratch.
7. **Keep CLAUDE.md tight.** Long context inflates every turn — WOZCODE can't
   compress the rules file.

---

## 13. Final verification status

> Update this section after running through §5 and §8.

```text
Install status            : ☐ not started   ☐ in progress   ☐ complete
Auth status               : ☐ not started   ☐ logged in     ☐ logged out
Agent badge visible       : ☐ no   ☐ yes
Slash commands available  : ☐ no   ☐ yes
First test task executed  : ☐ no   ☐ yes
Savings report shows data : ☐ no   ☐ yes

Notes / errors encountered:
- _______________________________________________
- _______________________________________________
- _______________________________________________

Signed off : ____________________   Date : _______________
```

---

## 14. Appendix — files this report touches

**Created:**
- `WOZCODE_SETUP_REPORT.md` (this file)
- `CLAUDE.md.bak-<UTC timestamp>-pre-wozcode`
- `SETUP_MCP.md.bak-<UTC timestamp>-pre-wozcode`

**Modified:**
- `CLAUDE.md` — added `Claude Code Plugins` table with WOZCODE + UI UX Pro Max rows
- `SETUP_MCP.md` — added `§9 WOZCODE` section + cross-reference link

**Untouched on purpose:**
- `package.json` (no npm dep)
- `package-lock.json`
- `next.config.ts`, `tailwind.config.ts`, `globals.css`
- `.env*`
- All files under `src/`
