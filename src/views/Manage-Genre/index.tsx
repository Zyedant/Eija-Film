import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaArrowLeft } from "react-icons/fa";
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

interface Genre {
  id: string;
  name: string;
  userId: string;
}

interface GenreFormProps {
  onSaveGenre: (genre: Genre) => void;
  onCancel: () => void;
  genreToEdit?: Genre;
}

const GenreForm: React.FC<GenreFormProps> = ({ onSaveGenre, onCancel, genreToEdit }) => {
  const [name, setName] = useState(genreToEdit ? genreToEdit.name : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get('token');
    
    if (!token) {
      console.error("User tidak ditemukan atau belum login.");
      return;
    }
  
    try {
      const decoded = jwt.decode(token) as { id: string } | null;
      if (!decoded) {
        console.error("Token tidak valid.");
        return;
      }

      const userId = decoded.id;
  
      const updatedGenre: Genre = {
        id: genreToEdit ? genreToEdit.id : "",
        userId,
        name,
      };
  
      try {
        if (genreToEdit) {
          await axios.put(`/api/genre/${genreToEdit.id}`, updatedGenre, {
            headers: {
              Authorization: `Bearer ${token}` 
            }
          });
        } else {
          await axios.post("/api/genre", updatedGenre, {
            headers: {
              Authorization: `Bearer ${token}` 
            }
          });
        }
        onSaveGenre(updatedGenre);
      } catch (error) {
        console.error("Gagal menyimpan genre", error);
      }
    } catch (error) {
      console.error("Error decoding token", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold text-yellow-500">{genreToEdit ? "Edit Genre" : "Tambah Genre"}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Genre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="flex justify-between mt-4">
          <Button type="submit" className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white">
            {genreToEdit ? "Perbarui Genre" : "Tambah Genre"}
          </Button>
          <Button type="button" onClick={onCancel} className="bg-gray-500 text-white">
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
};

const ManageGenre: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [genreToEdit, setGenreToEdit] = useState<Genre | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); 
  const [genreToDelete, setGenreToDelete] = useState<string | null>(null); 
  const [itemsPerPage, setItemsPerPage] = useState(10); 
  const [currentPage, setCurrentPage] = useState(1); 
  const router = useRouter();

  const { search } = router.query;

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await axios.get("/api/genre", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setGenres(response.data);
      } catch (error) {
        console.error("Gagal mengambil data genre", error);
      }
    };

    fetchGenres();
  }, [router]);

  const searchQuery = Array.isArray(search) ? search[0] : search || "";
  const filteredGenres = genres.filter(
    (genre) => genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredGenres.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGenres = filteredGenres.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); 
  };

  const handleDeleteGenre = async () => {
    if (!genreToDelete) return;

    try {
      const token = Cookies.get('token');
      await axios.delete(`/api/genre/${genreToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setGenres((prevGenres) => prevGenres.filter((genre) => genre.id !== genreToDelete));
      setShowDeleteDialog(false); 
    } catch (error) {
      console.error("Gagal menghapus genre", error);
    }
  };

  const handleEditGenre = (genre: Genre) => {
    setGenreToEdit(genre);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setGenreToEdit(null);
  };

  const handleSaveGenre = (genreToSave: Genre) => {
    if (genreToEdit) {
      setGenres((prevGenres) =>
        prevGenres.map((g) => (g.id === genreToSave.id ? genreToSave : g))
      );
    } else {
      setGenres((prevGenres) => [...prevGenres, genreToSave]);
    }
    setShowForm(false);
    setGenreToEdit(null);
  };

  return (
    <main className="bg-gray-100 dark:bg-gray-800 p-6 overflow-x-auto">
      {showForm ? (
        <GenreForm 
          onSaveGenre={handleSaveGenre} 
          onCancel={handleCancelEdit} 
          genreToEdit={genreToEdit || undefined} 
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 dark:text-yellow-300">
              Manage Genre
            </h1>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white">
              <FaPlus className="mr-2" /> Tambah Genre
            </Button>
          </div>

          {filteredGenres.length === 0 && (
            <Alert variant="destructive" className="mb-4">
              Tidak ada genre untuk ditampilkan.
            </Alert>
          )}

          <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg">
            <Table className="min-w-max table-auto text-sm overflow-x-auto">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white dark:bg-gradient-to-r dark:from-yellow-600 dark:via-yellow-700 dark:to-yellow-800">
                  <TableCell className="py-3 px-4 text-left font-semibold">Nama Genre</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Aksi</TableCell>
                </TableRow>
              </TableHeader>
                
              <TableBody>
                {currentGenres.map((genre) => (
                  <TableRow key={genre.id} className="dark:text-white text-black">
                    <TableCell className="py-3 px-4">{genre.name}</TableCell>
                    <TableCell className="py-3 px-4">
                      <Button onClick={() => handleEditGenre(genre)} className="bg-yellow-500 text-white mr-2">
                        <FaEdit />
                      </Button>
                      <Button
                        onClick={() => {
                          setGenreToDelete(genre.id);
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
              Anda tidak dapat mengembalikan genre yang telah dihapus!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGenre}
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

export default ManageGenre;