

import mongoose from "mongoose";

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

// Virtual um Bücher für einen Autor zu befüllen
authorSchema.virtual("books", {
  ref: "book", // referenziert den Modellnamen in BookModel.js
  localField: "_id",
  foreignField: "author",
});

// Setzen von Virtuals für JSON und Objekt-Transformationen
authorSchema.set("toJSON", { virtuals: true });
authorSchema.set("toObject", { virtuals: true });

if (mongoose.models && mongoose.models["author"]) {
  delete mongoose.models["author"];
}

const authorModel = mongoose.model("author", authorSchema);

export default authorModel;
