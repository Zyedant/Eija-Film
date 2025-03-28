import { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
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

interface User {
  id: string;
  name: string;
  role: string;
}

interface Film {
  id: string;
  title: string;
  userId: string;
}

interface Casting {
  id: string;
  stageName: string;
}

interface CastingRelation {
  id: string;
  filmId: string;
  castingId: string;
  role: string;
  userId: string;
  film: Film;
  casting: Casting;
}

interface CastingRelationFormProps {
  onSaveRelation: (relation: { filmId: string; castingId: string; role: string }) => void;
  onCancel: () => void;
  relationToEdit?: CastingRelation;
  films: Film[];
  castings: Casting[];
  isNewRelation?: boolean;
}

const CastingRelationForm = ({ onSaveRelation, onCancel, relationToEdit, films, castings }: CastingRelationFormProps) => {
  const [selectedFilm, setSelectedFilm] = useState(relationToEdit ? relationToEdit.filmId : "");
  const [selectedCasting, setSelectedCasting] = useState(relationToEdit ? relationToEdit.castingId : "");
  const [role, setRole] = useState(relationToEdit ? relationToEdit.role : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("token");

    if (!token) {
      console.error("User tidak ditemukan atau belum login.");
      return;
    }

    try {
      const decoded = jwt.decode(token) as { id: string };
      const userId = decoded.id;

      const relationData = {
        filmId: selectedFilm,
        castingId: selectedCasting,
        role: role,
        userId,
      };

      if (relationToEdit) {
        await axios.put(`/api/casting-relation/${relationToEdit.id}`, relationData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await axios.post("/api/casting-relation", relationData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      onSaveRelation(relationData);
    } catch (error) {
      console.error("Gagal menyimpan casting relation", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold text-yellow-500">
          {relationToEdit ? "Edit Casting Relation" : "Tambah Casting Relation"}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Film</label>
          <select
            value={selectedFilm}
            onChange={(e) => setSelectedFilm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          >
            <option value="">-- Pilih Film --</option>
            {films.map((film) => (
              <option key={film.id} value={film.id}>
                {film.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Casting</label>
          <select
            value={selectedCasting}
            onChange={(e) => setSelectedCasting(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          >
            <option value="">-- Pilih Casting --</option>
            {castings.map((casting) => (
              <option key={casting.id} value={casting.id}>
                {casting.stageName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Masukkan peran casting"
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="flex justify-between mt-4">
          <Button type="submit" className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white">
            {relationToEdit ? "Perbarui Relation" : "Tambah Relation"}
          </Button>
          <Button type="button" onClick={onCancel} className="bg-gray-500 text-white">
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
};

const ManageCastingRelation = () => {
  const [relations, setRelations] = useState<CastingRelation[]>([]);
  const [films, setFilms] = useState<Film[]>([]);
  const [castings, setCastings] = useState<Casting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [relationToEdit, setRelationToEdit] = useState<CastingRelation | null>(null);
  const [isNewRelation, setIsNewRelation] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [relationToDelete, setRelationToDelete] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { search } = router.query;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("film");

  useEffect(() => {
    if (search) {
      setSearchTerm(search as string);
    } else {
      setSearchTerm("");
    }
  }, [search]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const decoded = jwt.decode(token) as { id: string; role: string };
        if (!decoded) {
          router.push("/login");
          return;
        }

        setCurrentUser({ id: decoded.id, name: "", role: decoded.role });
        setIsAdmin(decoded.role === "ADMIN");
      } catch (error) {
        console.error("Failed to decode token", error);
        router.push("/login");
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");

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

        const castingResponse = await axios.get("/api/casting", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCastings(castingResponse.data);

        const relationResponse = await axios.get("/api/casting-relation", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (isAdmin) {
          setRelations(relationResponse.data);
        } else {
          const authorFilmIds = filmResponse.data
            .filter((film: Film) => film.userId === currentUser.id)
            .map((film) => film.id);

          const authorRelations = relationResponse.data.filter((relation: CastingRelation) =>
            authorFilmIds.includes(relation.filmId)
          );

          setRelations(authorRelations);
        }

        setLoading(false);
      } catch (error) {
        console.error("Gagal mengambil data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, isAdmin]);

  const filteredRelations = relations.filter(relation => {
    const searchLower = searchTerm.toLowerCase();
    
    if (searchBy === "film") {
      return relation.film.title.toLowerCase().includes(searchLower);
    } else if (searchBy === "casting") {
      return relation.casting.stageName.toLowerCase().includes(searchLower);
    } else if (searchBy === "role") {
      return relation.role.toLowerCase().includes(searchLower);
    }
    
    return true;
  });

  const totalItems = filteredRelations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRelations = filteredRelations.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleDeleteRelation = async () => {
    if (!relationToDelete) return;

    try {
      const token = Cookies.get("token");

      if (!isAdmin) {
        const relationToDeleteCheck = relations.find((relation) => relation.id === relationToDelete);
        if (!relationToDeleteCheck) return;

        const filmIsOwnedByUser = films.some(
          (film) => film.id === relationToDeleteCheck.filmId && film.userId === currentUser?.id
        );

        if (!filmIsOwnedByUser) {
          console.error("Tidak memiliki izin untuk menghapus relation ini.");
          return;
        }
      }

      await axios.delete(`/api/casting-relation/${relationToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRelations((prevRelations) => prevRelations.filter((relation) => relation.id !== relationToDelete));
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Gagal menghapus casting relation", error);
    }
  };

  const handleAddNewRelation = () => {
    setRelationToEdit(null);
    setIsNewRelation(true);
    setShowForm(true);
  };

  const handleEditRelation = (relation: CastingRelation) => {
    if (!isAdmin) {
      const filmIsOwnedByUser = films.some(
        (film) => film.id === relation.filmId && film.userId === currentUser?.id
      );

      if (!filmIsOwnedByUser) {
        console.error("Tidak memiliki izin untuk mengedit relation ini.");
        return;
      }
    }

    setRelationToEdit(relation);
    setIsNewRelation(false);
    setShowForm(true);
  };

  const handleSaveRelation = (newRelation: { filmId: string; castingId: string; role: string }) => {
    if (relationToEdit && !isNewRelation) {
      setRelations((prevRelations) =>
        prevRelations.map((r) =>
          r.id === relationToEdit.id ? { ...r, ...newRelation } : r
        )
      );
    } else {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    setShowForm(false);
    setRelationToEdit(null);
    setIsNewRelation(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <main className="bg-gray-100 dark:bg-gray-800 p-6 overflow-x-auto">
      {showForm ? (
        <CastingRelationForm
          onSaveRelation={handleSaveRelation}
          onCancel={() => {
            setShowForm(false);
            setRelationToEdit(null);
            setIsNewRelation(false);
          }}
          relationToEdit={relationToEdit || undefined}
          films={films}
          castings={castings}
          isNewRelation={isNewRelation}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 dark:text-yellow-300">
                Manage Casting Relations
              </h1>
            </div>
            <Button onClick={handleAddNewRelation} className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white">
              <FaPlus className="mr-2" /> Tambah Casting Relation
            </Button>
          </div>

          {filteredRelations.length === 0 && (
            <Alert variant="destructive" className="mb-4">
              Tidak ada casting relation untuk ditampilkan.
            </Alert>
          )}

          <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg">
            <Table className="min-w-max table-auto text-sm">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white dark:bg-gradient-to-r dark:from-yellow-600 dark:via-yellow-700 dark:to-yellow-800">
                  <TableCell className="py-3 px-4 text-left font-semibold">Film</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Casting</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Role</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentRelations.map((relation) => (
                  <TableRow key={relation.id} className="dark:text-white text-black">
                    <TableCell className="py-3 px-4">{relation.film.title}</TableCell>
                    <TableCell className="py-3 px-4">{relation.casting.stageName}</TableCell>
                    <TableCell className="py-3 px-4">{relation.role}</TableCell>
                    <TableCell className="py-3 px-4">
                      <Button onClick={() => handleEditRelation(relation)} className="bg-yellow-500 text-white mr-2">
                        <FaEdit />
                      </Button>
                      <Button
                        onClick={() => {
                          setRelationToDelete(relation.id);
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
              Anda tidak dapat mengembalikan casting relation yang telah dihapus!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRelation}
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

export default ManageCastingRelation;