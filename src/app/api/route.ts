

import connectDB from "@/database/connectDB";
import bookModel from "@/models/BookModel";
import "@/models/AuthorModel";
import "@/models/BookDetailModel";
import "@/models/GenreModel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const page = 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const allBooks = await bookModel
      .find({})
      .populate("author", "name")
      .populate("detail")
      .populate("genres", "name")
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      message: "Alle Bücher erfolgreich abgerufen",
      total: allBooks.length,
      page: page,
      data: allBooks,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      { status: 500 }
    );
  }
}


// import connectDB from "@/database/connectDB";


// export async function GET() {
//   try {


//     await connectDB();


//     return new Response("MongoDB Verbunden!");
    
//   } catch (error) {
//     console.error("Fehler beim Verbinden mit MongoDB:", error);
//     return new Response("Fehler beim Verbinden mit MongoDB", { status: 500 });
//   }
// }