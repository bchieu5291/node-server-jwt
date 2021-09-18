require('dotenv').config()
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const s3Storage = require('multer-sharp-s3')
const crypto = require('crypto')

const s3Config = new AWS.S3({
    accessKeyId: process.env.AWS_IAM_USER_KEY,
    secretAccessKey: process.env.AWS_IAM_USER_SECRET,
    Bucket: process.env.AWS_BUCKET_NAME,
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

// this is just to test locally if multer is working fine.
// const storage = multer.diskStorage({
//     destination: (req, res, cb) => {
//         cb(null, "src/media");
//     },
//     filename: (req, file, cb) => {
//         cb(null, new Date().toISOString() + "-" + file.originalname);
//     },
// });

const storageSharp = s3Storage({
    s3: s3Config,
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: function (req, file, cb) {
        cb(null, `${file.originalname.replace('.png', '').replace('.jpg', '')}`)
    },
    // Key: (req, file, cb) => {
    //     crypto.pseudoRandomBytes(16, (err, raw) => {
    //         cb(err, err ? undefined : raw.toString("hex"));
    //     });
    // },
    ACL: 'private',
    multiple: true,
    resize: [
        // { suffix: "xlg", width: 1200, height: 1200 },
        { suffix: 'banner', width: 1920, height: 650 },
        { suffix: 'firstNews', width: 1106, height: 514 },
        { suffix: 'restNews', width: 473, height: 220 },
        { suffix: 'detail', width: 1024, height: 573 },
        { suffix: 'related', width: 500, height: 300 },
        { suffix: 'original' },
    ],
})

// const multerS3Config = multerS3({
//     s3: s3Config,
//     bucket: process.env.AWS_BUCKET_NAME,
//     metadata: function (req, file, cb) {
//         cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//         cb(null, new Date().toISOString() + "-" + file.originalname);
//     },
// });

const upload = multer({
    storage: storageSharp,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5, // we are allowing only 5 MB files
    },
})

exports.resizeImageNews = upload
