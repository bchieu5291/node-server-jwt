const AWS = require('aws-sdk')

function diacriticSensitiveRegex(string = '') {
    return string
        .replace(/a/g, '[a,á,à,ả,ã,ạ]')
        .replace(/e/g, '[e,è,é,ẻ,ẽ,ẹ]')
        .replace(/i/g, '[i,ì,í,ỉ,ĩ,ị]')
        .replace(/o/g, '[o,ò,ó,ỏ,õ,ọ]')
        .replace(/u/g, '[u,ù,ú,ủ,ũ,ụ]')
        .replace(/y/g, '[y,ỳ,ý,ỷ,ỹ,ỵ]')
}

const s3Config = new AWS.S3({
    accessKeyId: process.env.AWS_IAM_USER_KEY,
    secretAccessKey: process.env.AWS_IAM_USER_SECRET,
    Bucket: process.env.AWS_BUCKET_NAME,
})

const deleteS3FileWithPrefix = async (fileName) => {
    var params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: `bookImage/${fileName}`,
    }
    try {
        const listObjectWithPrefix = await s3Config.listObjects(params).promise()
        var deleteObjects = []
        for (var k in listObjectWithPrefix.Contents) {
            deleteObjects.push({ Key: listObjectWithPrefix.Contents[k].Key })
        }
        var deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Delete: {
                Objects: deleteObjects,
            },
        }
        s3Config.deleteObjects(deleteParams, function (err, data) {
            if (data) {
                console.log('File successfully deleted')
            } else {
                console.log('Check with error message ' + err)
            }
        })
    } catch (error) {
        console.log(error)
    }
}

const deleteS3File = async (fileName) => {
    try {
        var deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `bookFile/${fileName}`,
        }
        s3Config.deleteObject(deleteParams, function (err, data) {
            if (data) {
                console.log('File successfully deleted')
            } else {
                console.log('Check with error message ' + err)
            }
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    diacriticSensitiveRegex,
    deleteS3FileWithPrefix,
    deleteS3File,
}
