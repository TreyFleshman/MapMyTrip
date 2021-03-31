var express = require('express');
var router = express.Router();
const {format} = require('util');
const gcsService = require('../services/gcs_upload_service');

/* GET new photo upload form */
router.get('/new', function(req, res, next) {
  tripID = req.query.id;
  res.render('photos/newphoto', { id: tripID });
});


/* POST new photo upload form */
router.post('/upload', gcsService.multer.single('file'), async (req, res, next) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  /* The GCF requires that the uploaded file's name be the tripID (so it can be associated with the correct trip later on.) */
  const filename=req.file.originalname.split('.').shift();

  // Use the original file's extension
  const fileExtension=getFileExtension(req.file.originalname.split('.').pop());
  
  // Set up connection to the bucket and a file placeholder  
  const bucket = await gcsService.bucket();
  const blob = await bucket.file(tripID + '%' + filename + '.' + fileExtension);

  /* Open a new stream for writing; set the content type of the streamed file equal to the content type of the file the user uploaded in the form */
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });

  blobStream.on('error', err => {
    console.log('!!!!! UPLOAD ERROR: ' + err);
    next(err);
  });
  
  blobStream.on('finish', () => {
    // Redirect the user to the home page of the trip
    res.redirect('/trips/');
  });

  blobStream.end(req.file.buffer);
});

module.exports = router;


// HELPER FUNCTION
function getFileExtension(filename) {
    return filename;
}