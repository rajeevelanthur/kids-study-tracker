# 🎓 Kids Study Tracker ⭐

A modern, responsive, cloud-synced Progressive Web Application (PWA) designed for parents to assign, monitor, approve, and reward children's daily study routines for **Kerala State Syllabus** and **CBSE** (Standards 1 to 10).

---

## 🌐 Live Environments

* **🚀 Production App:** [https://kids-study-tracker.web.app](https://kids-study-tracker.web.app)
* **🧪 Staging / Demo App:** [https://kids-study-tracker-demo.web.app](https://kids-study-tracker-demo.web.app)

---

## ✨ Key Features

1. **Dual Environment Cloud Architecture:**
   * Automatic environment routing between Firebase Production (`kids-study-tracker`) and Demo (`kids-study-tracker-demo`).
   * One-click independent deployment scripts for safe staging and production rollout.

2. **Mobile First & PWA Ready:**
   * Installable on Android & iOS as a full-screen native-like app (Service Worker & Manifest included).
   * 100% responsive fluid mobile layout with touch-scrollable tabs and adaptive cards.

3. **Curriculum & Category Customization:**
   * Preloaded with Kerala State Syllabus and CBSE curricula for Classes 1 to 10.
   * Full parent control to add/edit/delete subjects and customize reward points per task category.

4. **Weekly Study Routine & Weekend Rewards:**
   * Monday to Friday weekly study tracker with automatic rollover of unfinished tasks.
   * Target stars tracker with trophy history for weekend prizes.

5. **Parent Approval Workflow:**
   * Students submit completed tasks with one click; parents review and award points or request revisions with encouraging stickers.

---

## 🛠️ Deploying Updates

The repository includes convenient automated deployment scripts for Windows:

* `deploy_demo.bat` — Deploys changes strictly to the **Demo / Staging** site for testing.
* `deploy_prod.bat` — Prompts with a safety confirmation before pushing to the **Live Production** site.
* `deploy.bat` — Deploys to both environments simultaneously.

---

## 📦 Project Structure

```
kids-study-tracker/
├── index.html            # Main SPA container & PWA Service Worker bootstrap
├── manifest.json         # Web App Manifest for mobile installation
├── sw.js                 # Service worker for offline caching
├── deploy_demo.bat       # One-click deployer to Demo site
├── deploy_prod.bat       # Safeguarded deployer to Production site
├── deploy.bat            # Dual deployer script
├── firebase.json         # Firebase Hosting configuration & caching headers
├── .firebaserc           # Multi-target project aliases
├── css/
│   └── styles.css        # Responsive styling & 6 customizable themes
├── js/
│   ├── firebase-config.js # Dynamic multi-environment Firebase routing
│   ├── store.js          # LocalStorage + Firestore cloud sync engine
│   ├── auth.js           # Family Code + PIN authentication
│   ├── components.js     # Shared task cards & UI components
│   ├── parent-dashboard.js # Parent admin, task manager, curriculum & reports
│   ├── child-dashboard.js  # Student dashboard, wallet & weekend goals
│   ├── admin-dashboard.js  # System diagnostics
│   └── app.js            # App coordinator & state management
└── icons/                # High-resolution PWA icons (512x512, 192x192, iOS 180x180)
```
