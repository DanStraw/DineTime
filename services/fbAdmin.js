var serviceAccount = require("../serviceAccountKey.json");
var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dinetime-c2874.firebaseio.com"
});

module.exports = admin;