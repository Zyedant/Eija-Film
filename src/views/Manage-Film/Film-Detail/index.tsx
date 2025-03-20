import { useState, useEffect } from "react";
import { FaArrowLeft, FaEdit, FaSave, FaTrash, FaPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";
import Cookies from "js-cookie";
import { Film, User, Genre, GenreRelation, Casting, CastingRelation } from "../types";

interface FilmDetailProps {
  film: Film;
  onBack: () => void;
  users: User[];
  onSave: (film: Film) => void;
}

const FilmDetail = ({ film, onBack, users, onSave }: FilmDetailProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFilm, setEditedFilm] = useState(film);
  const [uploadTypePoster, setUploadTypePoster] = useState('url');
  const [uploadTypeTrailer, setUploadTypeTrailer] = useState('url');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [filmGenres, setFilmGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [filmCastings, setFilmCastings] = useState<CastingRelation[]>([]);
  const [availableCastings, setAvailableCastings] = useState<Casting[]>([]);
  const [selectedCastings, setSelectedCastings] = useState<string[]>([]);
  const [castingRoles, setCastingRoles] = useState<{ [key: string]: string }>({});
  const [isCastingDropdownOpen, setIsCastingDropdownOpen] = useState(false);
  const [loadingCastings, setLoadingCastings] = useState(true);
  const [tempCastingList, setTempCastingList] = useState<{castingId: string, role: string, photoUrl?: string, id?: string}[]>([]);
  const [originalCastingIds, setOriginalCastingIds] = useState<string[]>([]);
  const [castingPhotoUpload, setCastingPhotoUpload] = useState<{ [key: string]: string }>({});
  const [selectedCastingForPhoto, setSelectedCastingForPhoto] = useState<string | null>(null);
  const [castingPhotoDialogOpen, setCastingPhotoDialogOpen] = useState(false);

  useEffect(() => {
    const fetchGenresAndRelations = async () => {
      try {
        const token = Cookies.get('token');
  
        const genresResponse = await axios.get<Genre[]>("/api/genre", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAvailableGenres(genresResponse.data);
  
        const relationsResponse = await axios.get<GenreRelation[]>("/api/genre-relation", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const filmRelations = relationsResponse.data.filter(
          relation => relation.filmId === film.id
        );
        
        const genreIds = filmRelations.map(relation => relation.genreId);
        setSelectedGenres(genreIds);
        
        const groupedGenres = filmRelations.reduce((acc, relation) => {
          if (!acc[relation.filmId]) {
            acc[relation.filmId] = [];
          }
          acc[relation.filmId].push(relation.genre);
          return acc;
        }, {} as Record<string, Genre[]>);
        
        const currentFilmGenres = groupedGenres[film.id] || [];
        setFilmGenres(currentFilmGenres);
        
        setLoadingGenres(false);
      } catch (error) {
        console.error("Failed to fetch genre data and relations", error);
        setLoadingGenres(false);
      }
    };
    
    const fetchCastingsAndRelations = async () => {
      try {
        const token = Cookies.get('token');
        
        const castingsResponse = await axios.get<Casting[]>("/api/casting", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAvailableCastings(castingsResponse.data);
        
        const castingRelationsResponse = await axios.get<CastingRelation[]>("/api/casting-relation", {
          params: { filmId: film.id },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const filmCastingRelations = castingRelationsResponse.data.filter(
          relation => relation.filmId === film.id
        );
        setFilmCastings(filmCastingRelations);
        
        const initialTempCastings = filmCastingRelations.map(relation => {
          const casting = castingsResponse.data.find(c => c.id === relation.castingId);
          return {
            castingId: relation.castingId,
            role: relation.role || "",
            photoUrl: casting?.photoUrl || "",
            id: relation.id
          };
        });
        setTempCastingList(initialTempCastings);
        
        const castingIds = filmCastingRelations.map(relation => relation.castingId);
        setSelectedCastings(castingIds);
        setOriginalCastingIds(castingIds);
        
        const roleMap: { [key: string]: string } = {};
        filmCastingRelations.forEach(relation => {
          roleMap[relation.castingId] = relation.role;
        });
        setCastingRoles(roleMap);
        
        setLoadingCastings(false);
      } catch (error) {
        console.error("Failed to fetch casting data and relations", error);
        setLoadingCastings(false);
      }
    };
  
    fetchGenresAndRelations();
    fetchCastingsAndRelations();
  }, [film.id]);

  const handleEdit = () => {
    setIsEditing(true);
    
    const currentCastings = filmCastings.map(relation => {
      const casting = availableCastings.find(c => c.id === relation.castingId);
      return {
        castingId: relation.castingId,
        role: relation.role || "",
        photoUrl: casting?.photoUrl || "",
        id: relation.id
      };
    });
    setTempCastingList(currentCastings);
  };

  const handleSave = async () => {
    try {
      const token = Cookies.get('token');
  
      await axios.put(`/api/film/${film.id}`, editedFilm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      await axios.put(
        "/api/genre-relation",
        {
          filmId: film.id,
          genreId: selectedGenres,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const existingCastingIds = filmCastings.map((relation) => relation.castingId);
  
      const newCastings = tempCastingList.filter(
        (item) => !originalCastingIds.includes(item.castingId)
      );
  
      if (newCastings.length > 0) {
        await axios.post(
          "/api/casting-relation",
          {
            filmId: film.id,
            castings: newCastings,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
  
      const updatedCastings = tempCastingList.filter(
        (item) => originalCastingIds.includes(item.castingId) && item.id
      );
  
      for (const casting of updatedCastings) {
        const originalRole = castingRoles[casting.castingId];
        if (casting.role !== originalRole) {
          await axios.put(
            `/api/casting-relation/${casting.id}`,
            {
              role: casting.role, 
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
  
        if (castingPhotoUpload[casting.castingId]) {
          await axios.put(
            `/api/casting/${casting.castingId}`,
            {
              photoUrl: castingPhotoUpload[casting.castingId],
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      }
  
      const deletedCastingIds = originalCastingIds.filter(
        (id) => !tempCastingList.some((item) => item.castingId === id)
      );
  
      for (const castingId of deletedCastingIds) {
        const relationToDelete = filmCastings.find(
          (relation) => relation.castingId === castingId
        );
        if (relationToDelete) {
          await axios.delete(`/api/casting-relation/${relationToDelete.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }
  
      const relationsResponse = await axios.get<GenreRelation[]>("/api/genre-relation", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const filmRelations = relationsResponse.data.filter(
        (relation) => relation.filmId === film.id
      );
  
      const updatedFilmGenres = filmRelations.map((relation) => relation.genre);
      setFilmGenres(updatedFilmGenres);
  
      const castingRelationsResponse = await axios.get<CastingRelation[]>("/api/casting-relation", {
        params: { filmId: film.id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const filmCastingRelations = castingRelationsResponse.data.filter(
        (relation) => relation.filmId === film.id
      );
      setFilmCastings(filmCastingRelations);
  
      const castingIds = tempCastingList.map((item) => item.castingId);
      setSelectedCastings(castingIds);
      setOriginalCastingIds(castingIds);
  
      const roleMap: { [key: string]: string } = {};
      tempCastingList.forEach((item) => {
        roleMap[item.castingId] = item.role;
      });
      setCastingRoles(roleMap);
  
      setCastingPhotoUpload({});
      setIsEditing(false);
      onSave(editedFilm);
    } catch (error) {
      console.error("Failed to save changes", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: keyof Film) => {
    const value = field === 'releaseYear' || field === 'duration' || field === 'episode' 
      ? parseInt(e.target.value, 10) 
      : e.target.value;
  
    setEditedFilm({
      ...editedFilm,
      [field]: value,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "poster" | "trailer" | "castingPhoto") => {
    const file = e.target.files?.[0];
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
        } else if (type === "castingPhoto" && selectedCastingForPhoto) {
          setCastingPhotoUpload({
            ...castingPhotoUpload,
            [selectedCastingForPhoto]: fileUrl
          });
          
          setTempCastingList(prevList => 
            prevList.map(item => 
              item.castingId === selectedCastingForPhoto 
                ? { ...item, photoUrl: fileUrl } 
                : item
            )
          );
          
          setCastingPhotoDialogOpen(false);
        }
      } catch (error) {
        console.error("Error uploading file", error);
      }
    }
  };

  const handleGenreToggle = (genreId: string) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter((id) => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };
  
  const handleCastingSelect = (castingId: string) => {
    if (tempCastingList.some(item => item.castingId === castingId)) {
      return;
    }
    
    const casting = availableCastings.find(c => c.id === castingId);
    
    setTempCastingList([
      ...tempCastingList, 
      { 
        castingId, 
        role: "", 
        photoUrl: casting?.photoUrl || ""
      }
    ]);
  };

  const handleRoleChange = (castingId: string, role: string) => {
    setTempCastingList(prevList => 
      prevList.map(item => 
        item.castingId === castingId ? { ...item, role } : item
      )
    );
  };

  const handleRemoveCasting = (castingId: string) => {
    setTempCastingList(prevList => 
      prevList.filter(item => item.castingId !== castingId)
    );
  };

  const handleOpenPhotoDialog = (castingId: string) => {
    setSelectedCastingForPhoto(castingId);
    setCastingPhotoDialogOpen(true);
  };

  const getUserNameById = (userId: string) => {
    if (!users || users.length === 0) return "Anonymous";
    const user = users.find((user) => user.id === userId);
    return user ? user.name : "Anonymous";
  };
  
  const getCastingNameById = (castingId: string) => {
    const casting = availableCastings.find(c => c.id === castingId);
    return casting ? casting.stageName : "Unknown";
  };

  const getCastingById = (castingId: string) => {
    return availableCastings.find(c => c.id === castingId);
  };

  const getCastingPhotoUrl = (castingId: string) => {
    if (castingPhotoUpload[castingId]) {
      return castingPhotoUpload[castingId];
    }
    
    const casting = getCastingById(castingId);
    return casting?.photoUrl || "/placeholder-profile.jpg";
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
    } else {
      return `${mins}m`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-lg shadow-2xl text-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">Film Details</h2>
        <div className="flex space-x-4">
          <Button
            onClick={onBack}
            className="flex items-center bg-gray-800 text-white hover:bg-gray-700 transition-all"
          >
            <FaArrowLeft className="mr-2" /> Back
          </Button>
          {isEditing ? (
            <Button
              onClick={handleSave}
              className="flex items-center bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700 transition-all"
            >
              <FaSave className="mr-2" /> Save
            </Button>
          ) : (
            <Button
              onClick={handleEdit}
              className="flex items-center bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700 transition-all"
            >
              <FaEdit className="mr-2" /> Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="flex flex-col space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Poster</h3>
              <div className="aspect-[2/3] bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                {editedFilm.posterUrl ? (
                  <img
                    src={editedFilm.posterUrl}
                    alt={editedFilm.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No poster available
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="mt-4 space-y-2">
                  <select
                    value={uploadTypePoster}
                    onChange={(e) => setUploadTypePoster(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="url">URL</option>
                    <option value="file">Upload File</option>
                  </select>
                  {uploadTypePoster === "url" ? (
                    <input
                      type="text"
                      value={editedFilm.posterUrl}
                      onChange={(e) => handleChange(e, "posterUrl")}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="Enter Poster URL"
                    />
                  ) : (
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, "poster")}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Trailer</h3>
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700">
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
                    Your browser does not support video playback
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No trailer available
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="mt-4 space-y-2">
                  <select
                    value={uploadTypeTrailer}
                    onChange={(e) => setUploadTypeTrailer(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="url">URL</option>
                    <option value="file">Upload File</option>
                  </select>
                  {uploadTypeTrailer === "url" ? (
                    <input
                      type="text"
                      value={editedFilm.trailerUrl}
                      onChange={(e) => handleChange(e, "trailerUrl")}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="Enter Trailer URL"
                    />
                  ) : (
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, "trailer")}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 p-8 rounded-xl h-full backdrop-blur-sm border border-gray-700">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-amber-500 mb-6">
              {isEditing ? (
                <input
                  type="text"
                  value={editedFilm.title}
                  onChange={(e) => handleChange(e, "title")}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              ) : (
                editedFilm.title
              )}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Slug</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedFilm.slug}
                      onChange={(e) => handleChange(e, "slug")}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  ) : (
                    <p className="text-white">{editedFilm.slug}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Category</h3>
                  {isEditing ? (
                    <select
                      value={editedFilm.category}
                      onChange={(e) => handleChange(e, "category")}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="MOVIE">Movie</option>
                      <option value="SERIES">Series</option>
                      <option value="ANIME">Anime</option>
                    </select>
                  ) : (
                    <Badge className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white border-none">
                      {editedFilm.category}
                    </Badge>
                  )}
                </div>

                {(editedFilm.category === "SERIES" || editedFilm.category === "ANIME") && (
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Episodes</h3>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedFilm.episode || 0}
                        onChange={(e) => handleChange(e, "episode")}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      />
                    ) : (
                      <p className="text-white">{editedFilm.episode || 0}</p>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Duration</h3>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedFilm.duration}
                      onChange={(e) => handleChange(e, "duration")}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  ) : (
                    <p className="text-white">{formatDuration(editedFilm.duration)}</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Release Year</h3>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedFilm.releaseYear}
                      onChange={(e) => handleChange(e, "releaseYear")}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  ) : (
                    <p className="text-white">{editedFilm.releaseYear}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Added by</h3>
                  <p className="text-white">{getUserNameById(editedFilm.userId)}</p>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Film ID</h3>
                  <p className="text-gray-300 text-sm break-all font-mono">{editedFilm.id}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Description</h3>
              {isEditing ? (
                <textarea
                  value={editedFilm.description}
                  onChange={(e) => handleChange(e, "description")}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  rows={4}
                />
              ) : (
                <div className="p-4 rounded-lg border border-gray-700 bg-gray-900/50 min-h-32">
                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{editedFilm.description || "No description available"}</p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Genre</h3>
              {loadingGenres ? (
                <div className="animate-pulse p-4 bg-gray-700 rounded-lg"></div>
              ) : isEditing ? (
                <div className="relative">
                  <div 
                    className="p-4 rounded-lg border border-gray-600 bg-gray-700 cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                  >
                    <div className="flex justify-between items-center">
                      <span>Select Genres ({selectedGenres.length} selected)</span>
                      <span>{isGenreDropdownOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isGenreDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg border border-gray-600 shadow-xl max-h-64 overflow-y-auto">
                    {availableGenres.map((genre) => (
                      <div 
                        key={genre.id} 
                        className="flex items-center p-3 hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleGenreToggle(genre.id)}
                      >
                        <Checkbox 
                          checked={selectedGenres.includes(genre.id)} 
                          className="mr-2 border-gray-500" 
                        />
                        <span>{genre.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filmGenres.length > 0 ? (
                  filmGenres.map((genre) => (
                    <Badge 
                      key={genre.id} 
                      className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white cursor-default border-none"
                    >
                      {genre.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-400">No genres assigned</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">Cast</h3>
            {loadingCastings ? (
              <div className="animate-pulse p-4 bg-gray-700 rounded-lg"></div>
            ) : isEditing ? (
              <div className="space-y-4">
                <div className="relative">
                  <div 
                    className="p-4 rounded-lg border border-gray-600 bg-gray-700 cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => setIsCastingDropdownOpen(!isCastingDropdownOpen)}
                  >
                    <div className="flex justify-between items-center">
                      <span>Add Cast Members</span>
                      <span>{isCastingDropdownOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isCastingDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg border border-gray-600 shadow-xl max-h-64 overflow-y-auto">
                      {availableCastings
                        .filter(casting => !tempCastingList.some(item => item.castingId === casting.id))
                        .map((casting) => (
                          <div 
                            key={casting.id} 
                            className="flex items-center p-3 hover:bg-gray-700 cursor-pointer"
                            onClick={() => {
                              handleCastingSelect(casting.id);
                              setIsCastingDropdownOpen(false);
                            }}
                          >
                            <span>{casting.stageName}</span>
                            {casting.realName && (
                              <span className="ml-2 text-sm text-gray-400">({casting.realName})</span>
                            )}
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {tempCastingList.map((castingItem) => {
                    const casting = getCastingById(castingItem.castingId);
                    return (
                      <div key={castingItem.castingId} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                        <div className="w-12 h-12 overflow-hidden rounded-full bg-gray-700 flex-shrink-0">
                          <img 
                            src={castingItem.photoUrl || getCastingPhotoUrl(castingItem.castingId) || "/placeholder-profile.jpg"} 
                            alt={casting?.stageName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium">{casting?.stageName}</div>
                          <div className="flex mt-2 items-center gap-2">
                            <input 
                              type="text" 
                              value={castingItem.role} 
                              onChange={(e) => handleRoleChange(castingItem.castingId, e.target.value)}
                              placeholder="Character/Role"
                              className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleRemoveCasting(castingItem.castingId)}
                          variant="destructive"
                          className="h-8 w-8 p-0 rounded-full bg-red-600 hover:bg-red-700"
                        >
                          <FaTrash size={12} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filmCastings.length > 0 ? (
                  filmCastings.map((relation) => {
                    const casting = getCastingById(relation.castingId);
                    return (
                      <div key={relation.id} className="flex items-center gap-4 p-4 bg-gray-800/70 rounded-lg border border-gray-700">
                        <div className="w-12 h-12 overflow-hidden rounded-full bg-gray-700 flex-shrink-0">
                          <img 
                            src={casting?.photoUrl || "/placeholder-profile.jpg"} 
                            alt={casting?.stageName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-yellow-400">{casting?.stageName}</div>
                          {relation.role && (
                            <div className="text-sm text-gray-300">as {relation.role}</div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 col-span-2">No cast members added</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default FilmDetail;