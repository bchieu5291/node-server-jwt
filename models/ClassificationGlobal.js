const mongoose = require(`mongoose`)
const Schema = mongoose.Schema

const ClassificationGlobalSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    sequence: {
        type: Number,
    },
})

module.exports = mongoose.model('classificationGlobal', ClassificationGlobalSchema)
