const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
var fs = require("fs");
var path = require("path");

const News = require("../models/News");
const ImageModel = require("../models/Image");
const Classification = require("../models/classification");

var multer = require("multer");
const Image = require("../models/Image");

const { profileImage } = require("../awss3/upload");
const classification = require("../models/classification");
const { default_limit } = require("../ultilities/constUtil");

// var storage = multer.diskStorage({
//     destination: "./uploads",
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname);
//     },
// });
// var upload = multer({ storage: storage });

//@GET
//@access private
router.get("/", async (req, res) => {
    try {
        const { title, classifications, page, length } = req.query;

        var query = {};
        var payload = {
            title: title || "",
            classifications: classifications ? classifications.split(",") : null,
        };
        if (payload.title) query.title = { $regex: payload.title };
        if (payload.classifications) query.classifications = { $in: payload.classifications };

        var populateOptions = [
            { path: "imageFile", select: "imageUrl" },
            { path: "classifications", select: "title" },
        ];

        var options = {
            populate: populateOptions,
            offset: page && parseInt(page) > 0 ? (page - 1) * default_limit : 0,
            limit: length && parseInt(length) != 0 ? length : default_limit,
        };

        const news = await News.paginate(query, options);
        // .populate("imageFile", ["imageUrl"])
        // .populate("classifications", ["title"]);

        res.json({ success: true, news: news });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: "General error" });
    }
});

//@POST
//@access private
router.post("/", profileImage.array("imageFile"), async (req, res) => {
    const { title, description, url, classifications } = req.body;

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
                    classifications: classifications.split(","),
                    imageFile: item._id,
                });

                await news.save();

                //update classification
                await Classification.updateMany(
                    { _id: news.classifications },
                    { $push: { news: news._id } }
                );

                const result = await News.findOne({ _id: news._id })
                    .populate("imageFile", ["imageUrl"])
                    .populate("classifications", ["title"]);

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
    const { title, description, url, classifications } = req.body;

    const classificationArray = classifications !== "" ? classifications.split(",") : [];
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

        const oldNews = await News.findOne({ _id: req.params.id });
        const oldClassifications =
            oldNews.classifications.length > 0
                ? oldNews.classifications.map((t) => t._id.toString())
                : [];

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

        updatedNews = {
            ...updatedNews,
            classifications: classificationArray,
        };

        const postUpdateCondition = { _id: req.params.id };
        updatedNews = await News.findOneAndUpdate(postUpdateCondition, updatedNews, {
            new: true,
        });

        const added = difference(classificationArray, oldClassifications);
        const removed = difference(oldClassifications, classificationArray);
        await Classification.updateMany({ _id: added }, { $addToSet: { news: oldNews._id } });
        await Classification.updateMany({ _id: removed }, { $pull: { news: oldNews._id } });

        const result = await News.findOne({ _id: updatedNews._id })
            .populate("imageFile", ["imageUrl"])
            .populate("classifications", ["title"]);

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

        await Classification.updateMany(
            { _id: deletedNews.classifications },
            { $pull: { news: deletedNews._id } }
        );

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

function difference(A, B) {
    const arrA = Array.isArray(A) ? A.map((x) => x.toString()) : [A.toString()];
    const arrB = Array.isArray(B) ? B.map((x) => x.toString()) : [B.toString()];

    const result = [];
    for (const p of arrA) {
        if (arrB.indexOf(p) === -1) {
            result.push(p);
        }
    }

    return result;
}

module.exports = router;
