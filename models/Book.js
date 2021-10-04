const mongoose = require(`mongoose`)
const mongoosePaginate = require('mongoose-paginate-v2')
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

const Schema = mongoose.Schema

const BookSchema = new Schema({
    title: {
        type: Object,
        required: true,
    },
    description: {
        type: Object,
    },
    url: {
        type: String,
    },
    imageFile: {
        type: Schema.Types.ObjectId,
        ref: 'image',
    },
    bookFile: {
        type: Schema.Types.ObjectId,
        ref: 'documentFile',
    },
    classifications: [{ type: mongoose.Types.ObjectId, ref: 'classificationGlobal' }],
    type: {
        type: String,
        default: 'book',
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
})

BookSchema.plugin(mongoosePaginate)
BookSchema.plugin(aggregatePaginate)

module.exports = mongoose.model('book', BookSchema)
