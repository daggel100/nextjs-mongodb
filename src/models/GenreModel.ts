

import mongoose from "mongoose";

const genreSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

// Setzen von Virtuals für JSON und Objekt-Transformationen
genreSchema.virtual("books", {
  ref: "book", // referenziert den Modellnamen in BookModel.js
  localField: "_id",
  foreignField: "genres", // die Referenz in der Book-Kollektion weil Genres in einem Array gespeichert sind
});

genreSchema.set("toJSON", { virtuals: true });
genreSchema.set("toObject", { virtuals: true });

if (mongoose.models && mongoose.models["genre"]) {
  delete mongoose.models["genre"];
}
// Überprüfen, ob das Modell bereits existiert, um doppelte Definitionen zu vermeiden

const genreModel = mongoose.model("genre", genreSchema);

export default genreModel;