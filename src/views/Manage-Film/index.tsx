import { useEffect, useState } from "react";
import { FaEye, FaTrash, FaPlus, FaArrowLeft, FaEdit, FaSave } from "react-icons/fa";
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

// Komponen FilmDetail dengan Mode Edit Langsung
const FilmDetail = ({ film, onBack, users, onSave }) => {
  const [isEditing, setIsEditing] = useState(false); // State untuk mode edit
  const [editedFilm, setEditedFilm] = useState(film); // State untuk data yang diedit
  const [uploadTypePoster, setUploadTypePoster] = useState('url'); // State untuk metode upload poster
  const [uploadTypeTrailer, setUploadTypeTrailer] = useState('url'); // State untuk metode upload trailer

  const handleEdit = () => {
    setIsEditing(true); // Masuk ke mode edit
  };

  const handleSave = async () => {
    try {
      const token = Cookies.get('token');
      await axios.put(`/api/film/${film.id}`, editedFilm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsEditing(false); // Keluar dari mode edit
      onSave(editedFilm); // Perbarui data di parent component
    } catch (error) {
      console.error("Gagal menyimpan perubahan", error);
    }
  };

  const handleChange = (e, field) => {
    setEditedFilm({
      ...editedFilm,
      [field]: e.target.value,
    });
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const token = Cookies.get('token');
        const response = await axios.post('/api/upload', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        const fileUrl = response.data.imageUrl;
        if (type === "poster") {
          setEditedFilm({ ...editedFilm, posterUrl: fileUrl });
        } else if (type === "trailer") {
          setEditedFilm({ ...editedFilm, trailerUrl: fileUrl });
        }
      } catch (error) {
        console.error("Error uploading file", error);
      }
    }
  };

  const getUserNameById = (userId) => {
    if (!users || users.length === 0) return "Anonim";
    const user = users.find((user) => user.id === userId);
    return user ? user.name : "Anonim";
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-yellow-500">Detail Film</h2>
        <div className="flex space-x-4">
          <Button 
            onClick={onBack} 
            className="flex items-center bg-gray-500 text-white hover:bg-gray-600"
          >
            <FaArrowLeft className="mr-2" /> Kembali
          </Button>
          {isEditing ? (
            <Button 
              onClick={handleSave} 
              className="flex items-center bg-yellow-500 text-white hover:bg-yellow-600"
            >
              <FaSave className="mr-2" /> Simpan
            </Button>
          ) : (
            <Button 
              onClick={handleEdit} 
              className="flex items-center bg-yellow-500 text-white hover:bg-yellow-600"
            >
              <FaEdit className="mr-2" /> Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Poster dan Trailer */}
        <div className="md:col-span-1">
          <div className="flex flex-col space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Poster</h3>
              <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                {editedFilm.posterUrl ? (
                  <img 
                    src={editedFilm.posterUrl} 
                    alt={editedFilm.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Tidak ada poster
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="mt-2">
                  <select
                    value={uploadTypePoster}
                    onChange={(e) => setUploadTypePoster(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="url">URL</option>
                    <option value="file">Upload File</option>
                  </select>
                  {uploadTypePoster === "url" ? (
                    <input
                      type="text"
                      value={editedFilm.posterUrl}
                      onChange={(e) => handleChange(e, "posterUrl")}
                      className="w-full p-2 border border-gray-300 rounded-md mt-2"
                      placeholder="Masukkan URL Poster"
                    />
                  ) : (
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, "poster")}
                      className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    />
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Trailer</h3>
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                {editedFilm.trailerUrl && editedFilm.trailerUrl.includes('youtube') ? (
                  <iframe 
                    src={editedFilm.trailerUrl.replace('watch?v=', 'embed/')} 
                    className="w-full h-full" 
                    allowFullScreen
                  ></iframe>
                ) : editedFilm.trailerUrl ? (
                  <video 
                    src={editedFilm.trailerUrl} 
                    controls 
                    className="w-full h-full"
                  >
                    Browser Anda tidak mendukung pemutaran video
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Tidak ada trailer
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="mt-2">
                  <select
                    value={uploadTypeTrailer}
                    onChange={(e) => setUploadTypeTrailer(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="url">URL</option>
                    <option value="file">Upload File</option>
                  </select>
                  {uploadTypeTrailer === "url" ? (
                    <input
                      type="text"
                      value={editedFilm.trailerUrl}
                      onChange={(e) => handleChange(e, "trailerUrl")}
                      className="w-full p-2 border border-gray-300 rounded-md mt-2"
                      placeholder="Masukkan URL Trailer"
                    />
                  ) : (
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, "trailer")}
                      className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informasi Film */}
        <div className="md:col-span-2">
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg h-full">
            <h1 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editedFilm.title}
                  onChange={(e) => handleChange(e, "title")}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              ) : (
                editedFilm.title
              )}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedFilm.slug}
                      onChange={(e) => handleChange(e, "slug")}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200">{editedFilm.slug}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</h3>
                  {isEditing ? (
                    <select
                      value={editedFilm.category}
                      onChange={(e) => handleChange(e, "category")}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="MOVIE">Movie</option>
                      <option value="SERIES">Series</option>
                      <option value="ANIME">Anime</option>
                    </select>
                  ) : (
                    <div className="inline-block bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium">
                      {editedFilm.category}
                    </div>
                  )}
                </div>
                
                {(editedFilm.category === "SERIES" || editedFilm.category === "ANIME") && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Episode</h3>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedFilm.episode || 0}
                        onChange={(e) => handleChange(e, "episode")}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200">{editedFilm.episode || 0}</p>
                    )}
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durasi</h3>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedFilm.duration}
                      onChange={(e) => handleChange(e, "duration")}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200">{editedFilm.duration} menit</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tahun Rilis</h3>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedFilm.releaseYear}
                      onChange={(e) => handleChange(e, "releaseYear")}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200">{editedFilm.releaseYear}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Diinput oleh</h3>
                  <p className="text-gray-800 dark:text-gray-200">{getUserNameById(editedFilm.userId)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">ID Film</h3>
                  <p className="text-gray-800 dark:text-gray-200 break-all">{editedFilm.id}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Deskripsi</h3>
              {isEditing ? (
                <textarea
                  value={editedFilm.description}
                  onChange={(e) => handleChange(e, "description")}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              ) : (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 min-h-32">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{editedFilm.description || "Tidak ada deskripsi"}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">URLs</h3>
              <div className="space-y-2">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Poster URL</h4>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedFilm.posterUrl}
                      onChange={(e) => handleChange(e, "posterUrl")}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200 text-sm break-all">{editedFilm.posterUrl || "N/A"}</p>
                  )}
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Trailer URL</h4>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedFilm.trailerUrl}
                      onChange={(e) => handleChange(e, "trailerUrl")}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200 text-sm break-all">{editedFilm.trailerUrl || "N/A"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen FilmForm untuk Tambah Data
const FilmForm = ({ onSaveFilm, onCancel }) => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [releaseYear, setReleaseYear] = useState(0);
  const [episode, setEpisode] = useState(0);
  const [category, setCategory] = useState("MOVIE");
  const [uploadTypePoster, setUploadTypePoster] = useState('url');
  const [uploadTypeTrailer, setUploadTypeTrailer] = useState('url');

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const token = Cookies.get('token');
        const response = await axios.post('/api/upload', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        const fileUrl = response.data.imageUrl;
        if (type === "poster") {
          setPosterUrl(fileUrl);
        } else if (type === "trailer") {
          setTrailerUrl(fileUrl);
        }
      } catch (error) {
        console.error("Error uploading file", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = Cookies.get('token');
    if (!token) {
      console.error("User tidak ditemukan atau belum login.");
      return;
    }
  
    try {
      const decoded = jwt.decode(token);
      const userId = decoded.id;
  
      const newFilm = {
        title,
        slug,
        description,
        posterUrl,
        trailerUrl,
        duration: parseInt(duration, 10),
        releaseYear: parseInt(releaseYear, 10),
        category,
        episode: category === 'MOVIE' ? null : parseInt(episode, 10),
        userId,
      };
  
      await axios.post("/api/film", newFilm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      onSaveFilm(newFilm);
    } catch (error) {
      console.error("Gagal menyimpan film", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold text-yellow-500">Tambah Film</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Judul</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          >
            <option value="MOVIE">Movie</option>
            <option value="SERIES">Series</option>
            <option value="ANIME">Anime</option>
          </select>
        </div>

        {(category === "SERIES" || category === "ANIME") && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Episode</label>
            <input
              type="number"
              value={episode}
              onChange={(e) => setEpisode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              min="0"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Poster</label>
          <select
            value={uploadTypePoster}
            onChange={(e) => setUploadTypePoster(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-2"
          >
            <option value="url">URL</option>
            <option value="file">Upload File</option>
          </select>
          {uploadTypePoster === "url" ? (
            <input
              type="text"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Masukkan URL Poster"
            />
          ) : (
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "poster")}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trailer</label>
          <select
            value={uploadTypeTrailer}
            onChange={(e) => setUploadTypeTrailer(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-2"
          >
            <option value="url">URL</option>
            <option value="file">Upload File</option>
          </select>
          {uploadTypeTrailer === "url" ? (
            <input
              type="text"
              value={trailerUrl}
              onChange={(e) => setTrailerUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Masukkan URL Trailer"
            />
          ) : (
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "trailer")}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Durasi (menit)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tahun Rilis</label>
          <input
            type="number"
            value={releaseYear}
            onChange={(e) => setReleaseYear(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex justify-between mt-4">
          <Button type="submit" className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white">
            Tambah Film
          </Button>
          <Button type="button" onClick={onCancel} className="bg-gray-500 text-white">
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
};

// Komponen ManageFilm
const ManageFilm = () => {
  const [films, setFilms] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filmToDelete, setFilmToDelete] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10); // State untuk jumlah data per halaman
  const [currentPage, setCurrentPage] = useState(1); // State untuk halaman saat ini
  const router = useRouter();

  const { search } = router.query;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const decoded = jwt.decode(token);
        if (!decoded) {
          router.push('/login');
          return;
        }

        setCurrentUser(decoded);
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
          const userFilms = filmResponse.data.filter(film => film.userId === currentUser.id);
          setFilms(userFilms);
        }

        const userResponse = await axios.get("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(userResponse.data);
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

  const filteredFilms = films.filter(
    (film) =>
      film.title.toLowerCase().includes((search || "").toLowerCase()) ||
      film.slug.toLowerCase().includes((search || "").toLowerCase())
  );

  // Pagination Logic
  const totalItems = filteredFilms.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFilms = filteredFilms.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset ke halaman pertama saat mengubah jumlah data per halaman
  };

  const handleDeleteFilm = async () => {
    if (!filmToDelete) return;

    try {
      const token = Cookies.get('token');
      
      if (!isAdmin) {
        const filmToDeleteCheck = films.find(film => film.id === filmToDelete);
        if (filmToDeleteCheck && filmToDeleteCheck.userId !== currentUser.id) {
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
      setShowDeleteDialog(false); // Tutup pop-up setelah berhasil menghapus
    } catch (error) {
      console.error("Gagal menghapus film", error);
    }
  };

  const handleViewFilmDetails = (film) => {
    setSelectedFilm(film);
  };

  const handleSaveFilm = (updatedFilm) => {
    setFilms((prevFilms) =>
      prevFilms.map((f) => (f.id === updatedFilm.id ? updatedFilm : f))
    );
    setSelectedFilm(updatedFilm); // Perbarui data yang ditampilkan di detail
  };

  const handleBackFromDetail = () => {
    setSelectedFilm(null);
  };

  const handleAddFilm = (newFilm) => {
    setFilms((prevFilms) => [...prevFilms, newFilm]);
    setShowForm(false); // Tutup form setelah berhasil menambahkan film
  };

  const getUserNameById = (userId) => {
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
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white">
              <FaPlus className="mr-2" /> Tambah Film
            </Button>
          </div>

          {filteredFilms.length === 0 && (
            <Alert variant="warning" className="mb-4">
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

          {/* Pagination dan Select Jumlah Data per Halaman */}
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

      {/* Pop-up Konfirmasi Hapus */}
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