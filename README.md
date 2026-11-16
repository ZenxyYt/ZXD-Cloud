# ZXD Cloud Gaming — GitHub Pages starter

A responsive browser-gaming portal starter. It includes:
- Discover/home page and featured games
- Search, category filtering, and sorting
- Favorites stored in the browser
- Local demo profiles and sign-in/create-account screens
- Demo admin panel for adding/removing game URLs
- Three built-in mini-games: Neon Snake, Memory Match, and Cosmic Clicker
- Optional embedded external game links (some websites block iframe embedding)

## Publish on GitHub Pages
1. Download and extract the ZIP.
2. Create a **public** repository on GitHub, for example `zxd-cloud-gaming`.
3. Upload `index.html`, `style.css`, `app.js`, and `README.md` to the repository root.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Choose branch `main` and folder `/ (root)`, then click **Save**.
7. Wait for GitHub Pages to publish. Your address will look like:
   `https://YOUR-USERNAME.github.io/zxd-cloud-gaming/`

## Demo admin
The front-end demo seeds this account locally:
- Username: `admin`
- Password: `zxd-demo-2026`

Sign in, then choose **Admin** in the top navigation. Change this demo credential in `app.js` before sharing the project. Important: because this is a static GitHub Pages app, the admin check and all data are client-side and can be inspected or changed by visitors. Do not use this for real administration.

## Important production limitations
This is a front-end prototype, not a production account or cloud-streaming service:
- User accounts, favorites, play counts, and custom games are stored in `localStorage` on the current browser only. They do not sync between devices or users.
- Passwords in this demo are stored locally and are not securely hashed. Do not use real passwords or personal information.
- A real multi-user account system requires a backend/auth provider (for example Supabase or Firebase) with database security rules.
- GitHub Pages serves static files. It does not run game servers or stream a remote PC. This project runs its built-in mini-games in the visitor's browser. External games are shown in an iframe only if their site permits embedding.
- A real remote-game streaming service needs a separate streaming host/server and a WebRTC or similar streaming stack.

## Adding games
Edit the `starterGames` array in `app.js` to change titles, descriptions, categories, artwork emoji, and colors. Built-in game `kind` values are `snake`, `memory`, and `clicker`. For external browser games, add a `url` property. Test the URL: many game sites block embedding. Only add games and assets you are allowed to distribute or link to.

## Files
- `index.html` — page structure and dialogs
- `style.css` — responsive dark gaming theme
- `app.js` — game catalog, demo accounts, mini-games, favorites, and admin UI
