const admin = require("firebase-admin");

try {
  if (!admin.apps.length) {
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // 1. Get the JSON from Render
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      // 2. CRITICAL FIX: Replace the text "\n" with real line breaks
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    } else {
      // Local development
      serviceAccount = require("./serviceAccountKey.json");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Connected Successfully");
  }
} catch (error) {
  console.error("❌ Firebase Initialization Error:", error.message);
}

const db = admin.firestore();
module.exports = db;