const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: { type: String, required: true },
    images: [{ type: String, required: true }], // array to store multiple images
    address: { type: String, required: true },
    phone_number: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Store', schema);