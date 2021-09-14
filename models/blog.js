const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

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
        ref: "users",
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("blogs", BlogSchema);
