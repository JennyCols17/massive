const admin = require("firebase-admin");

try {
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log("🔥 Initializing Firebase using Environment Variable...");
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        console.log("💻 Initializing Firebase using local JSON file...");
        serviceAccount = require("./serviceAccountKey.json");
    }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    console.log("✅ Firebase Admin initialized successfully.");
} catch (error) {
    console.error("❌ Firebase Initialization Error:", error.message);
}

const db = admin.firestore();

// Ensure 'db' is actually defined before exporting
if (!db) {
    console.error("❌ Firestore 'db' is undefined!");
}

module.exports = db;