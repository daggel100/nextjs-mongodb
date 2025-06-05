

export interface IBook {
  _id: string;
  title: string;
  author: IAuthor;
  detail: IDetail;
  genres: IGenre[];
  __v: number;
}

export interface IAuthor {
  _id: string;
  name: string;
  id: string;
}

export interface IDetail {
  _id: string;
  pages: number;
  language: string;
  summary: string;
  __v: number;
  book: string;
}

export interface IGenre {
  _id: string;
  name: string;
  id: string;
}
