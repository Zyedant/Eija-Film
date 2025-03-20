import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import Cookies from "js-cookie";
import { Film, Genre, Casting } from "../types";
import jwt from "jsonwebtoken";

interface FilmFormProps {
  onSaveFilm: (film: Film) => void;
  onCancel: () => void;
}

const FilmForm = ({ onSaveFilm, onCancel }: FilmFormProps) => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [releaseYear, setReleaseYear] = useState(0);
  const [episode, setEpisode] = useState(0);
  const [category, setCategory] = useState("MOVIE");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [availableCastings, setAvailableCastings] = useState<Casting[]>([]);
  const [selectedCastings, setSelectedCastings] = useState<string[]>([]);
  const [castingRoles, setCastingRoles] = useState<{ [key: string]: string }>({});
  const [isCastingDropdownOpen, setIsCastingDropdownOpen] = useState(false);
  const [uploadTypePoster, setUploadTypePoster] = useState<"url" | "file">("url");
  const [uploadTypeTrailer, setUploadTypeTrailer] = useState<"url" | "file">("url");

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get<Genre[]>("/api/genre", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAvailableGenres(response.data);
        setLoadingGenres(false);
      } catch (error) {
        console.error("Gagal mengambil data genre", error);
        setLoadingGenres(false);
      }
    };

    const fetchCastings = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get<Casting[]>("/api/casting", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAvailableCastings(response.data);
      } catch (error) {
        console.error("Gagal mengambil data casting", error);
      }
    };

    fetchGenres();
    fetchCastings();
  }, []);

  const handleGenreToggle = (genreId: string) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter((id) => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const handleCastingSelect = (castingId: string) => {
    if (selectedCastings.includes(castingId)) {
      setSelectedCastings(selectedCastings.filter((id) => id !== castingId));
      const updatedRoles = { ...castingRoles };
      delete updatedRoles[castingId];
      setCastingRoles(updatedRoles);
    } else {
      setSelectedCastings([...selectedCastings, castingId]);
      setCastingRoles({ ...castingRoles, [castingId]: "" });
    }
  };

  const handleRoleChange = (castingId: string, role: string) => {
    setCastingRoles({ ...castingRoles, [castingId]: role });
  };

  const handleFileUpload = async (file: File, type: "poster" | "trailer") => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = Cookies.get("token");
      const response = await axios.post("/api/upload", formData, {
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
      console.error("Gagal mengupload file", error);
    }
  };

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

      const newFilm: Film = {
        id: "",
        title,
        slug,
        description,
        posterUrl,
        trailerUrl,
        duration: parseInt(duration.toString(), 10),
        releaseYear: parseInt(releaseYear.toString(), 10),
        category,
        episode: category === "MOVIE" ? undefined : parseInt(episode.toString(), 10),
        userId,
      };

      const response = await axios.post("/api/film", newFilm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (selectedGenres.length > 0) {
        await axios.put(
          "/api/genre-relation",
          {
            filmId: response.data.id,
            genreId: selectedGenres,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (selectedCastings.length > 0) {
        await axios.post(
          "/api/casting-relation",
          {
            filmId: response.data.id,
            castings: selectedCastings.map((castingId) => ({
              castingId,
              role: castingRoles[castingId],
            })),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

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
              onChange={(e) => setEpisode(parseInt(e.target.value, 10))}
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
            onChange={(e) => setUploadTypePoster(e.target.value as "url" | "file")}
            className="w-full p-3 border border-gray-300 rounded-md mb-2"
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
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file, "poster");
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trailer</label>
          <select
            value={uploadTypeTrailer}
            onChange={(e) => setUploadTypeTrailer(e.target.value as "url" | "file")}
            className="w-full p-3 border border-gray-300 rounded-md mb-2"
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
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file, "trailer");
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Durasi (menit)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tahun Rilis</label>
          <input
            type="number"
            value={releaseYear}
            onChange={(e) => setReleaseYear(parseInt(e.target.value, 10))}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Genre</h3>
          {loadingGenres ? (
            <p>Memuat genre...</p>
          ) : (
            <div className="relative">
              <div
                className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer"
                onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
              >
                <div className="flex justify-between items-center text-white">
                  <span>Pilih Genre ({selectedGenres.length} dipilih)</span>
                  <span>{isGenreDropdownOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              {isGenreDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg max-h-64 overflow-y-auto">
                  {availableGenres.map((genre) => (
                    <div
                      key={genre.id}
                      className={`flex items-center space-x-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                        selectedGenres.includes(genre.id)
                          ? "bg-yellow-50 dark:bg-yellow-900/30"
                          : ""
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
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                      >
                        {genre.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Casting</label>
          <div className="relative">
            <div
              className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer"
              onClick={() => setIsCastingDropdownOpen(!isCastingDropdownOpen)}
            >
              <div className="flex justify-between items-center text-white">
                <span>Pilih Casting ({selectedCastings.length} dipilih)</span>
                <span>{isCastingDropdownOpen ? "▲" : "▼"}</span>
              </div>
            </div>

            {isCastingDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg max-h-64 overflow-y-auto">
                {availableCastings.map((casting) => (
                  <div
                    key={casting.id}
                    className={`flex items-center space-x-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                      selectedCastings.includes(casting.id)
                        ? "bg-yellow-50 dark:bg-yellow-900/30"
                        : ""
                    }`}
                  >
                    <Checkbox
                      id={`casting-${casting.id}`}
                      checked={selectedCastings.includes(casting.id)}
                      onCheckedChange={() => handleCastingSelect(casting.id)}
                      className="w-5 h-5 text-yellow-600 border-2 border-yellow-500 rounded-md focus:ring-yellow-500"
                    />
                    <label
                      htmlFor={`casting-${casting.id}`}
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                    >
                      {casting.stageName}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedCastings.map((castingId) => (
            <div key={castingId} className="mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Peran untuk {availableCastings.find((c) => c.id === castingId)?.stageName}
              </label>
              <input
                type="text"
                value={castingRoles[castingId] || ""}
                onChange={(e) => handleRoleChange(castingId, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Masukkan peran"
                required
              />
            </div>
          ))}
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

export default FilmForm;