const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

const ClassificationSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    sequence: {
        type: Number,
    },
    news: [{ type: mongoose.Types.ObjectId, ref: "news" }],
});

module.exports = mongoose.model("classifications", ClassificationSchema);
