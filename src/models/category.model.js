import mongoose from "mongoose";
import { DateTime } from "luxon";

const now = new Date();
const CategorySchema = mongoose.Schema({
  name: { type: String, unique: true, required: true },
  image: [{ type: String, required: true }], // array to store multiple images
  createdDate: { type: String, default: DateTime.fromJSDate(now).toString() },
});

const Category = mongoose.model("Category", CategorySchema);
export default Category;
