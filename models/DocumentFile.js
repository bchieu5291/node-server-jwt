var mongoose = require('mongoose')

var documentFileSchema = new mongoose.Schema({
    name: String,
    data: Buffer,
    extension: String,
    size: Number,
    fileUrl: String,
})

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model('documentFile', documentFileSchema)
