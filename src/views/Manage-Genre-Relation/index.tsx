import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Alert } from "@/components/ui/alert";
import { useRouter } from "next/router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Genre {
  id: string;
  name: string;
}

interface GenreRelation {
  filmId: string;
  genreId: string;
  film: {
    id: string;
    title: string;
  };
  genre: {
    id: string;
    name: string;
  };
}

interface Film {
  id: string;
  title: string;
}

interface GenreRelationFormProps {
  onSaveGenreRelation: () => void;
  onCancel: () => void;
  filmId: string;
  existingGenres: string[];
}

const GenreRelationForm: React.FC<GenreRelationFormProps> = ({ onSaveGenreRelation, onCancel, filmId, existingGenres }) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(existingGenres || []);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllGenres = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get<Genre[]>("/api/genre", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setAvailableGenres(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Gagal mengambil data genre", error);
        setLoading(false);
      }
    };

    fetchAllGenres();
  }, []);

  const handleGenreToggle = (genreId: string) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get('token');
    
    if (!token) {
      console.error("User tidak ditemukan atau belum login.");
      return;
    }

    try {
      const payload = {
        filmId,
        genreId: selectedGenres
      };

      await axios.put("/api/genre-relation", payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      onSaveGenreRelation();
    } catch (error) {
      console.error("Gagal menyimpan genre relation", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-t-lg mb-6">
        <h2 className="text-2xl font-semibold text-white">Kelola Genre untuk Film</h2>
      </div>

      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-400">Memuat genre...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Pilih Genre (multiple)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableGenres.map((genre) => (
                <div
                  key={genre.id}
                  className={`flex items-center space-x-2 p-3 rounded-lg transition-all duration-200 ${
                    selectedGenres.includes(genre.id)
                      ? "bg-yellow-50 dark:bg-yellow-900 border border-yellow-500"
                      : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <Checkbox
                    id={`genre-${genre.id}`}
                    checked={selectedGenres.includes(genre.id)}
                    onCheckedChange={() => handleGenreToggle(genre.id)}
                    className="w-5 h-5 text-yellow-600 border-2 border-yellow-500 rounded-md focus:ring-yellow-500"
                  />
                  <label
                    htmlFor={`genre-${genre.id}`}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {genre.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
            >
              Simpan Genre
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

const ManageGenreRelation = () => {
  const [genreRelations, setGenreRelations] = useState<GenreRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [films, setFilms] = useState<Film[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [relationToDelete, setRelationToDelete] = useState<{ filmId: string; genreId: string } | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const { search } = router.query;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('token');
        
        const filmsResponse = await axios.get<Film[]>("/api/film", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setFilms(filmsResponse.data);

        const relationsResponse = await axios.get<GenreRelation[]>("/api/genre-relation", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setGenreRelations(relationsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Gagal mengambil data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupedRelations = genreRelations.reduce((acc, relation) => {
    if (!acc[relation.filmId]) {
      acc[relation.filmId] = {
        film: relation.film,
        genres: []
      };
    }
    
    acc[relation.filmId].genres.push(relation.genre);
    return acc;
  }, {} as Record<string, { film: Film; genres: Genre[] }>);

  const filmsWithGenres = Object.values(groupedRelations);

  const filteredFilmsWithGenres = filmsWithGenres.filter(
    (item) => {
      const searchString = Array.isArray(search) ? search.join(' ') : search; 
      return item.film.title.toLowerCase().includes((searchString || "").toLowerCase());
    }
  );
  

  const totalItems = filteredFilmsWithGenres.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFilmsWithGenres = filteredFilmsWithGenres.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleManageGenres = (film: Film) => {
    const existingGenres = genreRelations
      .filter((relation) => relation.filmId === film.id)
      .map((relation) => relation.genre.id);
  
    setSelectedFilm({
      id: film.id,
      title: film.title,
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setSelectedFilm(null);
  };

  const handleSaveGenreRelation = async () => {
    try {
      const token = Cookies.get('token');
      
      const relationsResponse = await axios.get<GenreRelation[]>("/api/genre-relation", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setGenreRelations(relationsResponse.data);
      setShowForm(false);
      setSelectedFilm(null);
    } catch (error) {
      console.error("Gagal menyegarkan data", error);
    }
  };

  const handleDeleteGenreRelation = async () => {
    if (!relationToDelete) return;

    try {
      const token = Cookies.get('token');
      await axios.delete(`/api/genre-relation/${relationToDelete.filmId}?genreId=${relationToDelete.genreId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const relationsResponse = await axios.get<GenreRelation[]>("/api/genre-relation", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setGenreRelations(relationsResponse.data);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Gagal menghapus genre relation", error);
    }
  };

  return (
    <main className="bg-gray-100 dark:bg-gray-800 p-6 overflow-x-auto">
      {showForm && selectedFilm ? (
        <GenreRelationForm 
          onSaveGenreRelation={handleSaveGenreRelation} 
          onCancel={handleCancelEdit} 
          filmId={selectedFilm.id}
          existingGenres={genreRelations
            .filter((relation) => relation.filmId === selectedFilm.id)
            .map((relation) => relation.genre.id)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 dark:text-yellow-300">
              Manage Genre Relation
            </h1>
            {films.length > 0 && (
              <Select 
                onValueChange={(value) => {
                  const film = films.find(f => f.id === value);
                  if (film) {
                    handleManageGenres(film);
                  }
                }}
              >
                <SelectTrigger className="w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Pilih Film" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                  {films.map(film => (
                    <SelectItem key={film.id} value={film.id}>{film.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {loading ? (
            <p>Memuat data...</p>
          ) : (
            <>
              {filteredFilmsWithGenres.length === 0 && (
                <Alert variant="destructive" className="mb-4">
                  Tidak ada genre relation untuk ditampilkan.
                </Alert>
              )}

              <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg">
                <Table className="min-w-max table-auto text-sm overflow-x-auto">
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white dark:bg-gradient-to-r dark:from-yellow-600 dark:via-yellow-700 dark:to-yellow-800">
                      <TableCell className="py-3 px-4 text-left font-semibold">Film</TableCell>
                      <TableCell className="py-3 px-4 text-left font-semibold">Genre</TableCell>
                      <TableCell className="py-3 px-4 text-left font-semibold">Aksi</TableCell>
                    </TableRow>
                  </TableHeader>
                    
                  <TableBody>
                    {currentFilmsWithGenres.map((item) => (
                      <TableRow key={item.film.id} className="dark:text-white text-black">
                        <TableCell className="py-3 px-4">{item.film.title}</TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {item.genres.map(genre => (
                              <span key={genre.id} className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs">
                                {genre.name}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <Button 
                            onClick={() => handleManageGenres(item.film)} 
                            className="bg-yellow-500 text-white mr-2"
                          >
                            <FaEdit />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tampilkan</span>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600 dark:text-gray-400">data per halaman</span>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white"
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </>
          )}

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
                  Apakah Anda yakin?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                  Anda tidak dapat mengembalikan genre relation yang telah dihapus!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600">
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteGenreRelation}
                  className="bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-600"
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </main>
  );
};

export default ManageGenreRelation;