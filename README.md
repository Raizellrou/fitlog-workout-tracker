# FitLog — Workout & Food Tracker PWA

A personal fitness tracker with workout logging, food/macro tracking, and session history.

## Files
- `index.html` — The entire app (UI + logic)
- `manifest.json` — PWA install metadata
- `sw.js` — Service worker (offline support + installability)
- `icon-192.png` & `icon-512.png` — App icons *(you need to add these — see below)*

## Adding App Icons
You need two PNG icons for the PWA install prompt and home screen:
- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px

Quick option: use any image editor (or a free tool like https://favicon.io) to create
a simple icon with the letters "FL" or a dumbbell on a dark (#0d0d0f) background.

## Deploy to Netlify (Free, ~2 minutes)
1. Go to https://netlify.com and sign up free
2. From your dashboard, drag the entire `workout-tracker` folder onto the deploy area
3. Netlify gives you a live URL like `https://fitlog-abc123.netlify.app`
4. Open that URL on your phone in Safari (iOS) or Chrome (Android)

## Install on iPhone
1. Open the Netlify URL in **Safari**
2. Tap the **Share** button (box with arrow)
3. Tap **Add to Home Screen**
4. Tap **Add** — the FitLog icon appears on your home screen!

## Install on Android
1. Open the Netlify URL in **Chrome**
2. Chrome will show an **"Add to Home Screen"** banner automatically
3. Tap **Install** — done!

## Features (this build)
- [x] Workout logger — exercises, sets, reps, weight with volume tracking
- [x] Set completion toggle (marks sets done with visual feedback)
- [x] Session timer (start/pause)
- [x] Food/macro logger — calories, protein, carbs, fats by meal type
- [x] Session history with date and exercise list
- [x] Workout streak tracker
- [x] Full offline support via service worker
- [x] Data persists in localStorage (survives browser close)
- [x] PWA-ready (installable on iOS and Android)

## Coming Next (Session 2)
- Progress charts (weight over time, volume trends)
- AI weekly summary via Claude API
- Body weight log
- Workout templates

## Data Storage
All data is saved in your browser's `localStorage` under the key `fitlog_v1`.
Data is private to your device. To back up, export via browser DevTools → Application → Local Storage.
