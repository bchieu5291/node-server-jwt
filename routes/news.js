const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
var fs = require("fs");
var path = require("path");

const News = require("../models/News");
const ImageModel = require("../models/Image");

var multer = require("multer");
const Image = require("../models/Image");

const { profileImage } = require("../awss3/upload");

var storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
var upload = multer({ storage: storage });

//@GET
//@access private
router.get("/", async (req, res) => {
    try {
        const news = await News.find({}).populate("imageFile", ["imageUrl"]);

        res.json({ success: true, news: news });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: "General error" });
    }
});

//@POST
//@access private
router.post("/", profileImage.array("imageFile"), async (req, res) => {
    const { title, description, url, status } = req.body;

    try {
        // console.log("success");
        // console.log(req.file);

        var imageReq = {
            name: req.files[0].originalname,
            imageUrl: `${req.files[0].original.Location}`,
            extension: req.files[0].original.ContentType,
            size: req.files[0].size,
        };

        ImageModel.create(imageReq, async (err, item) => {
            if (err) {
                console.log(err);
            } else {
                item.save();

                const news = new News({
                    title,
                    description,
                    url: url.startsWith("http://") ? url : `http://${url}`,
                    imageFile: item._id,
                });

                await news.save();
                const result = await News.findOne({ _id: news._id }).populate("imageFile", [
                    "imageUrl",
                ]);
                res.json({
                    success: true,
                    message: "Successs",
                    news: result,
                });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: "General error" });
    }
});

//@PUT
//@access private
router.put("/:id", profileImage.array("imageFile"), async (req, res) => {
    const { title, description, url, status } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, message: "Title is required" });
    }

    try {
        let imageReq = null;
        if (req.files.length > 0) {
            imageReq = new Image({
                name: req.files[0].originalname,
                imageUrl: `${req.files[0].original.Location}`,
                extension: req.files[0].original.ContentType,
                size: req.files[0].size,
            });
        }

        let updatedNews = {
            title,
            description,
        };

        if (imageReq) {
            await imageReq.save();

            updatedNews = {
                ...updatedNews,
                imageFile: imageReq._id,
            };
        }

        const postUpdateCondition = { _id: req.params.id };
        updatedNews = await News.findOneAndUpdate(postUpdateCondition, updatedNews, {
            new: true,
        });

        const result = await News.findOne({ _id: updatedNews._id }).populate("imageFile", [
            "imageUrl",
        ]);

        //Post not found
        if (!updatedNews) {
            return res.status(401).json({ success: false, message: "Post not found" });
        }

        res.json({ success: true, message: "Successs", news: result });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: "General error" });
    }
});

//@POST
//@access private
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const postdDeleteCondition = { _id: req.params.id };

        const deletedNews = await News.findOneAndDelete(postdDeleteCondition);

        // //user not author to update post
        // if (!deletedPost) {
        //     return res.status(401).json({
        //         success: false,
        //         message: "Post not found || not authorize",
        //     });
        // }

        res.json({ success: true, message: "Successs", news: deletedNews });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: "General error" });
    }
});

module.exports = router;
