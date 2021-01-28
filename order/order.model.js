const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Orderschema = new Schema({
    products: { type: Schema.Types.ObjectId, unique: true, ref:"Product", required: true },
    quantity: { type: String, required: true },
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, required: true }, // "cart","sent","received","delivered"
    createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', Orderschema);