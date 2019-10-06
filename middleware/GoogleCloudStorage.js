let Promise = require('bluebird');
let GoogleCloudStorage = Promise.promisifyAll(require('@google-cloud/storage'));
const config=require('config');
let storage = GoogleCloudStorage({
    projectId: config.get('google_cloud.projectID'),
    keyFilename: config.get('google_cloud.keyFilename')
})
let BUCKET_NAME = 'my-bucket'
// https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/0.39.0/storage/bucket
let myBucket = storage.bucket(BUCKET_NAME)
// check if a file exists in bucket
// https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/0.39.0/storage/file?method=exists
let file = myBucket.file('myImage.png')
file.existsAsync()
    .then(exists => {
        if (exists) {
            // file exists in bucket
        }
    })
    .catch(err => {
        return err
    })
// upload file to bucket
// https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/0.39.0/storage/bucket?method=upload
let localFileLocation = './public/images/zebra.gif'
myBucket.uploadAsync(localFileLocation, {public: true})
    .then(file => {
        // file saved
    })

// get public url for file
let getPublicThumbnailUrlForItem = file_name => {
    return `https://storage.googleapis.com/${BUCKET_NAME}/${file_name}`
}
