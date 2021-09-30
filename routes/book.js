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
            url: url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`,
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

//@GET
//@public private
router.get('/:id', async (req, res) => {
    try {
        const findBookCondition = { _id: req.params.id }

        const existBook = await Book.findOne(findBookCondition).populate('imageFile', ['imageUrl'])

        //user not author to update blog
        if (!existBook) {
            return res.status(401).json({
                success: false,
                message: 'Book not found',
            })
        }

        res.json({ success: true, message: 'Successs', book: existBook })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

//@PUT
//@access private
router.put('/:id', bookImage.single('imageFile'), async (req, res) => {
    const { title, description, url, languageId } = req.body

    if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required' })
    }

    try {
        let imageReq = null
        if (req.file) {
            imageReq = new Image({
                name: req.file[0].originalname,
                imageUrl: `${req.file[0].original.Location}`,
                extension: req.file[0].original.ContentType,
                size: req.file[0].size,
            })
        }

        const oldNews = await Book.findOne({ _id: req.params.id })

        let updatedBook = {
            title: {
                ...oldNews.title,
                [languageId]: title,
            },
            description: {
                ...oldNews.description,
                [languageId]: description,
            },
            url: url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`,
        }

        if (imageReq) {
            await imageReq.save()

            updatedBook = {
                ...updatedBook,
                imageFile: imageReq._id,
            }
        }

        updatedBook = {
            ...updatedBook,
        }

        const postUpdateCondition = { _id: req.params.id }
        updatedBook = await Book.findOneAndUpdate(postUpdateCondition, updatedBook, {
            new: true,
        })

        //Post not found
        if (!updatedBook) {
            return res.status(401).json({ success: false, message: 'Post not found' })
        }

        const result = await Book.findOne({ _id: updatedBook._id }).populate('imageFile', [
            'imageUrl',
        ])

        res.json({ success: true, message: 'Successs', book: result })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

//@POST
//@access private
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const postdDeleteCondition = { _id: req.params.id }

        const deletedBook = await Book.findOneAndDelete(postdDeleteCondition)

        //user not author to update post
        if (!deletedBook) {
            return res.status(401).json({
                success: false,
                message: 'Book not found || not authorize',
            })
        }

        res.json({ success: true, message: 'Successs', book: deletedBook })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

module.exports = router
