const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

const Blog = require('../models/blog')
const { default_limit } = require('../ultilities/constUtil')

//@GET
//@access private
router.get('/', verifyToken, async (req, res) => {
    try {
        const blogs = await Blog.find({ user: req.userId })
            .sort({ createAt: 'desc' })
            .populate('user', ['username'])

        res.json({ success: true, blogs: blogs })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

router.get('/public', async (req, res) => {
    try {
        // const blogs = await Blog.find().sort({ createAt: 'desc' }).populate('user', ['username'])

        const { title, offset, length } = req.query

        var query = {}
        var payload = {
            title: title || '',
        }

        if (payload.title) query.title = { $regex: payload.title }

        var populateOptions = [
            { path: 'imageFile', select: 'imageUrl' },
            { path: 'classifications', select: 'title' },
        ]

        var options = {
            populate: populateOptions,
            sort: { createAt: -1 },
            offset: offset && parseInt(offset) > 0 ? offset : 0,
            limit: length && parseInt(length) != 0 ? parseInt(length) : default_limit,
        }

        const blogs = await Blog.paginate(query, options)

        res.json({ success: true, blogs: blogs })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

//@BLOG
//@access private
router.post('/', verifyToken, async (req, res) => {
    const { title, description } = req.body

    if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required ' })
    }

    try {
        const newBlog = new Blog({
            title,
            description,
            user: req.userId,
        })

        await newBlog.save()

        res.json({ success: true, message: 'Successs', blog: newBlog })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

//@PUT
//@access private
router.get('/:id', async (req, res) => {
    try {
        const findBlogCondition = { _id: req.params.id }

        const existBlog = await Blog.findOne(findBlogCondition)

        //user not author to update blog
        if (!existBlog) {
            return res.status(401).json({
                success: false,
                message: 'Blog not found',
            })
        }

        res.json({ success: true, message: 'Successs', blog: existBlog })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

//@PUT
//@access private
router.put('/:id', verifyToken, async (req, res) => {
    const { title, description, url, status } = req.body

    if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required' })
    }

    try {
        let updatedBlog = {
            title,
            description: description || '',
        }

        const blogUpdateCondition = { _id: req.params.id, user: req.userId }

        updatedBlog = await Blog.findOneAndUpdate(blogUpdateCondition, updatedBlog, { new: true })

        //user not author to update blog
        if (!updatedBlog) {
            return res
                .status(401)
                .json({ success: false, message: 'Blog not found || not authorize' })
        }

        res.json({ success: true, message: 'Successs', blog: updatedBlog })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

//@BLOG
//@access private
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const blogdDeleteCondition = { _id: req.params.id, user: req.userId }

        const deletedBlog = await Blog.findOneAndDelete(blogdDeleteCondition)

        //user not author to update blog
        if (!deletedBlog) {
            return res.status(401).json({
                success: false,
                message: 'Blog not found || not authorize',
            })
        }

        res.json({ success: true, message: 'Successs', blog: deletedBlog })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

module.exports = router
