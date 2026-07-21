# Working with Codespaces — and keeping the config in sync (infra as code)

A Codespace is a full dev environment that runs in your browser. You never install
anything on your own PC. **Code → Create codespace on main** launches it.

## The one idea to understand

Your repo holds **two kinds of things**, and both travel together in Git:

| | What it is | Example files |
|---|---|---|
| **Application code** | The app itself | `index.html`, `style.css`, `script.js` |
| **Infrastructure config** | How the Codespace is built (the "infra as code") | `.devcontainer/devcontainer.json` |

Changing app code and changing the environment are **not the same action**. Knowing
which one you're doing tells you whether you need to rebuild.

## Which did I change? → what to do

| You changed... | Rebuild needed? | What to do |
|---|---|---|
| HTML / CSS / JS (app logic, colors, layout) | ❌ No | Just save and refresh the browser / Live Preview |
| Added a **dependency** (e.g. `npm install`) | ✅ Yes | Add it to `postCreateCommand`, then rebuild |
| Added a **runtime/tool** (Node version, Python, a CLI) | ✅ Yes | Add a `feature` or change `image`, then rebuild |
| Added a **service on a new port** (e.g. a backend on :3000) | ✅ Yes | Add the port to `forwardPorts`, then rebuild |
| Need a **VS Code extension** for the workflow | ✅ Yes | Add it to `customizations.vscode.extensions`, then rebuild |
| Need an **environment variable / secret** | ⚠️ Depends | Use `.env` (app, gitignored) or a **Codespaces secret** (env). Never hardcode. |

> Rule of thumb: **app code = refresh. Environment needs = edit `devcontainer.json` + rebuild.**

## How to apply a config change

Editing `devcontainer.json` does **not** change the Codespace you're already in.
You must rebuild:

1. Open the Command Palette (`F1` or `Ctrl/Cmd+Shift+P`).
2. Run **Codespaces: Rebuild Container** (use **Full Rebuild** if a cached layer is stale).
3. Wait for the container to rebuild — your files are preserved.

## How the change reaches everyone else (the "propagation")

This is the whole point of infra-as-code: **you propagate a config change the exact same
way you propagate a code change — commit it and open a PR.**

```
edit .devcontainer/devcontainer.json
      │
      ├─ Rebuild Container   → your own Codespace now matches the config
      │
      └─ commit + push + PR  → after merge, the NEXT person who creates a
                                Codespace (or rebuilds) gets the same environment
```

If you change the environment but **don't commit `devcontainer.json`**, your Codespace
works but everyone else's is now different — the classic "works on my machine" problem.
Committing the config is what keeps the whole cohort consistent.

## Example: adding a small backend later

Say the AI extends the project with a Node backend on port 3000:

```jsonc
// .devcontainer/devcontainer.json
{
  "image": "mcr.microsoft.com/devcontainers/universal:2",
  "forwardPorts": [5500, 3000],                 // ← new port
  "postCreateCommand": "npm install",           // ← install deps on create
  "customizations": { "vscode": { "extensions": ["ritwickdey.LiveServer"] } }
}
```

Then: **Rebuild Container** (so your session gets it) **and** commit the file (so the
team gets it). Both steps — one without the other leaves things out of sync.

## Secrets do NOT go in the config

`devcontainer.json` is committed to Git, so **never put keys or passwords in it.**
- App runtime secrets → `.env` (excluded via `.gitignore` — see the Practical session).
- Environment-level secrets → **Codespaces / account secrets** (Settings → Codespaces →
  Secrets), injected as env vars at runtime, never stored in the repo.

This is the same rule as the security module, applied to infrastructure.
