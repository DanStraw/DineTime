var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send([{ name: "Dan", age: 34 }, { name: "Liz", age: 30 }]);
});


//add user to firebase db
router.post("/adduser", function (req, res) {
  console.log('req:', req.body);
})




module.exports = router;
