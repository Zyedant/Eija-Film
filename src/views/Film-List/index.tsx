import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { FaFilter, FaChevronLeft, FaChevronRight, FaAngleDown } from "react-icons/fa";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { FaRegClock, FaCalendarAlt, FaFilm, FaTv, FaRocket, FaPlay, FaStar } from "react-icons/fa";

interface Genre {
  name: string;
}

interface Film {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  category: string;
  releaseYear: number;
  duration: number;
  genreRelations: { genre: Genre }[];
  slug: string;
  createdAt: string;
}

const FilmList = () => {
  const [films, setFilms] = useState<Film[]>([]); 
  const [filteredFilms, setFilteredFilms] = useState<Film[]>([]); 
  const [genres, setGenres] = useState<string[]>([]); 
  const [categories, setCategories] = useState<string[]>([]); 
  const [releaseYears, setReleaseYears] = useState<number[]>([]); 
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]); 
  const [selectedCategory, setSelectedCategory] = useState<string>(""); 
  const [selectedReleaseYear, setSelectedReleaseYear] = useState<string>(""); 
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const router = useRouter();
  const genreDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem("theme");
      setIsDarkMode(savedTheme === "dark");
    };

    handleThemeChange();
    window.addEventListener("storage", handleThemeChange);

    return () => {
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  useEffect(() => {
    const fetchFilms = async () => {
      setIsLoading(true);

      try {
        const response = await fetch("/api/film");
        const data: Film[] = await response.json();
        setFilms(data);
        setFilteredFilms(data);

        const allGenres = [
          ...new Set(
            data.flatMap((film) =>
              film.genreRelations.map((relation) => relation.genre.name)
            )
          ),
        ];

        const allCategories = [...new Set(data.map((film) => film.category))];
        const allReleaseYears = [...new Set(data.map((film) => film.releaseYear))];

        setGenres(allGenres);
        setCategories(allCategories);
        setReleaseYears(allReleaseYears);
      } catch (error) {
        console.error("Error fetching films:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilms();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target as Node)) {
        setIsGenreDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGenreChange = (genre: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const handleFilterChange = () => {
    let filtered = films;

    if (selectedGenres.length > 0) {
      filtered = filtered.filter((film) =>
        selectedGenres.every((genre) =>
          film.genreRelations.some((relation) => relation.genre.name === genre)
        )
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((film) => film.category === selectedCategory);
    }

    if (selectedReleaseYear) {
      filtered = filtered.filter(
        (film) => film.releaseYear === Number(selectedReleaseYear)
      );
    }

    setFilteredFilms(filtered);
  };

  const handleResetFilters = () => {
    setSelectedGenres([]);
    setSelectedCategory("");
    setSelectedReleaseYear("");
    setFilteredFilms(films);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const toggleGenreDropdown = () => {
    setIsGenreDropdownOpen(!isGenreDropdownOpen);
  };

  const navigateToFilm = (slug: string) => router.push(`/film/${slug}`);

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
            Discover premium entertainment at your fingertips. Elegant. Exclusive. Exceptional.
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={toggleFilter}
            className={`p-2 rounded-md flex items-center space-x-2 transition ${
              isDarkMode 
                ? "bg-gray-700 text-yellow-500 hover:bg-gray-600" 
                : "bg-gray-200 text-yellow-600 hover:bg-gray-300"
            }`}
          >
            <FaFilter />
            <span>Filters</span>
          </button>
        </div>

        {isFilterOpen && (
          <div className={`mb-6 p-4 rounded-lg shadow-lg ${
            isDarkMode 
              ? "bg-gray-700" 
              : "bg-gray-200"
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div ref={genreDropdownRef}>
                <label className={`block font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>Genre</label>
                <div className="relative">
                  <button
                    onClick={toggleGenreDropdown}
                    className={`w-full p-2 rounded-lg flex justify-between items-center ${
                      isDarkMode 
                        ? "bg-gray-800 text-gray-300 border-gray-700 border" 
                        : "bg-white text-gray-700 border-gray-300 border"
                    }`}
                  >
                    <span>
                      {selectedGenres.length > 0 
                        ? `${selectedGenres.length} genre${selectedGenres.length > 1 ? 's' : ''} selected` 
                        : 'All Genres'}
                    </span>
                    <FaAngleDown className={`transition-transform ${isGenreDropdownOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {isGenreDropdownOpen && (
                    <div className={`absolute z-10 mt-1 w-full rounded-lg shadow-lg ${
                      isDarkMode 
                        ? "bg-gray-800 text-gray-300 border border-gray-700" 
                        : "bg-white text-gray-700 border border-gray-300"
                    }`}>
                      <div className="p-3 max-h-48 overflow-y-auto">
                        {genres.map((genre) => (
                          <div key={genre} className="mb-1 flex items-center">
                            <input
                              type="checkbox"
                              id={`genre-${genre}`}
                              checked={selectedGenres.includes(genre)}
                              onChange={() => handleGenreChange(genre)}
                              className={`mr-2 ${
                                isDarkMode 
                                  ? "bg-gray-700 border-gray-600" 
                                  : "bg-gray-100 border-gray-300"
                              }`}
                            />
                            <label 
                              htmlFor={`genre-${genre}`}
                              className="cursor-pointer text-sm"
                            >
                              {genre}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={`block font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full p-2 rounded-lg ${
                    isDarkMode 
                      ? "bg-gray-800 text-gray-300 border-gray-700" 
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>Release Year</label>
                <select
                  value={selectedReleaseYear}
                  onChange={(e) => setSelectedReleaseYear(e.target.value)}
                  className={`w-full p-2 rounded-lg ${
                    isDarkMode 
                      ? "bg-gray-800 text-gray-300 border-gray-700" 
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  <option value="">All Years</option>
                  {releaseYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={handleResetFilters}
                className={`px-4 py-2 rounded-md transition ${
                  isDarkMode 
                    ? "bg-gray-600 text-gray-300 hover:bg-gray-500" 
                    : "bg-gray-400 text-gray-700 hover:bg-gray-500"
                }`}
              >
                Reset Filters
              </button>
              <button
                onClick={handleFilterChange}
                className={`px-4 py-2 rounded-md transition ${
                  isDarkMode 
                    ? "bg-yellow-500 text-gray-900 hover:bg-yellow-600" 
                    : "bg-yellow-600 text-white hover:bg-yellow-700"
                }`}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredFilms.map((film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilmList;