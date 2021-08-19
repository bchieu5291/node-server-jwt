require('dotenv').config()
const express = require('express')
const jwt =  require('jsonwebtoken');
const app = express()
const verifyToken = require('./middleware/auth')


app.use(express.json());

//database
const posts = [
    {
        userId: 1,
        post: "post henry"
    },
    {
        userId: 2,
        post: "post george"
    }
]


//app
app.get('/posts', verifyToken, (req, res) => {
    res.json(posts.filter(post => post.userId === req.userId))
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log(`server start on port ${PORT}`))