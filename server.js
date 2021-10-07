require('dotenv').config()
const express = require('express')
const app = express()
const verifyToken = require('./middleware/auth')
const authRouter = require('./routes/authServer')
const postRouter = require('./routes/post')
const newsRouter = require('./routes/news')
const resizeImageRouter = require('./routes/resizeImage')
const classificationRouter = require('./routes/classification')
const classificationGlobalRouter = require('./routes/classificationGlobal')
const blogRouter = require('./routes/blog')
const bookRouter = require('./routes/book')
const contactUsRouter = require('./routes/contactUs')
const userRouter = require('./routes/user')
const mongoose = require('mongoose')
const cors = require('cors')
const AWS = require('aws-sdk')

const connectDB = async () => {
    try {
        await mongoose.connect(
            `mongodb://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@mern-george-shard-00-00.ohcow.mongodb.net:27017,mern-george-shard-00-01.ohcow.mongodb.net:27017,mern-george-shard-00-02.ohcow.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-uu9a3w-shard-0&authSource=admin&retryWrites=true&w=majority`,
            {
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            }
        )

        console.log('MongoDB connected')
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
connectDB()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())

app.get('/', (req, res) =>
    res.json(process.env.MONGO_DB_USER ? `${process.env.MONGO_DB_USER}` : "can't get mongoDB")
)

//app
app.get('/posts', verifyToken, (req, res) => {
    res.json(posts.filter((post) => post.userId === req.userId))
})

app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)
app.use('/api/news', newsRouter)
app.use('/api/resizeImage', resizeImageRouter)
app.use('/api/classifications', classificationRouter)
app.use('/api/classificationGlobal', classificationGlobalRouter)
app.use('/api/blogs', blogRouter)
app.use('/api/books', bookRouter)
app.use('/api/contactUs', contactUsRouter)
app.use('/api/users', userRouter)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log(`server start on port ${PORT}`))
