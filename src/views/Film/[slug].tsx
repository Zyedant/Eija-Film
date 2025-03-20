import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FaRegClock,
  FaCalendarAlt,
  FaStar,
  FaPlayCircle,
  FaEdit,
  FaTrash,
  FaComments,
  FaChevronDown,
  FaChevronUp,
  FaExpand,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";

interface Genre {
  id: string;
  name: string;
}

interface CastMember {
  id?: string;
  stageName: string;
  realName?: string;
  photoUrl?: string;
  role?: string;
}

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  content: string;
  rating?: {
    id: string;
    score: number;
  }[];
  createdAt: string;
  filmId: string;
}

interface FilmData {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  backgroundUrl?: string;
  releaseYear: number;
  duration: number;
  avgRating: number;
  genres: Genre[];
  cast: CastMember[];
  trailerUrl: string;
  comments: Comment[];
  director?: string;
  userCommented: boolean;
  userRating?: number;
  userCommentId?: string;
  category: string;
  episode?: number;
}

const FilmDetail = () => {
  const [film, setFilm] = useState<FilmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [filteredCommentList, setFilteredCommentList] = useState<Comment[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [expandedComment, setExpandedComment] = useState<string | null>(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "best" | "worst">("newest");

  const { query, isReady, push } = useRouter();
  const filmSlug = query.slug as string | undefined;

  const commentsToShow = 3;

  const separateAdminComments = (comments: Comment[]) => {
    const adminComments = comments.filter((comment) => comment.user.role === "ADMIN");
    const userComments = comments.filter((comment) => comment.user.role !== "ADMIN");
    return { adminComments, userComments };
  };

  const sortUserComments = (comments: Comment[], option: "newest" | "oldest" | "best" | "worst") => {
    switch (option) {
      case "newest":
        return [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "oldest":
        return [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "best":
        return [...comments].sort((a, b) => {
          const ratingA = a.rating?.[0]?.score || 0;
          const ratingB = b.rating?.[0]?.score || 0;
          return ratingB - ratingA; 
        });
      case "worst":
        return [...comments].sort((a, b) => {
          const ratingA = a.rating?.[0]?.score || 0;
          const ratingB = b.rating?.[0]?.score || 0;
          return ratingA - ratingB; 
        });
      default:
        return comments;
    }
  };

  useEffect(() => {
    if (commentList.length > 0) {
      const { adminComments, userComments } = separateAdminComments(commentList);
      const sortedUserComments = sortUserComments(userComments, sortOption);
      setFilteredCommentList([...adminComments, ...sortedUserComments]);
    }
  }, [commentList, sortOption]);

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = Cookies.get("theme");
      setIsDarkMode(savedTheme === "dark");
    };

    handleThemeChange();

    const cookieCheckInterval = setInterval(() => {
      handleThemeChange();
    }, 1000);

    return () => {
      clearInterval(cookieCheckInterval);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = Cookies.get('token');
  
        if (!token) {
          setCurrentUserId(null);
          setCurrentUserRole(null);
          return;
        }
  
        const decodedToken: any = jwt.decode(token);
  
        if (!decodedToken || !decodedToken.id) {
          setCurrentUserId(null);
          setCurrentUserRole(null);
          return;
        }
  
        setCurrentUserId(decodedToken.id);
        setCurrentUserRole(decodedToken.role);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
        setCurrentUserId(null);
        setCurrentUserRole(null);
      }
    };
  
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!isReady || !filmSlug) return;
  
    const fetchFilmData = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const filmRes = await fetch(`/api/films/${encodeURIComponent(filmSlug)}`);
        if (!filmRes.ok) {
          throw new Error("Film tidak ditemukan");
        }
  
        const filmData = await filmRes.json();
  
        let totalRating = 0;
        let ratingCount = 0;
  
        let userCommented = false;
        let userRating: number | undefined = undefined;
        let userCommentId: string | undefined = undefined;
  
        if (filmData.comments && filmData.comments.length > 0) {
          filmData.comments.forEach((comment) => {
            if (comment.user.role === "USER" && comment.rating && comment.rating.length > 0) {
              totalRating += comment.rating[0].score;
              ratingCount++;
            }
  
            if (comment.user.id === currentUserId) {
              userCommented = true;
              userRating = comment.rating?.[0]?.score || undefined;
              userCommentId = comment.id;
            }
          });
        }
  
        const avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;
  
        const transformedFilmData: FilmData = {
          id: filmData.id,
          title: filmData.title,
          description: filmData.description,
          posterUrl: filmData.posterUrl,
          backgroundUrl: filmData.backgroundUrl || filmData.posterUrl,
          releaseYear: filmData.releaseYear,
          duration: filmData.duration,
          avgRating: avgRating,
          genres: filmData.genreRelations.map((gr) => gr.genre),
          cast: filmData.castingRelations.map((cr) => ({
            id: cr.casting.id,
            stageName: cr.casting.stageName,
            realName: cr.casting.realName,
            photoUrl: cr.casting.photoUrl,
            role: cr.role,
          })),
          trailerUrl: filmData.trailerUrl || "",
          comments: filmData.comments || [],
          director: filmData.director,
          userCommented: userCommented,
          userRating: userRating,
          userCommentId: userCommentId,
          category: filmData.category,
          episode: filmData.episode,
        };
  
        setFilm(transformedFilmData);
  
        if (filmData.id) {
          fetchComments(filmData.id);
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data film");
        console.error("Error fetching film data:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchFilmData();
  }, [filmSlug, isReady, currentUserId]);
  
  const fetchComments = async (filmId: string) => {
    try {
      const commentsRes = await fetch(`/api/comment?filmId=${encodeURIComponent(filmId)}`);
      if (!commentsRes.ok) {
        throw new Error("Failed to fetch comments");
      }
  
      const commentsData = await commentsRes.json();
      setCommentList(commentsData);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Gagal memuat komentar");
    }
  };

  const handleAddComment = async () => {
    if (!film || !currentUserId) {
      toast.error("Anda perlu login untuk menambahkan komentar.");
      return;
    }
  
    if (film.userCommented) {
      toast.error("Anda sudah memberikan komentar sebelumnya.");
      return;
    }
  
    if (comment.trim()) {
      try {
        const commentRes = await fetch(`/api/comment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: comment,
            filmId: film.id,
            userId: currentUserId,
          }),
        });
  
        const responseComment = await commentRes.json();
  
        if (!commentRes.ok) {
          throw new Error("Failed to add comment");
        }
  
        if (rating !== null) {
          const ratingRes = await fetch(`/api/rating`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: currentUserId,
              filmId: film.id,
              score: rating,
              commentId: responseComment.id,
            }),
          });
  
          if (!ratingRes.ok) {
            throw new Error("Failed to add rating");
          }
        }
  
        setFilm((prevFilm) => ({
          ...prevFilm!,
          userCommented: true,
          userRating: rating || undefined,
          userCommentId: responseComment.id,
        }));
  
        fetchComments(film.id);
  
        toast.success("Komentar berhasil ditambahkan!");
        setComment("");
        setRating(null);
      } catch (error) {
        console.error("Error adding comment/rating:", error);
        toast.error("Terjadi kesalahan dalam menambahkan komentar");
      }
    } else {
      toast("Harap memberikan komentar sebelum mengirim", {
        icon: "⚠️",
      });
    }
  };

  const handleUpdateComment = async () => {
    if (!film || !editingCommentId) return;

    try {
      const commentRes = await fetch(`/api/comment/${editingCommentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: comment,
        }),
      });

      if (!commentRes.ok) {
        throw new Error("Failed to update comment");
      }

      if (rating !== null) {
        const ratingId = commentList.find((c) => c.id === editingCommentId)?.rating?.[0]?.id;
        if (ratingId) {
          const ratingRes = await fetch(`/api/rating/${ratingId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              score: rating,
            }),
          });

          if (!ratingRes.ok) {
            throw new Error("Failed to update rating");
          }
        }
      }

      fetchComments(film.id);

      toast.success("Komentar berhasil diperbarui!");
      setIsEditing(false);
      setComment("");
      setRating(null);
      setEditingCommentId(null);
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Terjadi kesalahan dalam memperbarui komentar");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!film) return;

    if (confirm("Apakah Anda yakin ingin menghapus komentar ini?")) {
      try {
        const commentToDelete = commentList.find((c) => c.id === commentId);

        if (!commentToDelete) {
          throw new Error("Comment not found");
        }

        if (commentToDelete.rating && commentToDelete.rating.length > 0) {
          for (const rating of commentToDelete.rating) {
            await fetch(`/api/rating/${rating.id}`, {
              method: "DELETE",
            });
          }
        }

        const deleteRes = await fetch(`/api/comment/${commentId}`, {
          method: "DELETE",
        });

        if (!deleteRes.ok) {
          throw new Error("Failed to delete comment");
        }

        setFilm((prevFilm) => ({
          ...prevFilm!,
          userCommented: false,
          userRating: undefined,
          userCommentId: undefined,
        }));

        fetchComments(film.id);

        toast.success("Komentar berhasil dihapus!");
      } catch (error) {
        console.error("Error deleting comment:", error);
        toast.error("Terjadi kesalahan dalam menghapus komentar");
      }
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setComment("");
    setRating(null);
    setEditingCommentId(null);
  };

  const toggleExpandComment = (commentId: string) => {
    if (expandedComment === commentId) {
      setExpandedComment(null);
    } else {
      setExpandedComment(commentId);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="w-5 h-5 text-yellow-500" />
        ))}
        {hasHalfStar && (
          <div className="relative w-5 h-5">
            <FaStar className="w-5 h-5 text-gray-400" />
            <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
              <FaStar className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FaStar key={`empty-${i}`} className="w-5 h-5 text-gray-400" />
        ))}
      </div>
    );
  };

  const TrailerModal = ({ trailerUrl, onClose }: { trailerUrl: string; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="relative w-full max-w-4xl bg-gray-900 rounded-lg overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <iframe
            src={`${trailerUrl}`}
            title="Film Trailer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video"
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? "bg-gradient-to-b from-gray-800 to-gray-900" : "bg-gradient-to-b from-gray-100 to-white"}`}>
        <div className={`animate-spin rounded-full h-16 w-16 border-t-4 ${isDarkMode ? "border-yellow-500" : "border-yellow-600"}`}></div>
      </div>
    );
  }

  if (error || !film) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gradient-to-b from-gray-800 to-gray-900" : "bg-gradient-to-b from-gray-100 to-white"}`}>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-4">{error || "Film tidak ditemukan"}</h2>
          <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Silakan kembali ke halaman utama</p>
          <Button
            variant="default"
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black"
            onClick={() => push("/")}
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gradient-to-b from-gray-800 to-gray-900 text-white" : "bg-gradient-to-b from-gray-100 to-white text-gray-900"}`}>
      <div className="relative">
        <div
          className="absolute top-0 left-0 w-full h-[500px] bg-cover bg-center"
          style={{ backgroundImage: `url(${film.backgroundUrl || film.posterUrl})` }}
        />
        <div className={`absolute top-0 left-0 w-full h-[500px] ${isDarkMode ? "bg-gradient-to-b from-black/70 to-gray-900" : "bg-gradient-to-b from-black/50 to-white"}`} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          <div className="relative">
            <img
              src={film.posterUrl}
              alt={film.title}
              className={`w-full rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 ${isDarkMode ? "border-2 border-yellow-500/30" : "border-2 border-yellow-600/30"}`}
            />
            {film.trailerUrl && film.trailerUrl.trim() !== "" && (
              <div className="mt-4">
                <Button
                  variant="default"
                  className={`w-full flex items-center gap-2 ${isDarkMode ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "bg-yellow-600 hover:bg-yellow-700 text-white"}`}
                  onClick={() => {
                    console.log("Tombol diklik, menampilkan modal");
                    setShowTrailerModal(true);
                  }}
                >
                  <FaPlayCircle className="w-5 h-5" />
                  Tonton Trailer
                </Button>
              </div>
            )}
            
            {showTrailerModal && (
              <TrailerModal
                trailerUrl={film.trailerUrl}
                onClose={() => setShowTrailerModal(false)}
              />
            )}
          </div>

          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>{film.title}</h1>
            {film.director && (
              <p className={`text-xl ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-6`}>Disutradarai oleh {film.director}</p>
            )}

            <div className="mb-4">
              <Badge className={`${isDarkMode ? "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/30" : "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border border-yellow-500/20"}`}>
                {film.category}
              </Badge>
            </div>

            <div className="flex items-center space-x-6 mb-6">
              {film.releaseYear > 0 && (
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="w-5 h-5 text-yellow-500" />
                  <span className={`${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{film.releaseYear}</span>
                </div>
              )}

              {(film.category === "SERIES" || film.category === "ANIME") && film.episode && (
                <div className="flex items-center gap-2">
                  <span className={`${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{film.episode} Episode</span>
                </div>
              )}

              {film.duration > 0 && (
                <div className="flex items-center gap-2">
                  <FaRegClock className="w-5 h-5 text-yellow-500" />
                  <span className={`${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{film.duration} menit</span>
                </div>
              )}
            </div>

            {film.avgRating > 0 && (
              <div className="flex items-center gap-2 mb-6">
                {renderStars(film.avgRating)}
                <span className={`${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{film.avgRating.toFixed(1)}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-8">
              {film.genres && film.genres.length > 0 ? (
                film.genres.map((genre) => (
                  <Badge key={`${genre.id}`} className={`${isDarkMode ? "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/30" : "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border border-yellow-500/20"}`}>
                    {genre.name}
                  </Badge>
                ))
              ) : (
                <span className={`${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Belum ada genre</span>
              )}
            </div>

            <div className="mb-8">
              <h3 className={`text-2xl font-semibold mb-3 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>Ringkasan</h3>
              <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"} leading-relaxed`}>{film.description}</p>
            </div>

            <div className="mb-8">
              <h3 className={`text-2xl font-semibold mb-4 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>Pemeran</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {film.cast && film.cast.length > 0 ? (
                  film.cast.map((casting, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 ${isDarkMode
                        ? "bg-gray-800/80 border border-gray-700 hover:bg-gray-800"
                        : "bg-gray-100/80 border border-gray-200 hover:bg-gray-200"} p-3 rounded-lg shadow-md transition-colors`}
                    >
                      <img
                        src={casting.photoUrl || "/placeholder-casting.jpg"}
                        alt={casting.stageName}
                        className={`w-12 h-12 rounded-full object-cover border-2 ${isDarkMode ? "border-yellow-500/40" : "border-yellow-600/40"}`}
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{casting.stageName}</div>
                        {casting.role && <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{casting.role}</div>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Belum ada pemeran</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className={`text-2xl font-semibold ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>Komentar</h3>
              <Badge className={`${isDarkMode ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" : "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20"}`}>
                {commentList.length}
              </Badge>
            </div>

            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as "newest" | "oldest" | "best" | "worst")}
                className={`appearance-none px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-800/60 border-gray-700 text-gray-200"
                    : "bg-white/90 border-gray-200 text-gray-900"
                } focus:outline-none focus:ring-2 ${
                  isDarkMode ? "focus:ring-yellow-500" : "focus:ring-yellow-600"
                }`}
              >
                <option value="newest">Paling Baru</option>
                <option value="oldest">Paling Lama</option>
                <option value="best">Rating Terbaik</option>
                <option value="worst">Rating Terburuk</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FaSortAmountDown className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? "bg-gray-800/60 border border-gray-700" : "bg-white/90 border border-gray-200"} rounded-xl overflow-hidden`}>
            <div className={`${isDarkMode ? "bg-gray-700/80" : "bg-gray-200/90"} p-4 flex justify-between items-center`}>
              <div className="flex items-center gap-2">
                <FaComments className={`${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`} />
                <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Ulasan Penonton</span>
              </div>
              <Button
                variant="ghost"
                className={`${isDarkMode ? "text-yellow-400 hover:text-yellow-500 hover:bg-gray-700" : "text-yellow-600 hover:text-yellow-700 hover:bg-gray-200"}`}
                onClick={() => setShowAllComments(!showAllComments)}
              >
                {showAllComments ? (
                  <div className="flex items-center gap-1">
                    <FaChevronUp className="w-4 h-4" />
                    <span>Sembunyikan</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <FaChevronDown className="w-4 h-4" />
                    <span>Lihat Semua</span>
                  </div>
                )}
              </Button>
            </div>

            <div className="max-h-[600px] overflow-y-auto p-4">
              {filteredCommentList && filteredCommentList.length > 0 ? (
                (showAllComments ? filteredCommentList : filteredCommentList.slice(0, commentsToShow)).map((commentItem) => (
                  <div
                    key={commentItem.id}
                    className={`mb-4 last:mb-0 ${isDarkMode
                      ? `bg-gray-800/80 ${commentItem.user.id === currentUserId ? "border-yellow-500/40" : "border-gray-700"} hover:bg-gray-800`
                      : `bg-gray-100/80 ${commentItem.user.id === currentUserId ? "border-yellow-600/40" : "border-gray-300"} hover:bg-gray-200`}
                    p-4 rounded-lg shadow-md border transition-all ${expandedComment === commentItem.id ? (isDarkMode ? "border-yellow-400" : "border-yellow-600") : ""}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${
                        commentItem.user.id === currentUserId
                          ? (isDarkMode ? "text-yellow-400" : "text-yellow-600")
                          : (isDarkMode ? "text-white" : "text-gray-900")
                      }`}>
                        {commentItem.user.name}
                        {commentItem.user.id === currentUserId && " (Anda)"}
                        {commentItem.user.role === "ADMIN" && " (ADMIN)"}
                      </span>
                      {commentItem.user.role === "USER" && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`w-4 h-4 ${i < Math.round(commentItem.rating?.[0]?.score || 0)
                                ? "text-yellow-500"
                                : isDarkMode ? "text-gray-600" : "text-gray-400"}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 relative">
                      <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"} leading-relaxed ${
                        expandedComment === commentItem.id ? "" : "line-clamp-2"
                      }`}>
                        {commentItem.content}
                      </p>

                      {commentItem.content.length > 100 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpandComment(commentItem.id)}
                          className={`mt-1 ${isDarkMode ? "text-yellow-500 hover:text-yellow-400" : "text-yellow-600 hover:text-yellow-700"} hover:bg-transparent p-0 h-auto flex items-center gap-1`}
                        >
                          <FaExpand className="w-3 h-3" />
                          <span>{expandedComment === commentItem.id ? "Tutup" : "Baca selengkapnya"}</span>
                        </Button>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {new Date(commentItem.createdAt).toLocaleDateString()}
                      </span>

                      {commentItem.user.id === currentUserId && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setComment(commentItem.content);
                              setRating(commentItem.rating?.[0]?.score || null);
                              setEditingCommentId(commentItem.id);
                              setIsEditing(true);
                              document.getElementById("comment-form")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            variant="outline"
                            size="sm"
                            className={`flex items-center gap-1 ${isDarkMode ? "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10" : "border-yellow-600/30 text-yellow-600 hover:bg-yellow-600/10"} py-1 h-7`}
                          >
                            <FaEdit className="w-3 h-3" /> Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteComment(commentItem.id)}
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-1 py-1 h-7"
                          >
                            <FaTrash className="w-3 h-3" /> Hapus
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Belum ada komentar untuk film ini</p>
                  {!film.userCommented && (
                    <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"} mt-2`}>Jadilah yang pertama memberikan komentar!</p>
                  )}
                </div>
              )}
            </div>

            {!showAllComments && filteredCommentList.length > commentsToShow && (
              <div className={`p-4 ${isDarkMode ? "bg-gray-800/90 border-t border-gray-700" : "bg-gray-100/90 border-t border-gray-300"} flex justify-center`}>
                <Button
                  variant="outline"
                  onClick={() => setShowAllComments(true)}
                  className={`w-full flex items-center justify-center gap-2 ${isDarkMode ? "border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10" : "border-yellow-600/20 text-yellow-600 hover:bg-yellow-600/10"}`}
                >
                  <FaChevronDown />
                  Lihat {filteredCommentList.length - commentsToShow} komentar lainnya
                </Button>
              </div>
            )}
          </div>

          {currentUserId ? (
            (!film.userCommented || isEditing) && (
              <div id="comment-form" className={`mt-6 ${isDarkMode ? "bg-gray-800/80 p-6 rounded-lg shadow-lg border border-gray-700" : "bg-white/90 p-6 rounded-lg shadow-lg border border-gray-200"}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                  {isEditing ? "Edit Komentar dan Rating" : "Tambahkan Komentar dan Rating"}
                </h3>

                <div className="mb-4 flex items-center gap-4">
                  <span className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        onClick={() => handleRatingChange(star)}
                        className={`w-6 h-6 cursor-pointer transition-colors ${
                          star <= (rating || 0) ? "text-yellow-500" : isDarkMode ? "text-gray-600" : "text-gray-400"
                        } hover:text-yellow-400`}
                      />
                    ))}
                  </div>
                  {rating && <span className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>({rating}/5)</span>}
                </div>

                <textarea
                  className={`w-full p-4 border ${isDarkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" : "border-gray-300 bg-white text-black placeholder-gray-400 focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600"} rounded-md`}
                  placeholder="Tuliskan pendapat Anda tentang film ini..."
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <div className="mt-6 flex gap-3">
                  <Button
                    className="px-6 bg-yellow-500 hover:bg-yellow-600 text-black"
                    onClick={isEditing ? handleUpdateComment : handleAddComment}
                  >
                    {isEditing ? "Perbarui" : "Kirim"} Komentar
                  </Button>

                  {isEditing && (
                    <Button
                      variant="outline"
                      className={`px-6 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-200"}`}
                      onClick={cancelEdit}
                    >
                      Batal
                    </Button>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className={`mt-6 ${isDarkMode ? "bg-gray-800/80 p-6 rounded-lg shadow-lg border border-gray-700" : "bg-white/90 p-6 rounded-lg shadow-lg border border-gray-200"}`}>
              <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Silakan <a href="/auth/login" className={`${isDarkMode ? "text-yellow-400 hover:text-yellow-500" : "text-yellow-600 hover:text-yellow-700"}`}>login</a> untuk menambahkan komentar dan rating.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilmDetail;