const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')
var fs = require('fs')
var path = require('path')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    port: 465,
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
    secure: true, // upgrades later with STARTTLS -- change this based on the PORT
})

//@POST
//@access private
router.post('/', async (req, res) => {
    const { title, message, email } = req.body

    if (!title || !message || !email) {
        return res.status(400).json({ success: false, message: 'Invalid Params' })
    }

    try {
        const mailData = {
            from: email,
            to: 'hieuden0@gmail.com',
            subject: title,
            text: title,
            html: `<br> ${email}<br> ${title}<br> ${message}`,
        }

        const sendEmaiLResult = await transporter.sendMail(mailData)

        res.json({
            success: true,
            message: 'Successs',
            result: sendEmaiLResult,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

module.exports = router
