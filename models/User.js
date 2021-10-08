const mongoose = require(`mongoose`)
const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        uuique: true,
    },
    password: {
        type: String,
        required: true,
    },
    roles: {
        type: String,
        required: true,
        default: 'User',
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('users', UserSchema)
