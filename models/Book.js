const mongoose = require(`mongoose`)
const mongoosePaginate = require('mongoose-paginate-v2')
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
    createAt: {
        type: Date,
        default: Date.now,
    },
})

BookSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('book', BookSchema)
