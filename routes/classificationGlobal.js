const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

const ClassificationGlobal = require('../models/ClassificationGlobal')

//@GET
//@access private
router.get('/', async (req, res) => {
    const { type } = req.query

    try {
        const classifications = await ClassificationGlobal.find({ type: type }).select(['title'])

        res.json({ success: true, data: classifications })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

//@POST
//@access private
router.post('/', async (req, res) => {
    try {
        const { title, type } = req.body

        if (!title || !type) {
            return res.status(400).json({ success: false, message: 'Invalid parameter' })
        }

        const classificationModel = new ClassificationGlobal({
            title,
            type,
        })

        await classificationModel.save()

        res.json({ success: true, classifications: classificationModel })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

module.exports = router
