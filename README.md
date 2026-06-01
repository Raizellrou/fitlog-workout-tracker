# FitLog — Workout & Food Tracker

A fitness tracker **PWA** with **multi-device cloud sync**. Log workouts and
nutrition, see your streak and volume trend, and install it to your phone's home
screen. Built with React + Vite + Firebase, deployed on Vercel.

![React](https://img.shields.io/badge/React-19-61dafb)
![Vite](https://img.shields.io/badge/Vite-6-646cff)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-ffca28)
![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8)

## Features

- 🏋️ **Workout logger** — exercises, sets, reps, weight, live volume + session timer
- ✅ **Set completion** toggle with visual feedback
- 🍎 **Food & macro logger** — calories, protein, carbs, fats by meal type
- 🔥 **Streak tracker** + **volume-trend chart**
- ☁️ **Real-time cloud sync** across all your devices (Firebase)
- 📴 **Offline-first** — works with no connection, syncs when back online
- 📱 **Installable PWA** on iOS and Android

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Backend / sync | Firebase (Firestore + Auth) |
| Charts | Recharts |
| PWA | vite-plugin-pwa |
| Hosting | Vercel |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure Firebase
cp .env.example .env      # then fill in your Firebase web config

# 3. Run the dev server
npm run dev
```

### Firebase setup (one-time)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Add a **Web app**, copy the config into `.env`.
3. Enable **Authentication → Google** sign-in.
4. Create a **Firestore** database.
5. Publish the rules from [`firestore.rules`](firestore.rules).

## Deploy to Vercel

1. Push to GitHub, then **Import Project** in Vercel (auto-detects Vite).
2. Add your `VITE_FIREBASE_*` vars under **Settings → Environment Variables**.
3. Deploy. Then add your `*.vercel.app` domain to **Firebase → Authentication →
   Settings → Authorized domains** so Google sign-in works on the live site.

## Install on your phone

- **iPhone**: open the live URL in Safari → Share → **Add to Home Screen**.
- **Android**: open in Chrome → tap the **Install** prompt.

## Project layout

See [CLAUDE.md](CLAUDE.md) for the full architecture overview and conventions.

## License

MIT
