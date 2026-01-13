const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore(); // This is your Database
const auth = admin.auth();    // This is for User Management

module.exports = { db, auth };