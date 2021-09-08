const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

const Classification = require("../models/classification");

//@GET
//@access private
router.get("/", async (req, res) => {
    try {
        const classifications = await Classification.find({}).select(["_id", "title"]);

        res.json({ success: true, classifications: classifications });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: "General error" });
    }
});

module.exports = router;
