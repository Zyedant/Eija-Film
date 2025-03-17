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
    role: string; // Tambahkan role user (ADMIN, AUTHOR, USER)
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
}

const FilmDetail = () => {
  const [film, setFilm] = useState<FilmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [expandedComment, setExpandedComment] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // State untuk tema

  const { query, isReady, push } = useRouter();
  const filmSlug = query.slug as string | undefined;

  // Number of comment
  const commentsToShow = 3;

  // Load theme from cookies and set up listeners
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = Cookies.get("theme");
      setIsDarkMode(savedTheme === "dark");
    };

    // Initial theme setup
    handleThemeChange();

    // Set up a listener to detect theme changes
    const cookieCheckInterval = setInterval(() => {
      handleThemeChange();
    }, 1000);

    return () => {
      clearInterval(cookieCheckInterval);
    };
  }, []);

  // Apply dark/light theme to the HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = Cookies.get('token');

        if (!token) {
          throw new Error("Token tidak ditemukan");
        }

        const decodedToken: any = jwt.decode(token);

        if (!decodedToken || !decodedToken.id) {
          throw new Error("Token tidak valid");
        }

        setCurrentUserId(decodedToken.id);
        setCurrentUserRole(decodedToken.role);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch film data
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

        // Calculate average rating (only from USER role)
        let totalRating = 0;
        let ratingCount = 0;

        if (filmData.comments && filmData.comments.length > 0) {
          filmData.comments.forEach((comment) => {
            // Only count ratings from USER role
            if (comment.user.role === "USER" && comment.rating && comment.rating.length > 0) {
              totalRating += comment.rating[0].score;
              ratingCount++;
            }
          });
        }

        const avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;

        // Check if the current user has commented
        let userCommented = false;
        let userRating = null;
        let userCommentId = null;

        if (currentUserId) {
          const userComment = filmData.comments.find(
            (comment) => comment.user.id === currentUserId
          );
          if (userComment) {
            userCommented = true;
            userRating = userComment.rating?.[0]?.score || null;
            userCommentId = userComment.id;
          }
        }

        const transformedFilmData: FilmData = {
          id: filmData.id,
          title: filmData.title,
          description: filmData.description,
          posterUrl: filmData.posterUrl,
          backgroundUrl: filmData.backgroundUrl || filmData.posterUrl,
          releaseYear: filmData.releaseYear,
          duration: filmData.duration,
          avgRating: avgRating,
          genres: filmData.genreRelations || [],
          cast: filmData.castingRelations || [],
          trailerUrl: filmData.trailerUrl || "",
          comments: filmData.comments || [],
          director: filmData.director,
          userCommented,
          userRating,
          userCommentId,
        };

        setFilm(transformedFilmData);

        // Fetch comments (if needed)
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

  // Fetch comments
  const fetchComments = async (filmId: string) => {
    try {
      const commentsRes = await fetch(`/api/comment?filmId=${encodeURIComponent(filmId)}`);
      if (!commentsRes.ok) {
        throw new Error("Failed to fetch comments");
      }

      const commentsData = await commentsRes.json();

      setCommentList(commentsData);

      if (currentUserId) {
        const userComment = commentsData.find((comment) => comment.userId === currentUserId);
        if (userComment) {
          setFilm((prevFilm) => ({
            ...prevFilm!,
            userCommented: true,
            userRating: userComment.rating?.[0]?.score || null,
            userCommentId: userComment.id,
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Gagal memuat komentar");
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!film || !currentUserId || film.userCommented) return;

    if (comment.trim()) {
      try {
        // Save the comment
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

        // Save the rating (only if user is USER)
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

        // Update the film state with the new comment
        setFilm((prevFilm) => ({
          ...prevFilm!,
          userCommented: true,
          userRating: rating || null,
          userCommentId: responseComment.id,
        }));

        // After adding the comment and rating, re-fetch comments
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

  // Handle update comment
  const handleUpdateComment = async () => {
    if (!film || !editingCommentId) return;

    try {
      // Update the comment
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

      // Update the rating (only if rating is not null)
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

      // Refresh comments
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

  // Handle delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!film) return;

    if (confirm("Apakah Anda yakin ingin menghapus komentar ini?")) {
      try {
        // Cari komentar yang akan dihapus
        const commentToDelete = commentList.find((c) => c.id === commentId);

        if (!commentToDelete) {
          throw new Error("Comment not found");
        }

        // Hapus rating yang terkait dengan komentar (jika ada)
        if (commentToDelete.rating && commentToDelete.rating.length > 0) {
          for (const rating of commentToDelete.rating) {
            await fetch(`/api/rating/${rating.id}`, {
              method: "DELETE",
            });
          }
        }

        // Hapus komentar
        const deleteRes = await fetch(`/api/comment/${commentId}`, {
          method: "DELETE",
        });

        if (!deleteRes.ok) {
          throw new Error("Failed to delete comment");
        }

        // Update the film state
        setFilm((prevFilm) => ({
          ...prevFilm!,
          userCommented: false,
          userRating: null,
          userCommentId: null,
        }));

        // Refresh comments
        fetchComments(film.id);

        toast.success("Komentar berhasil dihapus!");
      } catch (error) {
        console.error("Error deleting comment:", error);
        toast.error("Terjadi kesalahan dalam menghapus komentar");
      }
    }
  };

  // Handle rating change
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  // Cancel edit
  const cancelEdit = () => {
    setIsEditing(false);
    setComment("");
    setRating(null);
    setEditingCommentId(null);
  };

  // Toggle expand comment
  const toggleExpandComment = (commentId: string) => {
    if (expandedComment === commentId) {
      setExpandedComment(null);
    } else {
      setExpandedComment(commentId);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500"></div>
      </div>
    );
  }

  // Render error state
  if (error || !film) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-4">{error || "Film tidak ditemukan"}</h2>
          <p className="text-gray-300">Silakan kembali ke halaman utama</p>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white">
      {/* Background Image with Gradient Overlay */}
      <div className="relative">
        <div
          className="absolute top-0 left-0 w-full h-[500px] bg-cover bg-center"
          style={{ backgroundImage: `url(${film.backgroundUrl || film.posterUrl})` }}
        />
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-black/70 to-gray-900" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Poster and Trailer Button */}
          <div className="relative">
            <img
              src={film.posterUrl}
              alt={film.title}
              className="w-full rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 border-2 border-yellow-500/30"
            />
            {/* Tombol Tonton Trailer dipindahkan ke bawah poster */}
            {film.trailerUrl && (
              <div className="mt-4">
                <Button
                  variant="default"
                  className="w-full flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black"
                  onClick={() => setShowTrailer(true)}
                >
                  <FaPlayCircle className="w-5 h-5" />
                  Tonton Trailer
                </Button>
              </div>
            )}
          </div>

          {/* Film Details */}
          <div>
            <h1 className="text-4xl font-bold mb-2 text-yellow-400">{film.title}</h1>
            {film.director && (
              <p className="text-xl text-gray-300 mb-6">Disutradarai oleh {film.director}</p>
            )}

            {/* Film Metadata */}
            <div className="flex items-center space-x-6 mb-6">
              {film.releaseYear > 0 && (
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-200">{film.releaseYear}</span>
                </div>
              )}

              {film.duration > 0 && (
                <div className="flex items-center gap-2">
                  <FaRegClock className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-200">{film.duration} menit</span>
                </div>
              )}

              {/* Overall Rating */}
              {film.avgRating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-5 h-5 ${i < Math.round(film.avgRating)
                          ? "text-yellow-500"
                          : "text-gray-600"}`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-200">{film.avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-8">
              {film.genres && film.genres.length > 0 ? (
                film.genres.map((genre) => (
                  <Badge key={`${genre.id}`} className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/30">
                    {genre.genre.name}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500">Belum ada genre</span>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-3 text-yellow-400">Ringkasan</h3>
              <p className="text-gray-300 leading-relaxed">{film.description}</p>
            </div>

            {/* Cast */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-yellow-400">Pemeran</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {film.cast && film.cast.length > 0 ? (
                  film.cast.map((casting, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-gray-800/80 border border-gray-700 p-3 rounded-lg shadow-md hover:bg-gray-800 transition-colors"
                    >
                      <img
                        src={casting.casting.photoUrl || "/placeholder-casting.jpg"}
                        alt={casting.casting.stageName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-yellow-500/40"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-white">{casting.casting.stageName}</div>
                        {casting.role && <div className="text-sm text-gray-400">{casting.role}</div>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Belum ada pemeran</p>
                )}
              </div>
            </div>

            {/* Trailer Modal */}
            {showTrailer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
                <div className="relative w-full max-w-4xl bg-gray-900 rounded-lg overflow-hidden">
                  {/* Close Button */}
                  <button
                    onClick={() => setShowTrailer(false)}
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

                  {/* Trailer Embed */}
                  <iframe
                    src={`https://www.youtube.com/embed/${film.trailerUrl}`}
                    title={`${film.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full aspect-video"
                  />
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="mt-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-semibold text-yellow-400">Komentar</h3>
                  <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    {commentList.length}
                  </Badge>
                </div>
              </div>

              {/* Comments Container */}
              <div className="bg-gray-800/60 rounded-xl border border-gray-700 overflow-hidden">
                {/* Comments Header */}
                <div className="bg-gray-700/80 p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FaComments className="text-yellow-400" />
                    <span className="font-medium text-white">Ulasan Penonton</span>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-yellow-400 hover:text-yellow-500 hover:bg-gray-700"
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

                {/* Comments List */}
                <div className="max-h-[600px] overflow-y-auto p-4">
                  {commentList && commentList.length > 0 ? (
                    (showAllComments ? commentList : commentList.slice(0, commentsToShow)).map((commentItem) => (
                      <div
                        key={commentItem.id}
                        className={`mb-4 last:mb-0 bg-gray-800/80 p-4 rounded-lg shadow-md border ${
                          commentItem.user.id === currentUserId
                            ? "border-yellow-500/40"
                            : "border-gray-700"
                        } transition-all hover:bg-gray-800 ${expandedComment === commentItem.id ? "border-yellow-400" : ""}`}
                      >
                        {/* Comment Header */}
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold ${
                            commentItem.user.id === currentUserId
                              ? "text-yellow-400"
                              : "text-white"
                          }`}>
                            {commentItem.user.name}
                            {commentItem.user.id === currentUserId && " (Anda)"}
                          </span>
                          {/* Tampilkan rating hanya jika user bukan ADMIN atau AUTHOR */}
                          {commentItem.user.role === "USER" && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.round(commentItem.rating?.[0]?.score || 0)
                                    ? "text-yellow-500"
                                    : "text-gray-600"}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Comment Content */}
                        <div className="mt-2 relative">
                          <p className={`text-gray-300 leading-relaxed ${
                            expandedComment === commentItem.id ? "" : "line-clamp-2"
                          }`}>
                            {commentItem.content}
                          </p>

                          {/* Expand button - only show if content is long */}
                          {commentItem.content.length > 100 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpandComment(commentItem.id)}
                              className="mt-1 text-yellow-500 hover:text-yellow-400 hover:bg-transparent p-0 h-auto flex items-center gap-1"
                            >
                              <FaExpand className="w-3 h-3" />
                              <span>{expandedComment === commentItem.id ? "Tutup" : "Baca selengkapnya"}</span>
                            </Button>
                          )}
                        </div>

                        {/* Comment Footer */}
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                          <span>
                            {new Date(commentItem.createdAt).toLocaleString("id-ID", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {/* Comment action buttons for user's own comments */}
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
                                className="flex items-center gap-1 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 py-1 h-7"
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
                      <p className="text-gray-400">Belum ada komentar untuk film ini</p>
                      {!film.userCommented && (
                        <p className="text-gray-300 mt-2">Jadilah yang pertama memberikan komentar!</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Show more comments button - only show if there are more comments to display */}
                {!showAllComments && commentList.length > commentsToShow && (
                  <div className="p-4 bg-gray-800/90 border-t border-gray-700 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllComments(true)}
                      className="w-full flex items-center justify-center gap-2 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <FaChevronDown />
                      Lihat {commentList.length - commentsToShow} komentar lainnya
                    </Button>
                  </div>
                )}
              </div>

              {/* Comment Form - Add or Edit */}
              {(!film.userCommented || isEditing) && (
                <div id="comment-form" className="mt-6 bg-gray-800/80 p-6 rounded-lg shadow-lg border border-gray-700">
                  <h3 className="text-xl font-semibold mb-4 text-yellow-400">
                    {isEditing ? "Edit Komentar dan Rating" : "Tambahkan Komentar dan Rating"}
                  </h3>

                  {/* Tambahkan Rating Bintang di Atas Textarea */}
                  <div className="mb-4 flex items-center gap-4">
                    <span className="text-gray-300">Rating:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          onClick={() => handleRatingChange(star)}
                          className={`w-6 h-6 cursor-pointer transition-colors ${
                            star <= (rating || 0) ? "text-yellow-500" : "text-gray-600"
                          } hover:text-yellow-400`}
                        />
                      ))}
                    </div>
                    {rating && <span className="text-gray-300">({rating}/5)</span>}
                  </div>

                  {/* Textarea untuk Komentar */}
                  <textarea
                    className="w-full p-4 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    placeholder="Tuliskan pendapat Anda tentang film ini..."
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />

                  {/* Tombol untuk Mengirim atau Memperbarui Komentar */}
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
                        className="px-6 border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={cancelEdit}
                      >
                        Batal
                      </Button>
                    )}
                  </div>
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