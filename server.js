require("dotenv").config();
const express = require("express");
const app = express();
const verifyToken = require("./middleware/auth");
const authRouter = require("./routes/authServer");
const postRouter = require("./routes/post");
const newsRouter = require("./routes/news");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const cors = require("cors");

const connectDB = async () => {
    try {
        await mongoose.connect(
            `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@mern-george.ohcow.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
            {
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            }
        );

        console.log("MongoDB connected");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};
connectDB();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

//database
const posts = [
    {
        userId: 1,
        post: "post henry",
    },
    {
        userId: 2,
        post: "post george",
    },
];

app.get("/", (req, res) =>
    res.json(process.env.MONGO_DB_USER ? `${process.env.MONGO_DB_USER}` : "can't get mongoDB")
);

//app
app.get("/posts", verifyToken, (req, res) => {
    res.json(posts.filter((post) => post.userId === req.userId));
});

app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/news", newsRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`server start on port ${PORT}`));
