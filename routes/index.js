var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Dine Time' });
});

router.get('/test', function (req, res, next) {
  res.send({ "test": 456 })
})

module.exports = router;
