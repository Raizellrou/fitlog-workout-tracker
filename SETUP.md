# FitLog — Complete Setup Guide

Follow this top to bottom. Each step has a ✅ checkpoint so you know it worked
before moving on. Total time: ~15 minutes.

> **Legend**
> 🖱️ = do this in a browser · 💻 = tell Claude / run in terminal · ✅ = how to confirm it worked

---

## Part 1 — Firebase Project (the backend)

### Step 1.1 — Create the project 🖱️
1. Go to **https://console.firebase.google.com**
2. Click **Add project** (or **Create a project**).
3. Name it `fitlog` (or anything). Click **Continue**.
4. **Google Analytics** — toggle **OFF** (not needed). Click **Create project**.
5. Wait ~30s, then click **Continue**.

✅ You land on the FitLog project dashboard.

---

### Step 1.2 — Register a Web App 🖱️
1. On the dashboard, click the **`</>`** (web) icon — "Add an app to get started".
2. App nickname: `fitlog-web`.
3. **Do NOT** check "Firebase Hosting" (we use Vercel). Click **Register app**.
4. You'll see a `firebaseConfig` code block. **Keep this tab open** — you need
   these 7 values in Part 2. It looks like:

   ```js
   const firebaseConfig = {
     apiKey: "AIza................",
     authDomain: "fitlog-xxxx.firebaseapp.com",
     projectId: "fitlog-xxxx",
     storageBucket: "fitlog-xxxx.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:1234...:web:abcd...",
     measurementId: "G-XXXXXXX"   // may be absent — that's fine
   };
   ```
5. Click **Continue to console**.

✅ You can see your config values (you'll copy them in Step 2.1).

---

### Step 1.3 — Enable Google Sign-In 🖱️
1. Left sidebar → **Build → Authentication**.
2. Click **Get started**.
3. **Sign-in method** tab → click **Google**.
4. Toggle **Enable** ON.
5. Pick a **support email** (your Gmail) from the dropdown.
6. Click **Save**.

✅ Google shows as **Enabled** in the providers list.

---

### Step 1.4 — Create the Firestore database 🖱️
1. Left sidebar → **Build → Firestore Database**.
2. Click **Create database**.
3. Choose a location: pick **`asia-southeast1` (Singapore)** — closest to the
   Philippines for low latency. Click **Next**.
4. Start in **Production mode** (we'll apply our own rules next). Click **Create**.

✅ You see an empty Firestore data browser.

---

### Step 1.5 — Apply the security rules 🖱️
1. In Firestore, click the **Rules** tab.
2. Delete everything in the editor and paste this (it's also in
   [`firestore.rules`](firestore.rules) in your repo):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null
                            && request.auth.uid == userId;
       }
     }
   }
   ```
3. Click **Publish**.

✅ Rules show "Last published just now." This locks data so each user can only
read/write their own.

---

## Part 2 — Run It Locally

### Step 2.1 — Give Claude your Firebase keys 💻
Copy the 7 values from Step 1.2 and paste them to Claude in this format (just
fill in the blanks — Claude will create the `.env` file for you):

```
apiKey: ...
authDomain: ...
projectId: ...
storageBucket: ...
messagingSenderId: ...
appId: ...
measurementId: ...
```

> 🔒 These keys are safe to share with Claude and safe in the client bundle —
> your Firestore **rules** are what actually protect the data. They will live in
> `.env`, which is gitignored (never committed).

✅ Claude confirms `.env` is created.

---

### Step 2.2 — Start the dev server 💻
Tell Claude **"run the dev server"** (or run `npm run dev` yourself).

1. Open the printed URL (usually **http://localhost:5173**) in Chrome.
2. Click **Continue with Google** and sign in.
3. Log a test exercise, log a meal, finish a session.

✅ You can sign in and your data appears. Refresh the page — it persists.

---

### Step 2.3 — Confirm cloud sync 🖱️
1. Back in the Firebase console → **Firestore Database → Data** tab.
2. You should now see: `users → {your-uid} → data → fitlog`.

✅ Your workout/meal data is in the cloud. (Open the app on your phone later and
the same data appears after sign-in.)

---

## Part 3 — Deploy to Vercel (live URL)

### Step 3.1 — Sign up for Vercel 🖱️
1. Go to **https://vercel.com/signup**.
2. Click **Continue with GitHub** and authorize Vercel.

✅ You're on the Vercel dashboard.

---

### Step 3.2 — Import the repo 🖱️
1. Click **Add New… → Project**.
2. Find **`fitlog-workout-tracker`** in the list → click **Import**.
   (If it's not listed, click **Adjust GitHub App Permissions** and grant access.)
3. Vercel auto-detects **Vite** — leave Framework Preset, Build Command, and
   Output Directory as detected.
4. **Don't deploy yet** — expand **Environment Variables** first (next step).

✅ You're on the "Configure Project" screen with env-var fields visible.

---

### Step 3.3 — Add environment variables 🖱️
Add all 7 (same names as your `.env`). For each: type the **Name**, paste the
**Value**, click **Add**.

| Name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | *(your apiKey)* |
| `VITE_FIREBASE_AUTH_DOMAIN` | *(your authDomain)* |
| `VITE_FIREBASE_PROJECT_ID` | *(your projectId)* |
| `VITE_FIREBASE_STORAGE_BUCKET` | *(your storageBucket)* |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | *(your messagingSenderId)* |
| `VITE_FIREBASE_APP_ID` | *(your appId)* |
| `VITE_FIREBASE_MEASUREMENT_ID` | *(your measurementId, or skip)* |

> 💡 Tip: Claude can print these as ready-to-paste pairs from your `.env` — just ask.

✅ All 7 rows listed under Environment Variables.

---

### Step 3.4 — Deploy 🖱️
1. Click **Deploy**.
2. Wait ~1–2 min for the build.
3. Click the preview / **Visit** to open your live URL
   (`https://fitlog-workout-tracker.vercel.app` or similar).

✅ The site loads. **It will fail Google sign-in until you do Step 3.5** — that's expected.

---

### Step 3.5 — Authorize the Vercel domain in Firebase 🖱️ ⚠️ critical
Google sign-in only works on domains Firebase trusts.

1. Copy your live Vercel domain (e.g. `fitlog-workout-tracker.vercel.app`).
2. Firebase console → **Authentication → Settings** tab → **Authorized domains**.
3. Click **Add domain**, paste the Vercel domain (no `https://`), click **Add**.

✅ Reload your Vercel URL → **Continue with Google** now works on the live site.

---

### Step 3.6 — Install on your phone 🖱️
- **iPhone (Safari):** open the Vercel URL → **Share** → **Add to Home Screen**.
- **Android (Chrome):** open the URL → tap the **Install** banner / menu → **Install**.

✅ The FitLog icon (lime dumbbell) is on your home screen and opens fullscreen.

---

## Done 🎉

You now have a live, installable, multi-device-synced fitness tracker. Every
`git push` to `master` auto-deploys a new version on Vercel.

### Quick reference
| Action | Command |
|---|---|
| Run locally | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Deploy | just `git push` (Vercel auto-builds) |

### Troubleshooting
- **`Missing Firebase env vars` on startup** → `.env` is missing or a key is
  blank. Re-check Step 2.1.
- **`auth/unauthorized-domain` on the live site** → you skipped Step 3.5.
- **Sign-in popup blocked** → allow popups for the site, or try again.
- **Data not syncing** → confirm Firestore rules were published (Step 1.5) and
  you're signed in.
