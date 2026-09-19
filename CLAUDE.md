# CLAUDE.md: deploy the portfolio to GitHub Pages

This file gives you (Claude Code) the context and steps to deploy this project. Read it fully before running anything. Work step by step, show the user each command before running it, and stop and ask whenever a step says **Ask**.

## Context

- **Owner:** Aman Kumar Prajapati, GitHub user `amankprajapati`.
- **Target repo:** `amankprajapati/amankprajapati.github.io`. This name makes it a GitHub user site, served at `https://amankprajapati.github.io` with no path prefix.
- **What this project is:** a static research portfolio built with Eleventy 3 (Node). Source is in `src/`, the build output goes to `_site/`, and `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
- **What it replaces:** the repo may already contain an older single-file `index.html`, and possibly a `CNAME` or other files. This project replaces the page; it does not need anything from the old version.
- **Key facts about the build:**
  - `npm run build` produces `_site/index.html` plus `_site/assets/`.
  - The JS is loaded as ES modules, so the built page only works over HTTP (a server), not from `file://`.
  - GitHub Pages must use **GitHub Actions** as its source, not "Deploy from a branch". With branch mode, GitHub would serve the raw Nunjucks templates instead of the built site.

## Project layout

```
src/index.njk            page skeleton
src/_data/*.json         content as data (header, experience, awards, grain figure data)
src/_includes/           layouts, partials, sections, entries, details, figures, icons
src/assets/              css/, js/ (main.js + modules/), img/
eleventy.config.js       Eleventy config (input src, output _site)
.github/workflows/deploy.yml   CI build and deploy
package.json, package-lock.json
```

Never commit `node_modules/` or `_site/`; `.gitignore` already excludes them.

## Rules

1. Do not force push, rewrite history, or delete branches without asking.
2. Do not delete existing repo files other than the old `index.html` without asking. If a `CNAME` file exists, keep it and follow step 4.
3. Do not change page content, wording or design. The task is deployment only. If something in the content looks wrong, mention it, don't fix it.
4. Never print, store or commit tokens or credentials.
5. If a command fails, read the error, explain it in one or two sentences, and propose a fix before retrying.

## Steps

### 1. Check tools and login

```bash
node --version      # must be 18 or newer
npm --version
git --version
gh --version
gh auth status      # must show login as amankprajapati
```

If `gh` is missing or not logged in, tell the user to run `gh auth login` themselves. It is an interactive browser login you cannot complete. Then wait.

### 2. Check the project builds locally

From the folder that contains this file:

```bash
npm ci
npm run build
ls _site _site/assets
```

Expect `_site/index.html` and `_site/assets/{css,js,img}`. Optionally serve and spot check:

```bash
npx eleventy --serve --port 8080
```

Then open `http://localhost:8080` and confirm there are no console errors. Stop the server afterwards.

### 3. Get the repo

Check whether the repo exists:

```bash
gh repo view amankprajapati/amankprajapati.github.io
```

- **If it exists:** clone it next to this project (`gh repo clone amankprajapati/amankprajapati.github.io ../site-repo`) and continue with step 4.
- **If it does not exist:** **Ask** the user to confirm, then create it as a public repo from this folder:

  ```bash
  git init -b main
  gh repo create amankprajapati/amankprajapati.github.io --public --source=. --remote=origin
  ```

  Then skip to step 5.

### 4. Put the project into the existing repo

In the cloned repo:

1. List what is there (`git ls-files`) and show the user.
2. If there is a `CNAME` file, read the domain in it and tell the user. With GitHub Actions deploys, the CNAME file is ignored, so the custom domain must be set in the repo **Settings**, then **Pages**, then **Custom domain**. Leave the file in place; it does no harm.
3. Remove the old single-file page: `git rm index.html`.
4. **Ask** before removing any other existing files.
5. Copy this project into the repo root: everything in this folder except `node_modules/` and `_site/`, including hidden files `.github/`, `.gitignore` and `.editorconfig`.
6. Run `npm ci && npm run build` inside the repo to confirm it still builds there.

### 5. Commit and push

```bash
git add -A
git status          # show the user; confirm node_modules/ and _site/ are not staged
git commit -m "Rebuild portfolio as a modular Eleventy site with Actions deploy"
git push -u origin main
```

If the default branch is not `main`, **Ask** before renaming it or changing the workflow's branch filter.

### 6. Switch Pages to GitHub Actions

Try the API first:

```bash
# If Pages is not enabled yet:
gh api -X POST repos/amankprajapati/amankprajapati.github.io/pages -f build_type=workflow

# If Pages is already enabled (the POST returns 409):
gh api -X PUT repos/amankprajapati/amankprajapati.github.io/pages -f build_type=workflow

# Confirm:
gh api repos/amankprajapati/amankprajapati.github.io/pages --jq .build_type   # expect "workflow"
```

If the API refuses (permissions), tell the user to do it in the browser: repo **Settings**, then **Pages**, then **Source: GitHub Actions**.

### 7. Watch the deploy

```bash
gh run list --workflow deploy.yml --limit 3
gh run watch        # pick the latest run
```

If the run was triggered before Pages was switched to Actions and failed at the deploy job, re-run it:

```bash
gh workflow run deploy.yml
```

### 8. Verify the live site

```bash
curl -sI https://amankprajapati.github.io | head -1                   # expect 200
curl -s https://amankprajapati.github.io | grep -o "<title>[^<]*"      # expect the portfolio title
curl -sI https://amankprajapati.github.io/assets/js/main.js | head -1  # expect 200
curl -sI https://amankprajapati.github.io/assets/img/portrait.jpg | head -1
```

It can take a minute or two after the run finishes for the site to update. Tell the user to hard refresh (Ctrl+Shift+R) if they still see the old page.

### 9. Report back

Give the user a short summary: what was committed, the run result, the live URL, and anything they still need to do by hand. Always include these manual checks:

- The CV link and both Downfall videos point to Google Drive. Each file must be shared as "Anyone with the link", or visitors see a sign-in prompt. Check in a private browser window.
- The Google Scholar profile must be public.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `npm ci` fails with a lockfile error | `package-lock.json` missing or out of sync | Run `npm install`, commit the updated lockfile |
| Workflow fails at "deploy" with a Pages error | Pages source still set to branch | Step 6, then `gh workflow run deploy.yml` |
| Workflow fails with a permission error | Actions disabled or restricted | Settings, then Actions, then General: allow actions and workflows |
| Site shows raw `{% include %}` text | Pages serving the branch, not the build | Step 6 |
| Site loads but no animations and no nav highlight | JS modules not loading | Check `assets/js/main.js` returns 200; check the browser console |
| 404 on the site | First deploy still propagating, or wrong repo name | Wait two minutes; confirm the repo is exactly `amankprajapati.github.io` |

## Future edits (for later sessions)

- Header text, interests, contact links: `src/_data/site.json`.
- Jobs and internships: `src/_data/experience.json`.
- Awards: `src/_data/awards.json`.
- A paper or project: `src/_includes/entries/<name>.njk`, its figure in `src/_includes/figures/<name>.svg`, listed in the matching file in `src/_includes/sections/`.
- Grain storage figure values: `src/_data/grain.json`.

After any edit: `npm run build` to check it builds, then commit and push. The workflow deploys automatically.
