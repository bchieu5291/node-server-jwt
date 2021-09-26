const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')
var fs = require('fs')
var path = require('path')

var multer = require('multer')
const Book = require('../models/Book')
const Image = require('../models/Image')

const { bookImage } = require('../awss3/bookImageUpload')
const { default_limit } = require('../ultilities/constUtil')

//@GET
//@access private
router.get('/', async (req, res) => {
    try {
        const { title, offset, length } = req.query

        var query = {}
        var payload = {
            title: title || '',
        }
        if (payload.title) query.title = { $regex: payload.title }

        var populateOptions = [{ path: 'imageFile', select: 'imageUrl' }]

        var options = {
            populate: populateOptions,
            sort: { createAt: -1 },
            offset: offset && parseInt(offset) > 0 ? offset : 0,
            limit: length && parseInt(length) != 0 ? parseInt(length) : default_limit,
        }

        const books = await Book.paginate(query, options)

        res.json({ success: true, books: books })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

//@POST
//@access private
router.post('/', bookImage.single('imageFile'), async (req, res) => {
    const { title, description, url, languageId } = req.body

    try {
        // console.log("success");
        // console.log(req.file);

        var imageModel = new Image({
            name: req.file.originalname,
            imageUrl: `${req.file.original.Location}`,
            extension: req.file.original.ContentType,
            size: req.file.size,
        })

        const image = await imageModel.save()

        const book = new Book({
            title: {
                en: title,
                [languageId]: title,
            },
            description: {
                en: description,
                [languageId]: description,
            },
            url: url.startsWith('http://') ? url : `http://${url}`,
            imageFile: image._id,
        })

        await book.save()

        const result = await Book.findOne({ _id: book._id }).populate('imageFile', ['imageUrl'])

        res.json({
            success: true,
            message: 'Successs',
            book: result,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

module.exports = router
