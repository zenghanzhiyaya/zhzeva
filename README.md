# Personal Workbench

A React + Vite + Tailwind app: Dashboard, Quick Notes, To-Do, Follow-ups, Tasks,
Meetings, Training Notes, Docs & Links, and Contacts. Data is saved in the
browser's local storage on whichever device you're using.

## Get it auto-deploying on Netlify

Netlify Drop (drag-and-drop) only deploys once — it won't pick up future
changes. For automatic redeploys every time you make a change, connect Netlify
to a GitHub repo instead. Once that's set up, every `git push` triggers a new
build and deploy automatically, with no manual steps.

### 1. Push this project to GitHub

```bash
cd workbench-site
git init
git add .
git commit -m "Initial commit"
```
Create a new, empty repo on https://github.com/new (don't add a README there),
then:
```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

### 2. Connect the repo to Netlify

1. Go to https://app.netlify.com and log in (or sign up — free).
2. **Add new site → Import an existing project → Deploy with GitHub**.
3. Authorize Netlify to access your GitHub account, then pick this repo.
4. Netlify auto-detects the build settings from `netlify.toml` in this project:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click **Deploy site**. First build takes ~1 minute.

### 3. From now on: just push

```bash
git add .
git commit -m "Update workbench"
git push
```
Every push to `main` triggers a new Netlify build and deploy automatically —
usually live within a minute. You can watch build progress and past deploys
under the site's **Deploys** tab in Netlify.

### Making changes

- Edit `src/App.jsx` for the app itself.
- Run `npm install` once, then `npm run dev` to preview changes locally at
  `http://localhost:5173` before pushing.
- `npm run build` produces the same `dist/` folder Netlify builds — useful to
  sanity-check before pushing if something feels off.

## Notes

- Data lives in `localStorage`, per browser/device — nothing is sent to a
  server, and nothing is shared between devices or people.
- If you ever want to reset all data, clearing the site's storage in your
  browser's dev tools (Application → Local Storage) will do it.
