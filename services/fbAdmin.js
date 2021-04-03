const dotenv = require('dotenv');
var path = require('path');
var admin = require("firebase-admin");

dotenv.config({
  path: path.resolve(__dirname, '../config/.env')
});

var serviceAccount = {
  "type": process.env.FIREBASE_PROJECT_TYPE,
  "projectId": process.env.FIREBASE_PROJECT_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY,
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
} || require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dinetime-c2874.firebaseio.com"
});

module.exports = admin;