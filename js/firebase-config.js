/**
 * Google Firebase Cloud Configuration & Multi-Environment Manager
 * Kids Study Tracker - Phase 2 Cloud Firestore
 * Supports seamless switching between Production (Live) & Demo (Testing)
 */

const FIREBASE_ENVIRONMENTS = {
  production: {
    key: "production",
    name: "Production (Live)",
    badge: "🟢 Live Cloud",
    color: "#059669",
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    projectId: "kids-study-tracker",
    apiKey: "AIzaSyDlMv9AgFjIpCnbo7D4rdBg_q7EQIzeojE",
    authDomain: "kids-study-tracker.firebaseapp.com",
    storageBucket: "kids-study-tracker.firebasestorage.app",
    messagingSenderId: "361484664589",
    appId: "1:361484664589:web:277c46fd5f5c3273e57a44",
    measurementId: "G-G14DYYG59D"
  },
  demo: {
    key: "demo",
    name: "Demo / Showcase (Testing)",
    badge: "🧪 Demo Mode",
    color: "#d97706",
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
    projectId: "kids-study-tracker-demo",
    apiKey: "AIzaSyC-x9QZmS7sbzI8oSVhTUjp2NXA30PrkzM",
    authDomain: "kids-study-tracker-demo.firebaseapp.com",
    storageBucket: "kids-study-tracker-demo.firebasestorage.app",
    messagingSenderId: "334222633755",
    appId: "1:334222633755:web:4971ac2161ff338af001be",
    measurementId: "G-B7SQNV26JW"
  }
};

// Determine Active Environment automatically based on Domain / Hostname or URL param
function getActiveEnvironment() {
  try {
    const hostname = window.location.hostname ? window.location.hostname.toLowerCase() : '';
    // 1. If hosted domain is Demo (e.g. kids-study-tracker-demo.web.app)
    if (hostname.includes('kids-study-tracker-demo') || hostname.includes('-demo')) {
      return 'demo';
    }
    // 2. If explicit query parameter is provided (e.g. ?env=demo)
    const urlParams = new URLSearchParams(window.location.search);
    const envParam = urlParams.get('env') || (urlParams.has('demo') ? 'demo' : null);
    if (envParam === 'demo') {
      return 'demo';
    }
    if (envParam === 'production') {
      return 'production';
    }
    // 3. For local file:// or localhost testing, allow manual local override if set
    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
      const saved = localStorage.getItem('kst_selected_env');
      if (saved === 'demo' || saved === 'production') {
        return saved;
      }
    }
  } catch (e) {}
  return 'production'; // Standard Default is Production
}

function setActiveEnvironment(env) {
  if (env !== 'demo' && env !== 'production') return;
  try {
    localStorage.setItem('kst_selected_env', env);
    const cleanUrl = window.location.origin + window.location.pathname;
    window.location.href = cleanUrl;
  } catch (e) {
    window.location.reload();
  }
}

const CURRENT_ENV_KEY = getActiveEnvironment();
const CURRENT_ENV_CONFIG = FIREBASE_ENVIRONMENTS[CURRENT_ENV_KEY] || FIREBASE_ENVIRONMENTS.production;
const FIREBASE_CONFIG = CURRENT_ENV_CONFIG;

var firebaseApp = null;
var firestoreDb = null;
var isFirebaseActive = false;

try {
  if (typeof firebase !== 'undefined' && FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey) {
    if (!firebase.apps.length) {
      firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    } else {
      firebaseApp = firebase.app();
    }
    firestoreDb = firebase.firestore();
    try {
      firestoreDb.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
        if (err.code === 'failed-precondition' || err.code === 'unimplemented') {
          console.info('Firestore persistence handled:', err.code);
        }
      });
    } catch (e) {}

    isFirebaseActive = true;
    console.log(`✅ Firebase [${CURRENT_ENV_CONFIG.name}] connected! (Project: ${CURRENT_ENV_CONFIG.projectId})`);
  }
} catch (err) {
  console.warn('⚠️ Firebase initialization deferred or offline:', err);
  isFirebaseActive = false;
}
