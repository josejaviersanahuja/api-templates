var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const paramsToRender = {
    title: 'Express',
    pageclass: 'home',
    description:'This is the Hompage of this API-TEMPLATE'
  }
  res.render('index', paramsToRender);
});

module.exports = router;
