const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone_number: { type: String, required: true },
    address: [{ type: String, required: true }],
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order"}], // array to store multiple orders
    createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', schema);