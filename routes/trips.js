var express = require('express');
var router = express.Router();

/* GET trips page. */
router.get('/', function(req, res, next) {
  res.render('trips/index', { title: 'Trips' });
});

/* GET to the add trip form */
router.get('/add', (req, res, next) => {    
  res.render('trips/add-trip',{
      title: "Add a Trip",
      key: "", trip: undefined
  });
});

module.exports = router;