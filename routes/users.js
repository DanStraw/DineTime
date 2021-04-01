var express = require('express');
var router = express.Router();
const User = require('../models/User');
let fbService = require('../services/FirebaseService');
let FBService = fbService.FirebaseService;
var admin = require("../services/fbAdmin");

router.post("/", async function (req, res, next) {
  const user = new User(req.body.email, req.body.username, req.body.password, req.body.passwordConfirm);
  const idToken = req.body.idToken;
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      const _fb_service = new FBService({ user, uid });
      _fb_service.signUpUser();
      const options = { maxAge: expiresIn, httpOnly: true };
      res.cookie("session", idToken, options);
      res.send({ statusCode: 200 });
    }, (error) => {
      res.status(401).send("UNAUTHORIZED REQUEST!");
    })
});

router.post('/login', async function (req, res, next) {
  admin.auth().verifyIdToken(req.body.idToken)
    .then(async (decodedToken) => {
      const uid = decodedToken.uid;
      const _fb_service = new FBService({ uid });
      const user = await _fb_service.getUserByUID();
      const idToken = req.body.idToken;
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      const options = { maxAge: expiresIn, httpOnly: true };
      res.cookie("session", idToken, options);
      res.send(user);
    })
});

router.post("/searchHistory", async function (req, res, next) {
  let cookie = req.cookies["session"] || null;
  if (cookie) {
    admin.auth().verifyIdToken(cookie)
      .then(async (decodedToken) => {
        const { type, searchTerm, resultsLength } = req.body;
        const uid = decodedToken.uid;
        let _fbService = new FBService({
          searchTerm,
          type,
          uid
        });

        let searchesCount = 0;
        let user = await _fbService.getUserByUID();
        let searchList = user.recipes[`${type}`];
        for (let search in searchList) {

          if (parseInt(search) !== searchesCount) {
            break;
          }
          searchesCount++;
        }
        const response = await _fbService.saveToUserSearches(searchesCount, resultsLength);
        const responseObj = { success: response, index: searchesCount };
        return res.json(responseObj);
      })
      .catch(err => {
        res.status(403).send({ message: "unauthroized" })
      });
  } else {
    res.status(403).send({ message: "unauthroized" });
  }
})

router.get('/', async function (req, res, next) {
  const _fbService = new FBService({ users: [] });
  res.send(await _fbService.getUsers());
});

router.get('/auth/logout', async function (req, res, next) {
  res.clearCookie("session");
  res.status(200).send({ message: "cookie cleared" });
});

router.get("/searchHistory/:type/:searchTerm", function (req, res, next) {
  let cookie = req.cookies["session"] || null;
  let { type, searchTerm } = req.params;
  if (cookie) {
    admin.auth().verifyIdToken(cookie)
      .then(async (decodedToken) => {
        const uid = decodedToken.uid;
        let _fbService = new FBService({
          searchTerm,
          type,
          uid
        });
        const user = await _fbService.getUserByUID();
        const recipes = user.recipes[`${type}`];
        for (let recipe in recipes) {
          if (searchTerm === recipes[recipe].searchTerm) {
            return res.send({ match: true });
          }
        }
        return res.send({ match: false });
      })
      .catch(err => {
        return res.status(403).send({ match: false, message: "Unauthorized" });
      })
  } else {
    return res.status(403).send({ match: false, message: "Unauthorized" });
  }
});

router.delete('/auth/recipes/:type/:searchHistoryIndex', async function (req, res, next) {
  console.log('delete from search history');
  const { type, searchHistoryIndex } = req.params;
  const cookie = req.cookies["session"] || null;
  if (cookie) {
    admin.auth().verifyIdToken(cookie)
      .then(async (decodedToken) => {
        const { uid } = decodedToken;
        const fbService = new FBService({ type, searchHistoryIndex, uid });
        const deleteResponse = await fbService.deleteSearch();
        res.send(deleteResponse);
      })
  } else {
    res.status(403).send({ message: "unauthorized delete request" });
  }
})

router.delete('/auth/recipes/:type/:searchHistroyIndex/:resultsIndex', async function (req, res, next) {
  const { type, searchHistroyIndex, resultsIndex } = req.params;
  const cookie = req.cookies["session"] || null;
  if (cookie) {
    admin.auth().verifyIdToken(cookie)
      .then(async (decodedToken) => {
        const { uid } = decodedToken;
        const fbService = new FBService({ type, searchHistroyIndex, resultsIndex, uid });
        const deleteResponse = await fbService.deleteRecipe();
        res.send(deleteResponse);
      })
  } else {
    res.status(403).send({ message: "unauthorized delete request" });
  }
})

module.exports = router;
