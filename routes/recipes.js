var express = require('express');
var router = express.Router();
const { DrinkSearch } = require("../models/DrinkSearch");
const { DishSearch } = require("../models/DishSearch");
const { IngredientsSearch } = require('../models/IngredientsSearch');
let fbService = require('../services/FirebaseService');
let FBSrvice = fbService.FirebaseService;
var admin = require("../services/fbAdmin");

router.post('/:type', async function (req, res, next) {
  let cookie = req.cookies["session"] || null;
  let recipeSearch = req.params.type === 'food' ? new DishSearch(req.body["term[]"] || req.body.term, "food") : req.params.type === 'drink' ? new DrinkSearch(req.body["term[]"] || req.body.term, "drink") : new IngredientsSearch(req.body["term"], "ingredients");
  let result;
  if (recipeSearch.type === 'ingredients') {

    while (recipeSearch.results.length < 10 && recipeSearch.resultsLengthChanged === true || recipeSearch.startIndex <= 20) {
      await recipeSearch.searchIngredients();
      recipeSearch.filterIngredients();
      recipeSearch.filterResultsByMatchPerc();
      recipeSearch.sortResultsByMatchPerc();
      recipeSearch.filterTopTenResults();
      recipeSearch.updateStartIndex();
      result = recipeSearch.returnResults();
    }
  } else {
    result = await recipeSearch.searchAPI();
  }
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
      const key = await _fbService.saveResults();
      res.send({
        searchTerm: recipeSearch.searchTerm,
        type: recipeSearch.type,
        results: recipeSearch.results,
        key: key
      });
    })
      .catch(err => {
        return res.send({
          searchTerm: recipeSearch.searchTerm,
          type: recipeSearch.type,
          results: recipeSearch.results,
          key: 0
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
  const sessionToken = req.cookies.session || "";
  admin.auth().verifyIdToken(sessionToken, true)
    .then(async (cred) => {
      let _fbService = new FBSrvice({ idToken: cred.uid });
      let data = await _fbService.getSearchHistory();
      res.send({ data });
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

router.get('/:type/:dbKey', async function (req, res, next) {
  let cookie = req.cookies["session"] || null;
  if (cookie) {
    admin.auth().verifyIdToken(cookie)
      .then(async (decodedToken) => {
        const uid = decodedToken.uid;
        let { type, dbKey } = req.params;

        type = type.split("-")[0];
        let _fbService = new FBSrvice({ type, dbKey, uid });
        let data = await _fbService.getRecipes();
        if (data === null) {
          return res.status(404).send('Data not found');
        }
        const user = await _fbService.getUserByUID();
        let resultsIndexes = user.recipes[`${type}`][`${dbKey}`]['resultsIndexes'];;

        data.results = data.results.filter((result, index) => {
          return resultsIndexes.includes(index);
        })

        res.json({ data, resultsIndexes });
      })
      .catch(err => {
        res.status(403).send({ message: 'Unauthorized', err });
      })
  } else {
    res.status(403).send({ message: 'Unauthorized' });
  }
});

router.get('/:type/term/:term', async function (req, res, next) {
  let cookie = req.cookies["session"] || null;
  if (cookie) {
    admin.auth().verifyIdToken(cookie)
      .then(async (decodedToken) => {
        const uid = decodedToken.uid;
        let { type, term } = req.params;

        const _fbService = new FBSrvice({ type });
        const searches = await _fbService.getSearchesByType();
        for (const search in searches) {
          if (search.searchTerm === term) {
            return res.json({ search, match: true })
          }
        }
        return res.json({ search: null, match: false });
      });
  } else {
    return res.json({ search: null, match: false });
  }
});

module.exports = router;