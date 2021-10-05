import mongoose from 'mongoose';

const CustomFeesSchema = mongoose.Schema({
  title: {type: String},
  amount: {type: Number},
  product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required:   true
  },
  createdDate: { type: Date, default: Date.now },
})
const CustomFee = mongoose.model('CustomFee', CustomFeesSchema);
export default CustomFee