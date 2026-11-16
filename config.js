// Live sharing settings. Full guide: FIREBASE_SETUP.md
// Leave both as they are to run in "browser mode" (each person's tasks stay in their own browser).

window.CF_API_URL = "";      // only if you run server.js on another address, e.g. "https://my-server.example.com"

window.CF_FIREBASE = null;   // for live sharing on GitHub Pages, replace null with the config from Firebase, like this:
// window.CF_FIREBASE = {
//   apiKey: "AIza...",
//   authDomain: "your-project.firebaseapp.com",
//   projectId: "your-project",
//   storageBucket: "your-project.firebasestorage.app",
//   messagingSenderId: "123456789",
//   appId: "1:123456789:web:abcdef"
// };
