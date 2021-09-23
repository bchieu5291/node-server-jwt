const mongoose = require(`mongoose`)
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema

const NewsSchema = new Schema({
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
    classifications: [{ type: mongoose.Types.ObjectId, ref: 'classifications' }],
    createAt: {
        type: Date,
        default: Date.now,
    },
})

NewsSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('news', NewsSchema)
