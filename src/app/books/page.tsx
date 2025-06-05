import { IBook } from "@/interfaces";
import Image from "next/image";
import { getAllBooks } from "@/controllers/BookController";

const AllBooksPage = async () => {
  // Langsame Internet simulieren ( 2 Sekunden Stau)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Daten fetchen von externer API
  // const response = await fetch("https://backend-relation.onrender.com/books");

  // Daten von MongoDB über den Controller methode abholen
  const books = await getAllBooks();
  // Überprüfen, ob die Antwort erfolgreich war
  if (!books.success) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-center text-red-600">
          Fehler beim Abrufen der Bücher
        </h1>
        <p className="text-center">{books.message}</p>
      </div>
    );
  }
  // Wenn die Länge der Bücher 0 ist, dann eine Nachricht anzeigen
  if (books.data.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-center text-yellow-600">
          Keine Bücher gefunden
        </h1>
        <p className="text-center">
          Es gibt derzeit keine Bücher in der Datenbank.
        </p>
      </div>
    );
  }

  // Bücher aus der Antwort extrahieren
  const booksResponse: IBook[] = books.data;

  // in die Konsole loggen
  // console.log(booksResponse);

  return (
    <>
      <h1 className="text-3xl font-bold mb-4 text-center text-amber-700">
        Alle Bücher
      </h1>
      <ul className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {booksResponse.map((book) => (
          <li
            key={book._id}
            className="mb-4 p-4 border rounded-lg bg-slate-100 shadow-md text-slate-800">
            <h2 className="text-2xl font-semibold mb-2 text-amber-700">
              {book.title}
            </h2>
            <Image
              src={`https://picsum.photos/seed/${book._id}/100/100`}
              height={300}
              width={200}
              alt="Book Cover"
            />

            <p className="text-mint-500">Author: {book.author.name}</p>
            <p>Pages: {book.detail.pages}</p>
            <p>Language: {book.detail.language}</p>
            {/* <p>Summary: {book.detail.summary}</p> */}
            <p>Genres: {book.genres.map((genre) => genre.name).join(", ")}</p>
          </li>
        ))}
      </ul>
    </>
  );
};
export default AllBooksPage;
