"use server";
import bookModel from "@/models/BookModel";

import connectDB from "@/database/connectDB";
import "@/models/AuthorModel";
import "@/models/BookDetailModel";
import "@/models/GenreModel";
// GET /books - alle Bücher mit ihren Beziehungen abgerufen und populieren
export const getAllBooks = async () => {
  try {
    // Stelle eine Verbindung zur Datenbank her
    await connectDB();

    // Hole die Seitenzahl aus der Abfrage (Standard ist 1)
    const page = 1;
    // Begrenze auf 10 Dokumente pro Seite
    const limit = 10;
    const skip = (page - 1) * limit;

    // Finde alle Bücher, aber begrenze die Anzahl der zurückgegebenen Dokumente
    const books = await bookModel
      .find({}) // finde alle Bücher aus der Datenbank
      .populate("author", "name") // populieren des Autors mit nur dem Namen
      .populate("detail") // populieren der Buchdetails
      .populate("genres", "name") // populieren der Genres mit nur dem Namen
      .skip(skip) // überspringe die ersten (page - 1) * limit Dokumente
      .limit(limit); // begrenze die Anzahl der zurückgegebenen Dokumente auf 10
    //
    return {
      success: true,
      message: "Alle Bücher erfolgreich abgerufen",
      total: books.length,
      page: page,
      data: JSON.parse(JSON.stringify(books)), // Konvertiere Mongoose-Dokumente in JSON
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};
