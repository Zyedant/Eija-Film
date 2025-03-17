import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FaFilter } from "react-icons/fa";
import Link from "next/link";

const FilmList = () => {
  const [films, setFilms] = useState([]);
  const [filteredFilms, setFilteredFilms] = useState([]);
  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [releaseYears, setReleaseYears] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedReleaseYear, setSelectedReleaseYear] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchFilms = async () => {
      setIsLoading(true);

      try {
        const response = await fetch("/api/film");
        const data = await response.json();
        console.log(data); // Cek struktur data yang diterima
        setFilms(data);
        setFilteredFilms(data);

        // Ekstrak semua genre dari genreRelations
        const allGenres = [
          ...new Set(
            data.flatMap((film) =>
              film.genreRelations.map((relation) => relation.genre.name)
            )
          ),
        ];

        // Ekstrak semua kategori
        const allCategories = [...new Set(data.map((film) => film.category))];

        // Ekstrak semua tahun rilis
        const allReleaseYears = [...new Set(data.map((film) => film.releaseYear))];

        // Set state untuk genre, kategori, dan tahun rilis
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

  const handleFilterChange = () => {
    let filtered = films;

    // Filter berdasarkan genre
    if (selectedGenre) {
      filtered = filtered.filter((film) =>
        film.genreRelations.some((relation) => relation.genre.name === selectedGenre)
      );
    }

    // Filter berdasarkan kategori
    if (selectedCategory) {
      filtered = filtered.filter((film) => film.category === selectedCategory);
    }

    // Filter berdasarkan tahun rilis
    if (selectedReleaseYear) {
      filtered = filtered.filter(
        (film) => film.releaseYear === Number(selectedReleaseYear)
      );
    }

    // Set hasil filter ke state
    setFilteredFilms(filtered);
  };

  const handleResetFilters = () => {
    setSelectedGenre("");
    setSelectedCategory("");
    setSelectedReleaseYear("");
    setFilteredFilms(films); // Kembalikan ke semua film
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700">
          Film List
        </h1>

        {/* Filters Section */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={toggleFilter}
            className="p-2 bg-yellow-500 text-white rounded-md flex items-center space-x-2 hover:bg-yellow-600 transition"
          >
            <FaFilter />
            <span>Filters</span>
          </button>
        </div>

        {isFilterOpen && (
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Genre Filter */}
              <div>
                <label className="block font-medium mb-2">Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 rounded-lg"
                >
                  <option value="">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block font-medium mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 rounded-lg"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Release Year Filter */}
              <div>
                <label className="block font-medium mb-2">Release Year</label>
                <select
                  value={selectedReleaseYear}
                  onChange={(e) => setSelectedReleaseYear(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 rounded-lg"
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
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
              >
                Reset Filters
              </button>
              <button
                onClick={handleFilterChange}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Films Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center mb-12">
            <div className="animate-spin border-t-4 border-yellow-500 w-16 h-16 rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredFilms.map((film) => (
              <Link key={film.id} href={`/film/${film.slug}`}>
                <div className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105">
                  <img
                    src={film.posterUrl}
                    alt={film.title}
                    className="w-full h-56 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold truncate">{film.title}</h3>
                    <p className="text-gray-500 dark:text-gray-300 text-sm truncate">
                      {film.description.length > 120
                        ? `${film.description.substring(0, 120)}...`
                        : film.description}
                    </p>
                    <div className="mt-2 text-sm text-yellow-500 font-medium flex justify-between">
                      <span>{film.releaseYear}</span>
                      <span>{film.duration} menit</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilmList;