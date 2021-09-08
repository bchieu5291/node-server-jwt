const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

const NewsSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    url: {
        type: String,
    },
    imageFile: {
        type: Schema.Types.ObjectId,
        ref: "image",
    },
    classifications: [{ type: mongoose.Types.ObjectId, ref: "classifications" }],
    createAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("news", NewsSchema);
