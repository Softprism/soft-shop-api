const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: { type: String, required: true },
    image: [{ type: String, required: true }], // array to store multiple images
    createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', schema);