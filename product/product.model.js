const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Productschema = new Schema({
    product_name: { type: String, required: true },
    product_image: [{ type: String, required: true }], // array to store multiple images
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    availability: { type: Boolean, required: true },
    price: {type: String, required: true},
    createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', Productschema);