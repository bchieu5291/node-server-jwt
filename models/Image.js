var mongoose = require("mongoose");

var imageSchema = new mongoose.Schema({
    name: String,
    data: Buffer,
    extension: String,
    size: Number,
    imagebase64: String,
});

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model("image", imageSchema);
