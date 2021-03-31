require('dotenv').config();
var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;

const connection = require('../services/db');

const uri = process.env.MONGO_URI;
const dbName = "MapMyTrip";
const client = new MongoClient(uri, { useUnifiedTopology: true });

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

    /* GET view trip page */
    await selectSingleTrip( function (Singletrip){
        client.connect(function(err){
        console.log("Connected to Server!");
        //Pointer to DB
        const db = client.db(dbName);
        var query = { trip_id: req.query.id }
          findImages(db, query, function(docs){
            console.log("Found documents matching results.");
            var imageList = docs
            console.log('Finding Trips to Display!');
            res.render('trips/view', {
            trip: Singletrip,
            imageList    
            });
            return docs;
          })
        });
    });
});

    /* GET images JSON */
    router.get('/data', (req, res, next) => {
        client.connect((err) => {
        //Pointer to DB
            const db = client.db(dbName);
            findAll(db, function(docs){
            res.send(docs);
            })
        });
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

const findImages = function(db, query, callback){
     // Set const that holds docs collection
    const collection = db.collection('Images');

    // Find all documents in collection
    collection.find(query).toArray(function(err, result) {
    callback(result);
    });
};

const findAll = function(db, callback){
     // Set const that holds docs collection
    const collection = db.collection('Images');

    // Find all documents in collection
    collection.find().toArray(function(err, result) {
    callback(result);
    });
};

module.exports = router;