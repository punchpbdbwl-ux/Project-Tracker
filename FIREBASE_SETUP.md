# Live sharing on GitHub Pages (Firebase, free)

GitHub Pages only serves files, so it cannot keep a shared list by itself. Firebase Firestore is a free
hosted database that pushes every change to everyone who has the page open, within a moment.
Plan: Spark (free, no card). Firestore's free daily quota at the time of writing: 50,000 reads and
20,000 writes per day, 1 GiB storage. If a quota runs out, saving pauses until it resets.
Check the current limits on firebase.google.com/pricing.

## Steps (about 10 minutes)

1. Go to **console.firebase.google.com**, sign in with a Google account, **Create a project** (Analytics not needed).
2. Left menu **Build > Firestore Database > Create database**. Choose a region near your team
   (for Thailand, `asia-southeast1` Singapore), then **Start in production mode**.
3. Open the **Rules** tab, replace everything with the rules below, then **Publish**.
4. Click the gear icon **Project settings > General > Your apps > Web (`</>`)**. Register an app (no hosting needed)
   and copy the `firebaseConfig` values.
5. Open `docs/config.js`, replace `window.CF_FIREBASE = null;` with your config (an example is in the file).
6. Commit the change to GitHub. After about a minute the site shows **Live: changes appear instantly for everyone**.
   Open it on two devices and edit a task to test.

## Rules to paste

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{id} {
      allow read: if true;
      allow create, update: if request.resource.data.id is string
                            && request.resource.data.id.size() <= 40;
      allow delete: if true;
    }
    match /meta/categories {
      allow read: if true;
      allow write: if request.resource.data.list is list
                   && request.resource.data.list.size() <= 50;
    }
  }
}
```

## Who can see and edit?
Anyone who has your site link can read, edit and delete tasks. The Firebase config in `config.js` is
meant to be public; it is the rules that protect the database, and these rules are open on purpose so a link is
enough. Do not store confidential information. If you later need real sign-in, add Firebase Authentication
and change the rules to `if request.auth != null`.

## Back up your data
Use the **Backup** button in the page now and then. It downloads every task and category as a JSON file.
