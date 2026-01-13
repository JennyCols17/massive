const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
} else {
    serviceAccount = require("./serviceAccountKey.json");
}

// Initialize Admin only if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// Get the Firestore instance
const db = admin.firestore();

console.log("✅ Firebase Connected Successfully");

// Export the db instance
module.exports = db;