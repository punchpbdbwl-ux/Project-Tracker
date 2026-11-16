# City Fresh Project Tracker

A project tracker in City Fresh colours for Promotion, Retails, Social Media, Catalogue and POSM work.
Columns: assigned date/time, assigned by, assigned to, details, kind of work, brief link, deadline,
status (Urgent / Routine), progress and remark. Every cell is editable. Includes search, filters,
Backup / Restore (JSON) and Export CSV.

```
docs/index.html   the website (all HTML, CSS and JS in one file)
docs/404.html     not-found page
docs/.nojekyll    tells GitHub Pages to serve the files as they are
server.js         optional tiny server + file database (shared list for a team)
data/             where the optional server stores db.json (never committed)
```

## Launch on GitHub Pages (public, free)

1. On github.com choose **New repository**. Name it (for example `cityfresh-tracker`), set **Public**, create it.
2. Upload every file and folder from this project (keep the `docs/` folder). On the web: **uploading an existing file**, drag the files in, **Commit changes**. Or with Git:
   ```
   git init
   git add .
   git commit -m "City Fresh tracker"
   git branch -M main
   git remote add origin https://github.com/<your-username>/cityfresh-tracker.git
   git push -u origin main
   ```
3. Open **Settings > Pages**. Under *Build and deployment*, set **Source: Deploy from a branch**, **Branch: main**, **Folder: /docs**, then **Save**.
4. After 1 to 2 minutes the site is live at `https://<your-username>.github.io/cityfresh-tracker/`.

### Good to know for a public site
- Anyone with the link can open it. Do not type confidential information into it.
- On GitHub Pages there is no server, so each visitor's tasks are saved only in their own browser. Use **Backup** to keep a copy and **Restore** to load it on another device.
- Never commit passwords. The optional server reads its password from the `ACCESS_CODE` environment variable, and `data/` is git-ignored.

## Optional: shared list with the built-in server
Needs Node.js 18 or newer, nothing else to install.
```
node server.js                       # http://localhost:3000
ACCESS_CODE=yourpassword node server.js   # ask everyone for a team password
```
Tasks are saved in `data/db.json` and sync between everyone every 5 seconds. To expose it online for free,
run it on an always-on PC and use a Cloudflare Tunnel (`cloudflared tunnel --url http://localhost:3000`),
or use `docker compose up -d --build` on any server. Free cloud servers that sleep (such as Render's free plan)
erase local files when they restart, so use Backup often if you try one.

To keep GitHub Pages as the front end and run the server elsewhere, set `window.CF_API_URL="https://your-server"`
near the top of `docs/index.html` and start the server with `CORS_ORIGIN=https://<your-username>.github.io`.

Environment variables: `PORT` (3000), `DATA_DIR` (./data), `ACCESS_CODE` (optional), `CORS_ORIGIN` (optional).

## License
MIT, see `LICENSE`.
