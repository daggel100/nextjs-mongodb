

import mongoose from "mongoose";

const bookDetailSchema = new mongoose.Schema({
  pages: { type: Number, required: true },
  language: { type: String, required: true },
  summary: { type: String, required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "book", unique: true },
});

if (mongoose.models && mongoose.models["bookDetail"]) {
  delete mongoose.models["bookDetail"];
}

const bookDetailModel = mongoose.model("bookDetail", bookDetailSchema);

export default bookDetailModel;
