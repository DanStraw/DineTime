var express = require('express');
var router = express.Router();
const { DrinkSearch } = require("../models/DrinkSearch");
const { DishSearch } = require("../models/DishSearch");
let fbService = require('../services/FirebaseService');
let FBSrvice = fbService.FirebaseService;
var admin = require("../services/fbAdmin");

router.post('/:type/:searchTerm', async function (req, res, next) {
  let cookie = req.cookies["session"] || null;
  let recipeSearch = req.params.type === 'food' ? new DishSearch(req.params.searchTerm, "food") : new DrinkSearch(req.params.searchTerm, "drink");
  let result = await recipeSearch.searchAPI();
  if (result.statusCode === 404) {
    return res.status(404).send(recipeSearch);
  }

  if (cookie) {
    admin.auth().verifyIdToken(cookie).then(async (decodedToken) => {
      const uid = decodedToken.uid;
      let _fbService = new FBSrvice({
        searchTerm: recipeSearch.searchTerm,
        type: recipeSearch.type,
        results: recipeSearch.results,
        uid: uid
      });
      let userSearchHistoryIndex = 0;
      let user = await _fbService.getUserByUID();
      let searchList = user.recipes[`${recipeSearch.type}`];
      for (let search in searchList) {
        if (parseInt(search) !== userSearchHistoryIndex) {
          break;
        }
        userSearchHistoryIndex++;
      }
      await _fbService.saveResults();
      res.send({
        searchTerm: recipeSearch.searchTerm,
        type: recipeSearch.type,
        results: recipeSearch.results,
        index: userSearchHistoryIndex
      });
    })
      .catch(err => {
        return res.send({
          searchTerm: recipeSearch.searchTerm,
          type: recipeSearch.type,
          results: recipeSearch.results
        });
      })
  } else {
    return res.send({
      searchTerm: recipeSearch.searchTerm,
      type: recipeSearch.type,
      results: recipeSearch.results
    });
  }
});

router.get('/', async (req, res) => {
  const idToken = req.cookies.session || "";

  admin.auth().verifyIdToken(idToken, true)
    .then(async (cred) => {
      let _fbService = new FBSrvice({ idToken: cred.uid });
      let data = await _fbService.getSearchHistory();
      let drink = data.drink.map((element, index) => {
        if (element !== null) {
          return {
            searchTerm: element.searchTerm,
            index
          }
        }
      });
      let food = data.food.map((element, index) => {
        if (element !== null) {
          return {
            searchTerm: element.searchTerm,
            index
          }
        }
      });
      res.send({ food, drink });
    })
    .catch(err => {
      res.status(403).send("Unauthorized");
    })

});

router.get('/:searchTerm', async function (req, res, next) {
  let _fbService = new FBSrvice({
    searchTerm: req.params.searchTerm
  });
  let data = await _fbService.getRecipes();
  res.send(data);
});

router.get('/:type/:searchTerm', async function (req, res, next) {
  let cookie = req.cookies["session"] || null;
  if (cookie) {
    admin.auth().verifyIdToken(cookie)
      .then(async (decodedToken) => {
        const uid = decodedToken.uid;
        let { type, searchTerm } = req.params;
        type = type.split("-")[0];
        let _fbService = new FBSrvice({ type, searchTerm, uid });
        let data = await _fbService.getRecipes();
        if (data === null) {
          return res.status(404).send('Data not found');
        }
        const user = await _fbService.getUserByUID();
        let resultsIndexes = [];
        user.recipes[`${type}`].forEach(element => {
          if (element.searchTerm === searchTerm) {
            resultsIndexes = element.resultsIndexes;
            data.results = data.results.filter((result, index) => {

              return resultsIndexes.includes(index);
            })
          }
        });
        res.json({ data, resultsIndexes });
      })
      .catch(err => {
        res.status(403).send({ message: 'Unauthorized', err });
      })
  } else {
    res.status(403).send({ message: 'Unauthorized' });
  }
});

module.exports = router;