const dotenv = require('dotenv');
var path = require('path');
var admin = require("firebase-admin");

dotenv.config({
  path: path.resolve(__dirname, '../config/.env')
});

var serviceAccount = process.env.SERVICE_ACCOUNT_KEY || require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dinetime-c2874.firebaseio.com"
});

module.exports = admin;