const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

const User = require('../models/User')

//@GET
//@access private
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select(['username', 'createAt'])
        res.json({ success: true, data: users })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, message: 'General error' })
    }
})

// //@POST
// //@access private
// router.post("/", verifyToken, async (req, res) => {
//     const { title, description, url, status } = req.body;

//     if (!title) {
//         return res.status(400).json({ success: false, message: "Title is required " });
//     }

//     try {
//         const newPost = new Post({
//             title,
//             description,
//             url: url.startsWith("http://") ? url : `http://${url}`,
//             status: status || "TO LEANN",
//             user: req.userId,
//         });

//         await newPost.save();

//         res.json({ success: true, message: "Successs", post: newPost });
//     } catch (error) {
//         console.log(error);
//         return res.status(400).json({ success: false, message: "General error" });
//     }
// });

// //@PUT
// //@access private
// router.put("/:id", verifyToken, async (req, res) => {
//     const { title, description, url, status } = req.body;

//     if (!title) {
//         return res.status(400).json({ success: false, message: "Title is required" });
//     }

//     try {
//         let updatedPost = {
//             title,
//             description: description || "",
//             url: url.startsWith("http://") ? url : `http://${url}`,
//             status: status || "TO LEANN",
//         };

//         const postUpdateCondition = { _id: req.params.id, user: req.userId };

//         updatedPost = await Post.findOneAndUpdate(postUpdateCondition, updatedPost, { new: true });

//         //user not author to update post
//         if (!updatedPost) {
//             return res
//                 .status(401)
//                 .json({ success: false, message: "Post not found || not authorize" });
//         }

//         res.json({ success: true, message: "Successs", post: updatedPost });
//     } catch (error) {
//         console.log(error);
//         return res.status(400).json({ success: false, message: "General error" });
//     }
// });

// //@POST
// //@access private
// router.delete("/:id", verifyToken, async (req, res) => {
//     try {
//         const postdDeleteCondition = { _id: req.params.id, user: req.userId };

//         const deletedPost = await Post.findOneAndDelete(postdDeleteCondition);

//         //user not author to update post
//         if (!deletedPost) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Post not found || not authorize",
//             });
//         }

//         res.json({ success: true, message: "Successs", post: deletedPost });
//     } catch (error) {
//         console.log(error);
//         return res.status(400).json({ success: false, message: "General error" });
//     }
// });

module.exports = router
