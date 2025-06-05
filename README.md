This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


-------------------------------------------------------------------------------------------------------------------------------
==============================================================================================================

### MongoDB und Next.js

- Mongoose installieren:

```bash
npm install mongoose
```

- MongoDB installieren

```bash
npm install mongodb
```

- `.env` Datei erstellen und die Verbindungs-URL hinzufügen:

```
MONGODB_URL=mongodb://localhost:27017/meine-datenbank
```

- Erstelle die folgenden Ordner und Dateien innerhalb des `src`:

  - `models`-Ordner für ALLE Mongoose-Modelle
    - `BookModel.ts` für das Buch-Modell
  - `database`-Ordner für die Datenbank-Verbindung
    - `dbConnect.ts` für die Verbindung zur MongoDB
  - `controllers`-Ordner für die Logik der API-Routen (manche nennen es `server-actions`)
    - `BookController.ts` für die Logik der Buch-API-Routen

#### Code

- in `dbConnect.ts`:

```typescript
import mongoose from "mongoose";

const connection: { isConnected?: number } = {};

async function dbConnect() {
  if (connection.isConnected) {
    return;
  }

  const db = await mongoose.connect(process.env.MONGODB_URL!);

  connection.isConnected = db.connections[0].readyState;
  console.log("MongoDB Verbunden!");
}

export default dbConnect;
```

- in `BookModel.ts`:

```typescript
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

if (mongoose.models && mongoose.models["book"]) {
  delete mongoose.models["book"];
}

const bookModel = mongoose.model("book", bookSchema);

export default bookModel;
```

- in `AuthorModel.ts`:

```typescript
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
```

- in `GenreModel.ts`:

```typescript
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
```

- in `BookDetalModel.ts`:

```typescript
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
```

- in `BookController.ts`:

```typescript
"use server";

import authorModel from "@/models/AuthorModel";
import bookDetailModel from "@/models/BookDetailModel";
import bookModel from "@/models/BookModel";
import genreModel from "@/models/GenreModel";
import mongoose from "mongoose";

export const createBook = async (bookData: any) => {
  // - Eine Session ermöglicht es, mehrere Operationen in einer Transaktion auszuführen, und hilft, Datenkonsistenz zu gewährleisten, ohne dass Daten verloren gehen, wenn ein Fehler auftritt.
  // - der minimiert die anzahl der Datenbankoperationen, die durchgeführt werden müssen, und stellt sicher, dass alle Operationen entweder erfolgreich abgeschlossen oder zurückgerollt werden, falls ein Fehler auftritt.
  const session = await mongoose.startSession(); // diese Zeile startet eine neue Session für Transaktionen
  session.startTransaction();
  try {
    const { title, genres, detailData, author: authorName } = bookData;

    // Finde oder erstelle den Autor.
    let author = await authorModel
      .findOne({ name: authorName })
      .session(session);
    if (!author) {
      const createdAuthor = await authorModel.create([{ name: authorName }], {
        session,
      });
      author = createdAuthor[0];
    }

    // Process genres: find or create each genre and store their _id's.
    const genreIds = [];
    for (const genreName of genres) {
      let genre = await genreModel
        .findOne({ name: genreName })
        .session(session);
      if (!genre) {
        const createdGenre = await genreModel.create([{ name: genreName }], {
          session,
        });
        genre = createdGenre[0];
      }
      genreIds.push(genre._id);
    }

    // Create the book detail inside the transaction.
    const newDetail = await bookDetailModel.create([detailData], { session });

    // Create the book using the verified/created author and processed genre ids.
    const book = await bookModel.create(
      [
        {
          title,
          author: author._id,
          detail: newDetail[0]._id,
          genres: genreIds,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return {
      success: true,
      message: "Book created successfully",
      data: JSON.parse(JSON.stringify(book[0])),
    };
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    return {
      success: false,
      message: err.message,
    };
  }
};

// GET /books - alle Bücher mit ihren Beziehungen abgerufen und populieren
export const getAllBooks = async () => {
  try {
    // Hole die Seitenzahl aus der Abfrage (Standard ist 1)
    const page = 1;
    // Begrenze auf 10 Dokumente pro Seite
    const limit = 10;
    const skip = (page - 1) * limit;

    // Finde alle Bücher, aber begrenze die Anzahl der zurückgegebenen Dokumente
    const books = await bookModel
      .find() // finde alle Bücher aus der Datenbank
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

// GET /books/:id - hole einen Buch anhand seiner ID zusammen mit die bezogenen Dokumente
export const getBookById = async (bookId: string) => {
  try {
    const book = await bookModel
      .findById(bookId)
      .populate("author", "name")
      .populate("detail")
      .populate("genres", "name");
    if (!book) {
      return { success: false, message: "bookModel not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(book)) };
  } catch (err: any) {
    return { success: fhttps://picsum.photos/seed/${book._id}/100/100`alse, message: err.message };
  }
};

// DELETE /books/:id - löschen eines Buchesres.status(500).json({ message: err.message });
export const deleteBook = async (bookId: string) => {
  try {
    const deletedBook = await bookModel.findByIdAndDelete(bookId);
    if (!deletedBook) {
      return { success: false, message: "bookModel not found" };
    }
    return { success: true, message: "Book deleted successfully" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};
```

- in `route.ts`:

```typescript
import dbConnect from "@/database/connectDB";
import bookModel from "@/models/BookModel";
import "@/models/BookModel";
import "@/models/AuthorModel";
import "@/models/BookDetailModel";
import "@/models/GenreModel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

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
```


- in `interfaces` - Ordner erstelle eine `index.tsx`-Datei
mit folgenden Inhalt:

````typeScript

```
