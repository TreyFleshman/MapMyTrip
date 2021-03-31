require('dotenv').config();
var express = require('express');
var router = express.Router();
const connection = require('../services/db');

/* GET trips page, display all trips */
router.get('/', (req, res, next) => {

    selectTrips( function (results){
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

    // GET view trip page - demo 
    await selectSingleTrip( async (Singletrip) => {
        console.log('Finding Trips to Display!');
        // Call MongoDB for our photos
        await retrievePhotos(req.db, req.query.id, function(docs){
        res.render('trips/view', {
          trip: Singletrip,
          imageList: docs
        })
      });
    })
});

/* GET images JSON */
router.get('/data', (req, res, next) => {
    findAll(req.db, function(docs){
    res.send(docs);
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

const findAll = async function(mongo_db, callback){
    mongo_db.db(process.env.MONGO_DB_NAME).collection(process.env.MONGO_COLLECTION_NAME).find().toArray
    (function(err, result) {
        callback(result);
    });
};

const retrievePhotos = async function(mongo_db, trip_id, callback){

  var searchString = trip_id + "_";

  // Find all of the documents in the collection
  mongo_db.db(process.env.MONGO_DB_NAME).collection(process.env.MONGO_COLLECTION_NAME).find({fileName: new RegExp(searchString) }).toArray(function(err, docs) {
      callback(docs);
  });
};

module.exports = router;