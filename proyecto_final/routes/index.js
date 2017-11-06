var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  var r=__dirname.substring(0,__dirname.indexOf('outes'));
  res.render('index.ejs', { path: r });
});

module.exports = router;
