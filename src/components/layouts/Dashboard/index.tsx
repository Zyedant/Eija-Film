import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { FaRegClock, FaCalendarAlt, FaFilm, FaTv, FaRocket, FaPlay, FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";

interface Genre {
  id: string;
  name: string;
}

interface Film {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  releaseYear: number;
  duration: number;
  genreRelations: { genre: Genre }[];
  category: string;
  createdAt: string;
  slug: string;
}

interface UserData {
  role: string;
  name: string;
  message: string;
}

const Dashboard = () => {
  const [films, setFilms] = useState<Film[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const sliderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const token = Cookies.get("token");
  const router = useRouter();

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = Cookies.get("theme");
      setIsDarkMode(savedTheme === "dark");
    };

    handleThemeChange();
    const cookieCheckInterval = setInterval(handleThemeChange, 1000);

    return () => {
      clearInterval(cookieCheckInterval);
      if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
    };
  }, []);
  
  useEffect(() => {
    if (token) {
      setUserData({ 
        role: Cookies.get("role") || "", 
        name: Cookies.get("name") || "",
        message: `Welcome back${Cookies.get("name") ? ', ' + Cookies.get("name") : ''}!` 
      });
    }

    const fetchFilms = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/film", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load films");
        const data = await res.json();
        setFilms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, [token]);

  useEffect(() => {
    if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
    
    if (newReleases.length > 0) {
      sliderIntervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev === newReleases.length - 1 ? 0 : prev + 1));
      }, 6000);
    }

    return () => {
      if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
    };
  }, [films]);
  
  const newReleases = films
    .filter(film => {
      const filmDate = new Date(film.createdAt);
      const currentDate = new Date();
      const daysDiff = (currentDate.getTime() - filmDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const movies = films.filter(film => film.category === "MOVIE");
  const series = films.filter(film => film.category === "SERIES");
  const anime = films.filter(film => film.category === "ANIME");

  const navigateToFilm = (slug: string) => router.push(`/film/${slug}`);
  
  const handleSlideChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentSlide(prev => (prev === 0 ? newReleases.length - 1 : prev - 1));
    } else {
      setCurrentSlide(prev => (prev === newReleases.length - 1 ? 0 : prev + 1));
    }
    
    if (sliderIntervalRef.current) {
      clearInterval(sliderIntervalRef.current);
      sliderIntervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev === newReleases.length - 1 ? 0 : prev + 1));
      }, 6000);
    }
  };

  const FilmGrid = ({ title, icon, films }: { title: string; icon: JSX.Element; films: Film[] }) => (
    <div className="mb-24">
      <h2 className={`text-4xl font-semibold mb-10 flex items-center ${
        isDarkMode ? "text-yellow-400" : "text-yellow-600"
      }`}>
        {icon}
        <span className="ml-3">{title}</span>
      </h2>
      
      {films.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {films.slice(0, 5).map(film => (
            <FilmCard key={film.id} film={film} />
          ))}
        </div>
      ) : (
        <div className={`p-8 text-center rounded-xl border ${
          isDarkMode 
            ? "bg-gray-800/50 border-gray-700 text-gray-300" 
            : "bg-gray-50/50 border-gray-200 text-gray-600"
        }`}>
          No {title.toLowerCase()} available
        </div>
      )}
    </div>
  );

  const FilmCard = ({ film }: { film: Film }) => (
    <Card 
      className={`relative overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-lg rounded-lg shadow-xl h-full flex flex-col ${
        isDarkMode 
          ? "bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700" 
          : "bg-gradient-to-br from-white to-gray-100 hover:from-gray-50 hover:to-white border border-gray-200"
      }`}
    >
      <div 
        className="relative w-full aspect-[2/3] overflow-hidden cursor-pointer group"
        onClick={() => navigateToFilm(film.slug)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10 opacity-40"></div>
        <img
          src={film.posterUrl}
          alt={film.title}
          className="w-full h-full object-cover rounded-t-lg transform transition-all duration-500 ease-in-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold p-3 rounded-full transform transition-all duration-300 hover:scale-110"
          >
            <FaPlay />
          </button>
        </div>
      </div>
      
      <div 
        className={`flex-1 p-4 flex flex-col justify-between ${
          isDarkMode 
            ? "bg-gradient-to-b from-gray-900 to-gray-800" 
            : "bg-gradient-to-b from-gray-50 to-white"
        }`}
      >
        <div>
          <h3 className={`text-xl font-semibold truncate ${
            isDarkMode ? "text-yellow-400" : "text-yellow-600"
          }`}>
            {film.title}
          </h3>
          
          <div className="flex mt-2 space-x-2">
            {film.genreRelations && film.genreRelations.slice(0, 2).map(genre => (
              <span 
                key={genre.genre.name} 
                className={`px-2 py-1 text-xs rounded-full ${
                  isDarkMode 
                    ? "bg-gray-800 text-yellow-400 border border-gray-700" 
                    : "bg-gray-100 text-yellow-600 border border-gray-200"
                }`}
              >
                {genre.genre.name}
              </span>
            ))}
          </div>
          
          <p className={`text-sm mt-2 h-12 line-clamp-2 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {film.description.length > 50 ? `${film.description.substring(0, 50)}...` : film.description}
          </p>
        </div>
      </div>
      
      <CardFooter 
        className={`p-4 grid grid-cols-2 gap-2 items-center border-t ${
          isDarkMode 
            ? "bg-gray-900 text-gray-400 border-gray-800" 
            : "bg-gray-50 text-gray-600 border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className={`${isDarkMode ? "text-yellow-500" : "text-yellow-600"} text-xs`} />
          <p className="text-xs">{film.releaseYear}</p>
        </div>
        <div className="flex items-center space-x-2 justify-end">
          <FaRegClock className={`${isDarkMode ? "text-yellow-500" : "text-yellow-600"} text-xs`} />
          <p className="text-xs">{film.duration} mins</p>
        </div>
      </CardFooter>
    </Card>
  );

  const FeaturedFilmSlide = ({ film }: { film: Film }) => (
    <div className="flex flex-col md:flex-row gap-6 md:items-center">
      <div className="w-full md:w-1/3">
        <div 
          className="aspect-[2/3] overflow-hidden rounded-2xl group relative transform transition-transform duration-500 hover:scale-105 cursor-pointer"
          onClick={() => navigateToFilm(film.slug)}
        >
          <div className={`absolute inset-0 ${
            isDarkMode 
              ? "bg-gradient-to-tr from-yellow-600/20" 
              : "bg-gradient-to-tr from-yellow-700/20"
          } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10`}></div>
          <img
            src={film.posterUrl}
            alt={film.title}
            className="w-full h-full object-cover shadow-2xl transition-all duration-700 group-hover:scale-110"
            style={{
              boxShadow: isDarkMode 
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 20px 5px rgba(234, 179, 8, 0.2)"
                : "0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 20px 5px rgba(234, 179, 8, 0.15)"
            }}
          />
        </div>
      </div>
      
      <div className="w-full md:w-2/3">
        <div className="p-6 md:p-8">
          <h3 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            {film.title}
          </h3>
          
          <div className="flex mt-2 space-x-2">
            {film.genreRelations && film.genreRelations.slice(0, 2).map((relation) => (
              <span 
                key={relation.genre.name} 
                className={`px-2 py-1 text-xs rounded-full ${
                  isDarkMode 
                    ? "bg-gray-800 text-yellow-400 border border-gray-700" 
                    : "bg-gray-100 text-yellow-600 border border-gray-200"
                }`}
              >
                {relation.genre.name}
              </span>
            ))}
          </div>
          
          <p className={`mb-8 text-lg leading-relaxed font-light max-w-2xl ${
            isDarkMode ? "text-gray-200" : "text-gray-700"
          }`}>
            {film.description.length > 200
              ? `${film.description.substring(0, 200)}...`
              : film.description}
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 md:justify-between items-start md:items-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <FaCalendarAlt className={`mr-2 text-lg ${
                  isDarkMode ? "text-yellow-500" : "text-yellow-600"
                }`} />
                <span className={isDarkMode ? "text-gray-200" : "text-gray-700"}>
                  {film.releaseYear}
                </span>
              </div>
              <div className="flex items-center">
                <FaRegClock className={`mr-2 text-lg ${
                  isDarkMode ? "text-yellow-500" : "text-yellow-600"
                }`} />
                <span className={isDarkMode ? "text-gray-200" : "text-gray-700"}>
                  {film.duration} mins
                </span>
              </div>
            </div>
            
            <button
              onClick={() => navigateToFilm(film.slug)}
              className={`px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg ${
                isDarkMode 
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900" 
                  : "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white"
              }`}
            >
              <FaPlay className="mr-2" /> Watch Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${
      isDarkMode 
        ? "bg-gradient-to-b from-gray-800 to-gray-900 text-white"
        : "bg-gradient-to-b from-gray-100 to-white text-gray-900"
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-extrabold mb-6 relative inline-block">
            <span 
              className={`text-transparent bg-clip-text ${
                isDarkMode 
                  ? "bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700"
                  : "bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-800"
              }`}
            >
              EijaFilm
            </span>
            <div 
              className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 ${
                isDarkMode 
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                  : "bg-gradient-to-r from-yellow-500 to-yellow-700"
              }`}
            >
            </div>
          </h1>
          <p className={`text-xl ${isDarkMode ? "text-gray-300" : "text-gray-700"} max-w-2xl mx-auto`}>
            {userData?.message || "Discover premium entertainment at your fingertips. Elegant. Exclusive. Exceptional."}
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-lg mb-4 text-center p-4 bg-red-100 rounded-lg border border-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center my-24">
            <div className="relative w-20 h-20">
              <div className={`absolute inset-0 border-4 ${
                isDarkMode 
                  ? "border-gray-800 border-t-yellow-500" 
                  : "border-gray-200 border-t-yellow-600"
                } rounded-full animate-spin`}
              >
              </div>
              <div className={`absolute inset-3 border-4 ${
                isDarkMode 
                  ? "border-gray-800 border-b-yellow-500" 
                  : "border-gray-200 border-b-yellow-600"
                } rounded-full animate-spin animate-delay-150`}
              >
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-24">
              <div className="flex justify-between items-center mb-10">
                <h2 className={`text-4xl font-bold flex items-center ${
                  isDarkMode ? "text-yellow-400" : "text-yellow-600"
                }`}>
                  <FaStar className={`mr-3 text-3xl ${
                    isDarkMode ? "text-yellow-500" : "text-yellow-600"
                  }`} />
                  <span>Premium Releases</span>
                </h2>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center z-10 pointer-events-none">
                  <button 
                    onClick={() => handleSlideChange('prev')}
                    className={`w-12 h-12 rounded-full ${
                      isDarkMode 
                        ? "bg-gray-900/60 border border-gray-700 text-yellow-500 hover:text-yellow-400 hover:bg-gray-800/80" 
                        : "bg-white/60 border border-gray-300 text-yellow-600 hover:text-yellow-500 hover:bg-gray-50/80"
                    } flex justify-center items-center transition-all duration-300 -translate-x-14 pointer-events-auto`}
                  >
                    <FaChevronLeft />
                  </button>
                    
                  <button 
                    onClick={() => handleSlideChange('next')}
                    className={`w-12 h-12 rounded-full ${
                      isDarkMode 
                        ? "bg-gray-900/60 border border-gray-700 text-yellow-500 hover:text-yellow-400 hover:bg-gray-800/80" 
                        : "bg-white/60 border border-gray-300 text-yellow-600 hover:text-yellow-500 hover:bg-gray-50/80"
                    } flex justify-center items-center transition-all duration-300 translate-x-14 pointer-events-auto`}
                  >
                    <FaChevronRight />
                  </button>
                </div>

                {newReleases.length > 0 ? (
                  <div className={`relative overflow-hidden rounded-3xl ${isDarkMode ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-sm shadow-xl z-20`}>
                    <div className="absolute inset-0 overflow-hidden">
                      <div className={`absolute top-0 left-0 w-full h-full z-0 ${
                        isDarkMode 
                          ? "bg-gradient-to-r from-gray-900 to-gray-800 opacity-70"
                          : "bg-gradient-to-r from-gray-100 to-white opacity-70"
                      }`}></div>
                      <div className={`absolute -top-32 -right-32 w-64 h-64 ${
                        isDarkMode ? "bg-yellow-500" : "bg-yellow-600"
                      } opacity-10 rounded-full blur-3xl`}></div>
                      <div className={`absolute -bottom-32 -left-32 w-64 h-64 ${
                        isDarkMode ? "bg-yellow-500" : "bg-yellow-600"} opacity-10 rounded-full blur-3xl`}></div>
                    </div>

                    <div className="relative p-8 z-10">
                      {newReleases.map((film, index) => (
                        <div
                          key={film.id}
                          className={`transition-all duration-700 ease-in-out ${
                            index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute top-0 left-0 w-full'
                          }`}
                        >
                          {index === currentSlide && <FeaturedFilmSlide film={film} />}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-center mb-6 space-x-2">
                      {newReleases.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`rounded-full transition-all duration-300 ${
                            index === currentSlide 
                              ? `${isDarkMode ? 'bg-yellow-500' : 'bg-yellow-600'} w-8 h-3` 
                              : `${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'} w-3 h-3`
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`p-12 text-center rounded-xl border ${
                    isDarkMode 
                      ? "bg-gray-800/50 border-gray-700 text-gray-300" 
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}>
                    No recent releases available
                  </div>
                )}
              </div>
            </div>

            <FilmGrid 
              title="Movies" 
              icon={<FaFilm className={`text-3xl ${isDarkMode ? "text-yellow-500" : "text-yellow-600"}`} />} 
              films={movies} 
            />
            
            <FilmGrid 
              title="Series" 
              icon={<FaTv className={`text-3xl ${isDarkMode ? "text-yellow-500" : "text-yellow-600"}`} />} 
              films={series} 
            />
            
            <FilmGrid 
              title="Anime" 
              icon={<FaRocket className={`text-3xl ${isDarkMode ? "text-yellow-500" : "text-yellow-600"}`} />} 
              films={anime} 
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;