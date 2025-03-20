import { useEffect, useState } from "react";
import { FaEye, FaPlus, FaTrash, FaFilter, FaCheck } from "react-icons/fa";
import axios from "axios";
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FilmDetail from "./Film-Detail";
import FilmForm from "./Film-Form";
import { Film, User, Genre, GenreRelation } from "./types";

const ManageFilm = () => {
  const [films, setFilms] = useState<Film[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genreRelations, setGenreRelations] = useState<GenreRelation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filmToDelete, setFilmToDelete] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGenrePopoverOpen, setIsGenrePopoverOpen] = useState(false);

  const { search } = router.query;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const decoded = jwt.decode(token) as { id: string; role: string };
        if (!decoded) {
          router.push('/login');
          return;
        }

        setCurrentUser({ id: decoded.id, name: "", role: decoded.role });
        setIsAdmin(decoded.role === 'ADMIN');
      } catch (error) {
        console.error("Failed to decode token", error);
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const fetchFilmsAndUsers = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const token = Cookies.get('token');

        const filmResponse = await axios.get("/api/film", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (isAdmin) {
          setFilms(filmResponse.data);
        } else {
          const userFilms = filmResponse.data.filter((film: Film) => film.userId === currentUser.id);
          setFilms(userFilms);
        }

        const userResponse = await axios.get("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(userResponse.data);

        const genreResponse = await axios.get("/api/genre", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGenres(genreResponse.data);

        const genreRelationsResponse = await axios.get("/api/genre-relation", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGenreRelations(genreRelationsResponse.data);

        const categories = [...new Set(filmResponse.data.map((film: Film) => film.category))];
        setAvailableCategories(categories.filter((category): category is string => typeof category === 'string'));

        const years = [...new Set(filmResponse.data.map((film: Film) => film.releaseYear))];
        setAvailableYears(
          years
            .filter((year): year is number => typeof year === 'number')
            .sort((a, b) => b - a)
        );

        setLoading(false);
      } catch (error) {
        console.error("Gagal mengambil data film dan pengguna", error);
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchFilmsAndUsers();
    }
  }, [currentUser, isAdmin]);

  const getFilmGenres = (filmId: string) => {
    const filmGenreRelations = genreRelations.filter(relation => relation.filmId === filmId);
    return filmGenreRelations.map(relation => {
      const genre = genres.find(g => g.id === relation.genreId);
      return genre ? genre.name : "";
    });
  };

  const resetFilters = () => {
    setCategoryFilter("all");
    setSelectedGenres([]);
    setYearFilter("all");
  };

  const handleGenreChange = (genreName: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreName)) {
        return prev.filter(g => g !== genreName);
      } else {
        return [...prev, genreName];
      }
    });
  };

  const filteredFilms = films.filter(film => {
    const matchesSearch = search 
      ? film.title.toLowerCase().includes((search.toString() || "").toLowerCase()) ||
        film.slug.toLowerCase().includes((search.toString() || "").toLowerCase())
      : true;

    const matchesCategory = categoryFilter === "all" 
      ? true 
      : film.category === categoryFilter;

    const matchesYear = yearFilter === "all" 
      ? true 
      : film.releaseYear === parseInt(yearFilter);

    const filmGenres = getFilmGenres(film.id);

    const matchesGenre = selectedGenres.length === 0 
      ? true 
      : selectedGenres.every(genre => filmGenres.includes(genre));

    return matchesSearch && matchesCategory && matchesYear && matchesGenre;
  });

  const totalItems = filteredFilms.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFilms = filteredFilms.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleDeleteFilm = async () => {
    if (!filmToDelete) return;

    try {
      const token = Cookies.get('token');

      if (!isAdmin) {
        const filmToDeleteCheck = films.find(film => film.id === filmToDelete);
        if (filmToDeleteCheck && filmToDeleteCheck.userId !== currentUser?.id) {
          console.error("Tidak memiliki izin untuk menghapus film ini.");
          return;
        }
      }

      await axios.delete(`/api/film/${filmToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFilms((prevFilms) => prevFilms.filter((film) => film.id !== filmToDelete));
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Gagal menghapus film", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Server responded with:", error.response.data);
      }
    }
  };

  const handleViewFilmDetails = (film: Film) => {
    setSelectedFilm(film);
  };

  const handleSaveFilm = (updatedFilm: Film) => {
    setFilms((prevFilms) =>
      prevFilms.map((f) => (f.id === updatedFilm.id ? updatedFilm : f))
    );
    setSelectedFilm(updatedFilm);
  };

  const handleBackFromDetail = () => {
    setSelectedFilm(null);
  };

  const handleAddFilm = (newFilm: Film) => {
    setFilms((prevFilms) => [...prevFilms, newFilm]);
    setShowForm(false);
  };

  const getUserNameById = (userId: string) => {
    if (!users || users.length === 0) return "Anonim";
    const user = users.find((user) => user.id === userId);
    return user ? user.name : "Anonim";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (selectedFilm) {
    return (
      <FilmDetail
        film={selectedFilm}
        onBack={handleBackFromDetail}
        users={users}
        onSave={handleSaveFilm}
      />
    );
  }

  return (
    <main className="bg-gray-100 dark:bg-gray-800 p-6 overflow-x-auto">
      {showForm ? (
        <FilmForm
          onSaveFilm={handleAddFilm}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 dark:text-yellow-300">
                Manage Film
              </h1>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white"
              >
                <FaFilter className="mr-2" /> Filter
              </Button>
              <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white">
                <FaPlus className="mr-2" /> Tambah Film
              </Button>
            </div>
          </div>

          {isFilterOpen && (
            <div className="mb-6 p-4 rounded-lg shadow-lg bg-white dark:bg-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-300">Kategori</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                  >
                    <option value="all">Semua Kategori</option>
                    {availableCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-300">Genre</label>
                  <Select 
                    value={selectedGenres.length === 0 ? "all" : "custom"}
                    onValueChange={(value) => {
                      if (value === "all") {
                        setSelectedGenres([]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder={
                        selectedGenres.length === 0 
                          ? "Semua Genre" 
                          : selectedGenres.length === 1 
                            ? selectedGenres[0] 
                            : `${selectedGenres.length} genre dipilih`
                      } />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                      <div className="p-2">
                        <div className="flex items-center mb-2">
                          <Checkbox 
                            id="select-all-genres" 
                            checked={selectedGenres.length === genres.length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedGenres(genres.map(g => g.name));
                              } else {
                                setSelectedGenres([]);
                              }
                            }}
                          />
                          <label htmlFor="select-all-genres" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Pilih Semua
                          </label>
                        </div>
                        <hr className="my-2 border-gray-200 dark:border-gray-600" />
                        {genres.map((genre) => (
                          <div key={genre.id} className="flex items-center py-1">
                            <Checkbox 
                              id={`genre-${genre.id}`} 
                              checked={selectedGenres.includes(genre.name)}
                              onCheckedChange={() => handleGenreChange(genre.name)}
                            />
                            <label htmlFor={`genre-${genre.id}`} className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                              {genre.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-300">Tahun Rilis</label>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                  >
                    <option value="all">Semua Tahun</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <Button
                  onClick={resetFilters}
                  className="bg-gray-500 text-white hover:bg-gray-600"
                >
                  Reset Filters
                </Button>
                <Button
                  onClick={() => {
                    setCurrentPage(1);
                    setIsFilterOpen(false);
                  }}
                  className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white"
                >
                  Terapkan
                </Button>
              </div>
            </div>
          )}

          {(categoryFilter !== "all" || selectedGenres.length > 0 || yearFilter !== "all") && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Filter aktif:</span>
                {categoryFilter !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                    Kategori: {categoryFilter}
                  </span>
                )}
                {selectedGenres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedGenres.map(genre => (
                      <span key={genre} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                        Genre: {genre}
                        <button 
                          className="ml-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-300 dark:hover:text-yellow-100"
                          onClick={() => handleGenreChange(genre)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {yearFilter !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                    Tahun: {yearFilter}
                  </span>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="ml-auto text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-800/50"
                >
                  Hapus semua filter
                </Button>
              </div>
            </div>
          )}

          {filteredFilms.length === 0 && (
            <Alert variant="destructive" className="mb-4">
              Tidak ada film untuk ditampilkan.
            </Alert>
          )}

          <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg">
            <Table className="min-w-max table-auto text-sm overflow-x-auto">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white dark:bg-gradient-to-r dark:from-yellow-600 dark:via-yellow-700 dark:to-yellow-800">
                  <TableCell className="py-3 px-4 text-left font-semibold">Poster</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Judul</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Slug</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Kategori</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Genre</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Durasi</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Dirilis pada</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Penginput</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentFilms.map((film) => (
                  <TableRow key={film.id} className="dark:text-white text-black">
                    <TableCell className="py-3 px-4">
                      <img src={film.posterUrl} alt={film.title} className="h-12" />
                    </TableCell>
                    <TableCell className="py-3 px-4">{film.title}</TableCell>
                    <TableCell className="py-3 px-4">{film.slug}</TableCell>
                    <TableCell className="py-3 px-4">{film.category}</TableCell>
                    <TableCell className="py-3 px-4">
                      {getFilmGenres(film.id).join(", ")}
                    </TableCell>
                    <TableCell className="py-3 px-4">{film.duration} menit</TableCell>
                    <TableCell className="py-3 px-4">{film.releaseYear}</TableCell>
                    <TableCell className="py-3 px-4">{getUserNameById(film.userId)}</TableCell>
                    <TableCell className="py-3 px-4">
                      <Button onClick={() => handleViewFilmDetails(film)} className="bg-blue-500 text-white mr-2">
                        <FaEye />
                      </Button>
                      <Button
                        onClick={() => {
                          setFilmToDelete(film.id);
                          setShowDeleteDialog(true);
                        }}
                        className="bg-red-500 text-white"
                      >
                        <FaTrash />
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
                disabled={currentPage === totalPages}
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
              Anda tidak dapat mengembalikan film yang telah dihapus!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFilm}
              className="bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-600"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default ManageFilm;