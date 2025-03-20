export interface Genre {
  id: string;
  name: string;
}

export interface GenreRelation {
  filmId: string;
  genreId: string;
  film: Film;
  genre: Genre;
}

export interface Casting {
  id: string;
  stageName: string;
  realName?: string;
  photoUrl?: string;
}

export interface CastingRelation {
  id: string;
  filmId: string;
  castingId: string;
  role: string;
  film: Film;
  casting: Casting;
}

export interface Film {
  id: string;
  title: string;
  slug: string;
  description: string;
  posterUrl: string;
  trailerUrl: string;
  duration: number;
  releaseYear: number;
  category: string;
  episode?: number;
  userId: string;
  genres?: string[];
}

export interface User {
    id: string;
    name: string;
    role: string;
}