const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Orderschema = new Schema({
    product_meta: [{
        product_id: { type: Schema.Types.ObjectId, ref:"Product", required: true },
        quantity: { type: String, required: true },
    }],
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, required: true }, // "cart","sent","received","delivered","canceled"
    favorite: {type:Boolean},
    createdDate: { type: Date, default: Date.now }
    
});
Orderschema.methods.favoriteAction = function() {
    //change the previous status of favorite
     this.favorite = !this.favorite
  }

  Orderschema.methods.CancelOrder = function() {
    //change the previous status of favorite
     this.status = "canceled"
  }

  Orderschema.methods.completeOrder = function() {
    //change the previous status of favorite
     this.status = "completed"
  }

  Orderschema.methods.receiveOrder = function() {
    //change the previous status of favorite
     this.status = "received"
  }

  Orderschema.methods.deliverOrder = function() {
    //change the previous status of favorite
     this.status = "delivered"
  }

module.exports = mongoose.model('Order', Orderschema);