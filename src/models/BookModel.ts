
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "author",
    required: true,
  },
  detail: { type: mongoose.Schema.Types.ObjectId, ref: "bookDetail" },
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: "genre" }],
});

// Überprüfen, ob das Modell bereits existiert, und es löschen, um Konflikte zu vermeiden
if (mongoose.models && mongoose.models["book"]) {
  delete mongoose.models["book"];
}

const bookModel = mongoose.model("book", bookSchema);

export default bookModel;