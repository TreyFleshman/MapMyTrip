require('dotenv').config();
var express = require('express');
var router = express.Router();

const connection = require('../services/db');

/* GET trips page, display all trips */
router.get('/', async (req, res, next) => {
  
  await selectTrips( function (results){
    console.log('Finding Trips to Display!');
     res.render('trips/index', { title: 'Trips', tripList: results});
  })
});

/* GET single trip */
router.get('/view', async (req, res, next) => {

    /* GET single trip */
    const selectSingleTrip = async function (callback) {
    console.log('Selecting Trips to view!');

        connection.query(`SELECT * FROM trips WHERE id=${req.query.id}`,
        function(error, Singletrip, fields){
            if (error) throw error;
            callback(Singletrip);
        }) 

    };

    /* GET view trip page */
    await selectSingleTrip( function (Singletrip){
        console.log('Finding Trips to Display!');
        res.render('trips/view', {
        trip: Singletrip    
        });
    })

});

/* GET to the add trip form */
router.get('/add', (req, res, next) => {    
  res.render('trips/add-trip',{
      title: "Add a Trip",
      key: "", trip: undefined
  });
});

/* DELETE a trip */
router.get('/delete', async (req, res, next) => {    
/* GET single trip to DELETE*/
    const deleteTrip = async function () {
      connection.query(`DELETE FROM trips WHERE id=${req.query.id}`);
    };

    await deleteTrip();

   res.redirect('/trips/');

});

/* POST add TRIP form */
router.post('/save', async (req,res,next) => {
    console.log('Creating a new Trip!');
    
    await insertTrip(req.body.title, req.body.date, req.body.desc,
        function() {
            console.log('Insert Trip Callback!');
        }
    );

    res.redirect('/trips/');
    
});

/* HELPER FUNCTIONS */

const insertTrip = async function(name, year, desc, callback) {
  console.log('Inserting Trip into SQL');

  connection.query(
    `INSERT INTO trips (name, year, description)
    VALUES ( "${name}", ${year}, "${desc}" )`,
    function(error, results, fields) {
        if (error) throw error;
        callback(results);
    }
  )

};

const selectTrips = async function(callback) {
  console.log('Selecting Trips to view!');

    connection.query(`SELECT * FROM trips`,
    function(error, results, fields){
        if (error) throw error;
        callback(results);
    }) 

};

module.exports = router;