# Momentum Planner

A goal-setting, habit-tracking and life-planning web app. Everything runs in the
browser. Data is saved in `localStorage`, and you can export or import it as a JSON backup.

## Features

- **Dashboard**: greeting, a daily quote, stats, today's habits, due and overdue tasks, and goal progress.
- **Goals**: life area, target date, description and "why", plus milestones that drive the progress bar. Goals can be marked achieved or reopened.
- **Habits**: weekly check-off grid, custom repeat days, current streak and 30-day completion rate. Habits can be linked to a goal.
- **Tasks**: quick add, due dates, priorities and goal links, with Open, Due, Completed and All views.
- **Journal**: daily entries with mood, a reflection, three gratitudes and search.
- **Life Wheel**: rate each life area from 1 to 10 and see your balance on a wheel chart.
- **Settings**: name, light/dark/system theme, editable life areas, export/import backup, and erase all data.

## Development

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests (vitest)
npm run build    # production build in dist/
npm run preview  # serve the production build
```

`dist/` is a static site with relative asset paths, so you can host it anywhere:
GitHub Pages, Netlify, Vercel, S3 or any static file server.

## Android app (APK)

The app is wrapped for Android with [Capacitor](https://capacitorjs.com/), and the native project is in `android/`.

- **CI build:** every push runs `.github/workflows/android.yml`, which builds a debug APK.
  Download it from the workflow run's **Artifacts** section (`momentum-planner-apk`).
  Pushing a tag like `v1.0.0` also attaches the APK to a GitHub Release.
- **Local build** (needs JDK 21 and the Android SDK):
  ```bash
  npm run build && npx cap sync android
  cd android && ./gradlew assembleDebug
  # -> android/app/build/outputs/apk/debug/app-debug.apk
  ```
- **Install:** copy the APK to your phone and open it. Allow "Install unknown apps" if Android asks.

The APK is a debug build, signed with a debug key, so it's for sideloading only. Publishing on
Google Play needs a release keystore and `assembleRelease` or `bundleRelease`.
