const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    products: { type: Schema.Types.ObjectId, ref:"Product", required: true },
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, required: true }, // "cart","sent","received","delivered"
    createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Orders', schema);