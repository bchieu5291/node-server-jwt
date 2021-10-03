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
    if (file.fieldname === 'imageFile') {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true)
        } else {
            cb(null, false)
        }
    } else {
        if (file.mimetype === 'application/pdf' || file.mimetype === 'application/epub') {
            cb(null, true)
        } else {
            cb(null, false)
        }
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
    // Key: function (req, file, cb) {
    //     cb(null, `400_400/${new Date().toISOString()}-${file.originalname}_400x400`);
    // },
    Key: (req, file, cb) => {
        if (file.fieldname === 'imageFile') {
            crypto.pseudoRandomBytes(16, (err, raw) => {
                cb(err, err ? undefined : `bookImage/${raw.toString('hex')}`)
            })
        } else {
            crypto.pseudoRandomBytes(16, (err, raw) => {
                cb(err, err ? undefined : `bookFile/${file.originalname}`)
            })
        }
    },
    ACL: 'private',
    multiple: true,
    resize: [
        { suffix: 'banner', width: 1920, height: 650 },
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
        fileSize: 1024 * 1024 * 20, // we are allowing only 5 MB files
    },
})

exports.bookImage = upload
