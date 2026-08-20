# AI Native Workforce Program — AI Task Manager (PILOT02)

A local-first task planning app (plain HTML/CSS/JS, no build step) used as the shared
base for the **PILOT02** sessions. It manages priorities, deadlines, estimates,
dependencies, delegated work, follow-ups, daily reports, and weekly views.

## What's inside

| File | Purpose |
|------|---------|
| `index.html`, `style.css`, `script.js` | The task manager (plan, filter, update, and report) |
| `.devcontainer/devcontainer.json` | Codespaces config so the app runs in the browser, no local install |
| `.gitignore` | OS/editor noise only — **intentionally does not list `.env`** (see below) |
| `.env.example` | Safe placeholder showing the secrets pattern (no real keys) |
| `.github/workflows/ci.yml` | CI "secret guard": fails a PR if `.env` or a hardcoded key is committed |
| `.github/CODEOWNERS` | Requires engineer/instructor review on every PR |
| `.github/dependabot.yml` | Keeps CI actions updated |

## Run it

- **In Codespaces:** click **Code → Create codespace on main**, then open `index.html`
  with Live Preview / Live Server (port 5500 auto-forwards).
- **Locally:** run `python3 -m http.server 5500`, then open `http://localhost:5500`.

Tasks are stored in the browser's local storage. Google Calendar sync is intentionally
left as a later integration because it requires OAuth credentials and a backend.

> 📦 **Extending the project?** As soon as you add a dependency, a runtime, or a new
> port, the app code and the Codespaces config must stay in sync. See
> **[CODESPACES.md](CODESPACES.md)** — when a rebuild is needed, and how to propagate
> the config change to the rest of the cohort (commit + PR, same as code).

## Two exercises this template supports

**Basics — change the "Add" button to red.**
Create a branch (e.g. `feature/red-button`), ask the AI to make the Add button red,
verify in the browser, commit, push, open a PR.

**Practical — manage secrets safely.**
Create a `.env` (dummy key), **add `.env` to `.gitignore` yourself**, verify it is no
longer tracked (`Configure → Verify → Commit`), commit, push, open a PR, pass CI, get
an engineer review, merge.

> ⚠️ **Instructors:** do **not** pre-add `.env` to `.gitignore`. Students adding it
> themselves *is* the Practical lesson. Real API keys are never used — dummy keys only.

## The three security rules (Practical session)

1. **Never paste confidential info into AI** (internal data, personal info, unreleased code).
2. **Never hardcode passwords / API keys** — keep them in `.env`, excluded from Git.
3. **Never trust AI-generated code blindly** — an engineer reviews before merge.
