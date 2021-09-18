const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')
var fs = require('fs')
const https = require('https')
const awaitRequest = require('../ultilities/await-request')
const promiseRequest = require('request-promise')
const request = require('request')
const util = require('util')

const News = require('../models/News')

var multer = require('multer')
const Image = require('../models/Image')

const { resizeImageNews } = require('../awss3/resizeImageNews')

async function download(url, dest) {
    /* Create an empty file where we can save data */
    const file = fs.createWriteStream(dest)

    /* Using Promises so that we can use the ASYNC AWAIT syntax */
    await new Promise((resolve, reject) => {
        request({
            /* Here you should specify the exact link to the file you are trying to download */
            uri: url,
            gzip: true,
        })
            .pipe(file)
            .on('finish', async () => {
                console.log(`The file is finished downloading.`)
                resolve()
            })
            .on('error', (error) => {
                reject(error)
            })
    }).catch((error) => {
        console.log(`Something happened: ${error}`)
    })
}

var downloadV2 = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type'])
        console.log('content-length:', res.headers['content-length'])

        request(uri).pipe(fs.createWriteStream(filename)).on('finish', callback)
    })
}

//@GET
//@access private
router.get('/', async (req, res) => {
    const news = await News.find({}).populate('imageFile', ['imageUrl'])

    for (const index in news) {
        newsItem = news[index]
        var imageUrlArray = newsItem.imageFile.imageUrl.split('/')
        const fileName = `resizeImage/${imageUrlArray[imageUrlArray.length - 1].replace(
            '-original',
            ''
        )}.jpg`

        await download(newsItem.imageFile.imageUrl, fileName)

        const options = {
            method: 'POST',
            url: `http://${req.headers.host}/api/resizeImage`,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            formData: {
                image: fs.createReadStream(fileName),
            },
        }

        const response = await promiseRequest(options)

        console.log(response)
    }

    res.json({ success: true })
})

//@POST
//@access private
router.post('/', resizeImageNews.single('image'), async (req, res) => {
    // var imageReq = {
    //     name: req.files[0].originalname,
    //     imageUrl: `${req.files[0].original.Location}`,
    //     extension: req.files[0].original.ContentType,
    //     size: req.files[0].size,
    // };

    res.json({ success: true })
})

module.exports = router
