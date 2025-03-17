import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
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


const CommentRatingForm = ({ onSave, onCancel, dataToEdit, films, userId, userRole }) => {
  const [content, setContent] = useState(dataToEdit?.content || "");
  const [score, setScore] = useState(dataToEdit?.score || 0);
  const [filmId, setFilmId] = useState(dataToEdit?.filmId || "");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!filmId || !content || !score) {
      setError("Semua field harus diisi.");
      return;
    }

    onSave({ filmId, content, score: parseInt(score) });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-yellow-500">
        {dataToEdit ? "Edit Komentar & Rating" : "Tambah Komentar & Rating"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Film</label>
          <select
            value={filmId}
            onChange={(e) => setFilmId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          >
            <option value="">Pilih Film</option>
            {films.map((film) => (
              <option key={film.id} value={film.id}>
                {film.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Komentar</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rating (1-5)</label>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            min="1"
            max="5"
            required
          />
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="flex justify-between mt-4">
          <Button type="submit" className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white">
            {dataToEdit ? "Perbarui" : "Tambah"}
          </Button>
          <Button type="button" onClick={onCancel} className="bg-gray-500 text-white">
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
};

const ManageCommentRating = () => {
  const [commentsRatings, setCommentsRatings] = useState([]);
  const [films, setFilms] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [dataToEdit, setDataToEdit] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  
  const fetchData = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setError("Anda harus login untuk mengakses halaman ini.");
      setLoading(false);
      return;
    }

    try {
      const decoded = jwt.decode(token);
      setUserId(decoded.id);
      setUserRole(decoded.role);

      const [commentResponse, ratingResponse, filmResponse, userResponse] = await Promise.all([
        axios.get("/api/comment?showAll=true", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/rating?showAll=true", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/film", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/user", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      
      const combinedData = commentResponse.data.map((comment) => {
        const rating = ratingResponse.data.find((rating) => rating.commentId === comment.id);
        return {
          ...comment,
          rating: rating ? rating.score : null,
          ratingId: rating ? rating.id : null,
        };
      });

      setCommentsRatings(combinedData);
      setFilms(filmResponse.data);
      setUsers(userResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  
  const handleSave = async (data) => {
    const token = Cookies.get("token");
    if (!token) {
      setError("Anda harus login untuk menyimpan data.");
      return;
    }
  
    try {
      if (dataToEdit) {
        
        const commentResponse = await axios.put(`/api/comment/${dataToEdit.id}`, {
          content: data.content,
          filmId: data.filmId,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        
        if (dataToEdit.ratingId) {
          await axios.put(`/api/rating/${dataToEdit.ratingId}`, {
            score: data.score,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          
          await axios.post("/api/rating", {
            score: data.score,
            filmId: data.filmId,
            userId: userId,
            commentId: dataToEdit.id,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } else {
        
        const commentResponse = await axios.post("/api/comment", {
          content: data.content,
          filmId: data.filmId,
          userId: userId,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        
        await axios.post("/api/rating", {
          score: data.score,
          filmId: data.filmId,
          userId: userId,
          commentId: commentResponse.data.id,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
  
      
      fetchData();
      setShowForm(false);
      setDataToEdit(null);
    } catch (error) {
      console.error("Error saving data:", error);
      setError(error.response?.data?.error || "Gagal menyimpan data.");
    }
  };

  
  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const token = Cookies.get("token");

      
      if (itemToDelete.ratingId) {
        await axios.delete(`/api/rating/${itemToDelete.ratingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      
      await axios.delete(`/api/comment/${itemToDelete.commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      
      fetchData();
      setShowDeleteDialog(false);
    } catch (error) {
      setError("Gagal menghapus data.");
    }
  };

  
  const handleEdit = (data) => {
    if (userRole === "ADMIN" || data.userId === userId) {
      setDataToEdit({
        id: data.id,
        content: data.content,
        filmId: data.filmId,
        score: data.rating,
        ratingId: data.ratingId,
      });
      setShowForm(true);
    } else {
      setError("Anda hanya dapat mengedit data milik Anda sendiri.");
    }
  };

  
  const getFilmTitleById = (filmId) => {
    const film = films.find((film) => film.id === filmId);
    return film ? film.title : "Film tidak ditemukan";
  };

  
  const getUserNameById = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.name : "User tidak ditemukan";
  };

  
  const canEditOrDelete = (data) => {
    return userRole === "ADMIN" || data.userId === userId;
  };

  
  const totalItems = commentsRatings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCommentsRatings = commentsRatings.slice(startIndex, endIndex);

  console.log("currentCommentsRatings:", currentCommentsRatings);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  if (loading) return <div>Memuat...</div>;
  if (error) return <Alert variant="error">{error}</Alert>;

  return (
    <main className="bg-gray-100 dark:bg-gray-800 p-6">
      {showForm ? (
        <CommentRatingForm
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          dataToEdit={dataToEdit}
          films={films}
          userId={userId}
          userRole={userRole}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 dark:text-yellow-300">
              Manage Komentar & Rating
            </h1>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white">
              <FaPlus className="mr-2" /> Tambah Komentar & Rating
            </Button>
          </div>

          <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg">
            <Table className="min-w-max table-auto text-sm">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white dark:bg-gradient-to-r dark:from-yellow-600 dark:via-yellow-700 dark:to-yellow-800">
                  <TableCell className="py-3 px-4 text-left font-semibold">User</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Film</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Komentar</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Rating</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentCommentsRatings.map((item) => (
                  <TableRow key={item.id} className="dark:text-white text-black">
                    <TableCell className="py-3 px-4">{getUserNameById(item.userId)}</TableCell>
                    <TableCell className="py-3 px-4">{getFilmTitleById(item.filmId)}</TableCell>
                    <TableCell className="py-3 px-4">{item.content}</TableCell>
                    <TableCell className="py-3 px-4">{item.rating || "Tidak ada rating"}</TableCell>
                    <TableCell className="py-3 px-4">
                      {canEditOrDelete(item) && (
                        <>
                          <Button onClick={() => handleEdit(item)} className="bg-yellow-500 text-white mr-2">
                            <FaEdit />
                          </Button>
                          <Button
                            onClick={() => {
                              setItemToDelete({ commentId: item.id, ratingId: item.ratingId });
                              setShowDeleteDialog(true);
                            }}
                            className="bg-red-500 text-white"
                          >
                            <FaTrash />
                          </Button>
                        </>
                      )}
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
              Anda tidak dapat mengembalikan komentar dan rating yang telah dihapus!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

export default ManageCommentRating;