const dotenv = require('dotenv');
var path = require('path');

dotenv.config({
  path: path.resolve(__dirname, 'config/.env')
});

const keys = {
  dish: process.env.DISH_API_KEY,
  dish_id: process.env.DISH_ID,
  firebase_config: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DB_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGEING_SENDER_ID
  },
}

module.exports = keys;
