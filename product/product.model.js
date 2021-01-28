const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    product_name: { type: String, required: true },
    product_image: [{ type: String, required: true }], // array to store multiple images
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    availability: { type: String, required: true }, // "soldout","onsales"
    price: {type: String, required: true},
    createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', schema);