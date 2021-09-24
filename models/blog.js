const mongoose = require(`mongoose`)
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate-v2')

const BlogSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
})

BlogSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('blogs', BlogSchema)
