const Multer = require('multer');
const {Storage} = require('@google-cloud/storage');


// Multer is required to process file uploads and make them available via
// req.files.
module.exports.multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // no larger than 15mb, you can change as needed.
  },
});

module.exports.bucket = async function() {
    // Instantiate a storage client
    const storage = new Storage();

    // A bucket is a container for objects (files).
    const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
    
    return bucket;
}