var express = require('express');
var router = express.Router();
let fbService = require('../services/FirebaseService');
let FBSrvice = fbService.FirebaseService;


router.get('/:searchTerm', async function (req, res, next) {
  let _fbService = new FBSrvice({
    searchKey: req.params.searchTerm
  });
  let data = await _fbService.getRecipes();
  res.send(data.val());
});

router.get('/:recipeType/:searchTerm', async function (req, res, next) {
  let _fbService = new FBSrvice({ searchKey: req.params.searchTerm });
  let data = await _fbService.getRecipes();
  res.send(data.val());
})

router.get('/removeChild', function (req, res, next) {
  return fbService.childRemovedListener();
});

router.get('/', async function (req, res, next) {
  let _fbService = new FBSrvice(null);
  let data = await _fbService.getSearchHistory();
  res.send(data.val());
});

router.post('/dish/:term', async function (req, res, next) {
  let _fbService = new FBSrvice({
    term: req.body.searchTerm,
    type: 'food'
  });
  let data = await _fbService.searchDish();
  console.log('sending data dishing: ' + data);
  res.send(data);
});

router.post('/drink/:term', async function (req, res, next) {
  let _fbService = new FBSrvice({
    term: req.params.term,
    type: 'drink'
  });
  const data = await _fbService.searchDrink()
    .then(function (response) {
      let responseData = _fbService.saveResults();
      return responseData;
    });
  res.send(data);

})

router.delete('/:searchTerm', async function (req, res, next) {

  let _fbService = new FBSrvice({
    term: req.params.searchTerm,
  });
  await _fbService.deleteSearch().then(function (response) {
    res.send(response);
  }).catch(function (err) {
    res.send(err);
  })
})

router.delete('/:searchTerm/:index', async function (req, res, next) {
  console.log('router delete single recipe');
  let _fbService = new FBSrvice({
    key: req.params.searchTerm,
    index: req.params.index,
    results: [],
    type: null
  });

  await _fbService.deleteRecipe().then(function (response) {
    res.send(response);
  }).catch(function (err) {
    res.send(err);
  });
})

module.exports = router;