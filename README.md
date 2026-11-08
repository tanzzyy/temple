# 財神廟 Cai Shen Temple

A 3D browser game. Players walk around a temple, pray to Cai Shen, light incense, and make an offering for a 4-digit lucky number. Everyone online sees each other live.

- **Hosting:** GitHub Pages (free)
- **Live players:** Firebase Realtime Database + Anonymous Auth (free Spark plan)
- **Payments:** demo mode for now (`CONFIG.PAYMENT_MODE` in `index.html`)

## Files

| File | What it is |
|---|---|
| `index.html` | The whole game (Three.js) |
| `net.js` | Multiplayer layer (Firebase) |
| `firebase-config.js` | **Your** Firebase project settings |
| `database.rules.json` | Security rules: each player can only write their own record |
| `firebase.json` | Only needed if you use the Firebase CLI |

## Setup (about 10 minutes)

### 1. Create the Firebase project
1. Go to https://console.firebase.google.com → **Add project** (Google Analytics: off is fine).
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable.**
3. **Build → Realtime Database → Create database.** Location: **Singapore (asia-southeast1)**, closest to Malaysia. Start in **locked mode**.
4. In Realtime Database → **Rules** tab, replace everything with the contents of `database.rules.json` → **Publish**.
5. **Project settings (⚙️) → General → Your apps → Web (`</>`)** → register an app (no Hosting needed) → copy the `firebaseConfig` values into `firebase-config.js`. Make sure `databaseURL` matches the URL shown at the top of your Realtime Database page.

### 2. Put it on GitHub Pages
1. Create a new **public** repo on GitHub, e.g. `caishen-temple`.
2. Upload all these files to the repo root (drag-and-drop on github.com works, or `git push`).
3. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save.**
4. After a minute your game is live at `https://<your-username>.github.io/caishen-temple/`.

### 3. Allow your domain in Firebase
**Authentication → Settings → Authorized domains → Add domain →** `<your-username>.github.io`

### 4. Test
Open the link on your phone and on your computer at the same time. You should see the other player walk in and the 👥 counter go to 2.

## Free-plan limits (Spark)
- **100 players online at the same time** per database. To go beyond that, upgrade to Blaze or split players across rooms (`ROOM` in `firebase-config.js`).
- **10 GB download per month.** Positions are sent only when a player moves (max ~6 times a second), so typical use stays well inside this.

## Running locally
The browser blocks module scripts on `file://`, so serve the folder:
```
npx serve .
```
or `python3 -m http.server`. Then open http://localhost:3000 (or :8000).

## Next: real payments
Taking real money needs a small server (Firebase Cloud Functions on the Blaze plan) that:
1. creates a bill with a payment gateway (e.g. ToyyibPay, Billplz or Stripe, all with FPX/DuitNow),
2. receives the gateway's callback confirming payment,
3. generates the 4-digit number on the server and saves it to the player's record.

Never generate the paid number in the browser.
