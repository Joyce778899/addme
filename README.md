# AddMe Lite (PWA)
Two-shot couple/group photo composer. All on-device (no upload).

## Features
- Capture A (group without photographer) -> ghost overlay align -> Capture B (with photographer)
- Brush-based blend (erase/restore) to merge A/B
- Export as PNG
- PWA: install to home screen, offline use

## Quick Start (no build)
Just serve the folder as static files.

### Option A: GitHub Pages (free, recommended)
1. Create a new repo on GitHub, e.g. `addme-lite`.
2. Upload all files at repository root (keep `index.html` at root).
3. Settings -> Pages -> *Build and deployment* -> Source: **Deploy from a branch**.
4. Branch: **main**, Folder: **/** (root). Click **Save**.
5. Wait 1–2 minutes. Your URL will be: `https://<your-username>.github.io/addme-lite/`.

### Option B: Netlify (drag & drop)
1. Login to Netlify -> **Add new site** -> **Deploy manually**.
2. Drag this folder to the upload area.
3. After deploy, open the site URL. Camera: allow permission.

### Option C: Vercel
1. Login to Vercel -> **Add New... Project**.
2. Import GitHub repo or drag folder.
3. Framework preset: **Other** (static).
4. Build Command: **None**, Output Directory: **/** (root).
5. Deploy and open URL.

### Option D: Local preview
- Python: `python3 -m http.server 8080` then open http://localhost:8080
- Node: `npx serve .` then open the shown URL

> Tip (PWA): In Safari/Chrome mobile, use **Add to Home Screen** to install.

## Files
- `index.html`, `style.css`, `app.js` – App UI & logic
- `sw.js` – Service worker for offline cache
- `manifest.json` – PWA manifest
- `icons/` – App icons

## Notes
- All processing is on-device. No network calls.
- Browser will ask for camera permission.
- To improve realism: keep phone position/focal length consistent between shots.
