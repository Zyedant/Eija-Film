import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaSun, FaMoon, FaSearch, FaTimes, FaUserCircle, FaChevronDown } from "react-icons/fa";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFilms, setFilteredFilms] = useState([]);
  const [films, setFilms] = useState([]);
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState("");
  const [userRole, setUserRole] = useState("");
  const router = useRouter();
  const profileRef = useRef(null);

  useEffect(() => {
    const token = Cookies.get("token");
    const isLoggedIn = Cookies.get("isLoggedIn");
    setIsLoggedIn(token && isLoggedIn === "true");

    if (token && isLoggedIn === "true") {
      const decoded = jwt.decode(token);
      const userId = decoded?.id || Cookies.get("userId");

      if (userId) {
        fetchUserData(userId);
      } else {
        console.error("User ID not found in token or cookies");
      }
    }

    const userRole = Cookies.get("role");
    setIsAdmin(userRole === "ADMIN");
    setIsAuthor(userRole === "AUTHOR");

    if (userRole === "ADMIN") {
      setUserRole("Admin");
    } else if (userRole === "AUTHOR") {
      setUserRole("Author");
    } else {
      setUserRole("User");
    }

    const savedTheme = Cookies.get("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    const fetchFilms = async () => {
      try {
        const response = await fetch("/api/film");
        const data = await response.json();
        setFilms(data);
        setFilteredFilms(data);
      } catch (error) {
        console.error("Error fetching films:", error);
      }
    };

    fetchFilms();

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data pengguna");
      }

      const userData = await response.json();
      setUserName(userData.name);
      setUserImage(userData.imageUrl); 
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      Cookies.remove("token");
      Cookies.remove("role");
      Cookies.remove("isLoggedIn");
      Cookies.remove("userId"); 

      setIsLoggedIn(false);
      setIsAdmin(false);
      setIsAuthor(false);
      closeModal();

      router.reload();
    } else {
      console.error("Logout failed.");
    }
  };

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);

    Cookies.set("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchQuery("");
    }
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const navigateToFilm = (filmId) => {
    router.push(`/film/${filmId}`);
    toggleSearch();
  };

  useEffect(() => {
    if (searchQuery) {
      const result = films.filter((film) =>
        film.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFilms(result);
    } else {
      setFilteredFilms([]);
    }
  }, [searchQuery, films]);

  return (
    <div>
      <nav
        className={`${
          isDarkMode ? "bg-black text-white" : "bg-white text-black"
        } p-5 shadow-lg sticky top-0 z-10 transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className={`${
              isDarkMode
                ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600"
                : "text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-800"
            } text-3xl font-extrabold`}
          >
            EijaFilm
          </div>

          <div className="hidden md:flex items-center space-x-8 text-lg">
            <Link
              href="/"
              className={`${
                isDarkMode ? "hover:text-yellow-300" : "hover:text-yellow-600"
              } transition duration-300 font-medium`}
            >
              Home
            </Link>
            <Link
              href="/film-list"
              className={`${
                isDarkMode ? "hover:text-yellow-300" : "hover:text-yellow-600"
              } transition duration-300 font-medium`}
            >
              Film List
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isSearchActive && (
              <button onClick={toggleSearch} className="p-2 relative">
                <FaSearch
                  className={`${isDarkMode ? "text-white" : "text-black"} cursor-pointer transform transition-all duration-200 hover:scale-125`}
                  size={24}
                />
              </button>
            )}

            {isSearchActive && (
              <div
                className={`fixed inset-0 z-50 bg-opacity-80 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"} flex flex-col items-center`}
              >
                <div className="relative w-3/4 md:w-1/2 mt-5">
                  <input
                    type="text"
                    placeholder="Search for films..."
                    value={searchQuery}
                    onChange={handleSearch}
                    autoFocus
                    className={`${
                      isDarkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"
                    } px-6 py-4 rounded-lg transition-all duration-300 w-full`}
                  />
                  <button onClick={toggleSearch} className="absolute right-3 top-3 p-2">
                    <FaTimes
                      className={`${isDarkMode ? "text-white" : "text-black"} cursor-pointer`}
                      size={24}
                    />
                  </button>
                </div>

                {searchQuery && (
                  <div className={`w-3/4 md:w-1/2 mt-4 max-h-96 overflow-y-auto rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-xl`}>
                    {filteredFilms.length > 0 ? (
                      filteredFilms.map((film) => (
                        <div 
                          key={film.id}
                          onClick={() => navigateToFilm(film.slug)}
                          className={`p-4 cursor-pointer ${isDarkMode ? "hover:bg-gray-700 border-b border-gray-700" : "hover:bg-gray-100 border-b border-gray-200"} transition duration-200 flex items-center`}
                        >
                          {film.posterUrl && (
                            <img 
                              src={film.posterUrl} 
                              alt={film.title} 
                              className="w-12 h-16 object-cover rounded mr-4"
                            />
                          )}
                          <div>
                            <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                              {film.title}
                            </h3>
                            {film.year && (
                              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {film.year}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={`p-6 text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        No films found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={toggleTheme}
              className={`${
                isDarkMode ? "bg-yellow-800 text-white" : "bg-yellow-600 text-white"
              } p-3 rounded-full shadow-md hover:bg-yellow-700 transition duration-200`}
            >
              {isDarkMode ? (
                <FaMoon size={20} className="transition duration-200" />
              ) : (
                <FaSun size={20} className="transition duration-200" />
              )}
            </button>

            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className={`flex items-center space-x-2 ${
                    isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                  } p-2 rounded-full transition duration-200`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500 shadow-md">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}>
                        <FaUserCircle size={32} className={`${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`} />
                      </div>
                    )}
                  </div>
                  <FaChevronDown className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  } ${isProfileOpen ? "transform rotate-180" : ""} transition-transform duration-200`} />
                </button>
                
                {isProfileOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  } ring-1 ring-black ring-opacity-5 py-1 z-20`}>
                    <div className={`px-4 py-3 border-b ${
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    }`}>
                      <p className={`font-medium ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}>{userName || "User"}</p>
                    </div>
                    <Link
                      href="/profile"
                      className={`block px-4 py-2 text-sm ${
                        isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
                      } transition duration-150`}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className={`block px-4 py-2 text-sm ${
                          isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
                        } transition duration-150`}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    {isAuthor && (
                      <Link
                        href="/author"
                        className={`block px-4 py-2 text-sm ${
                          isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
                        } transition duration-150`}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Author
                      </Link>
                    )}
                    <button
                      onClick={openModal}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-gray-100"
                      } transition duration-150`}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className={`${
                  isDarkMode
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-full shadow-xl hover:from-yellow-700 hover:to-yellow-800"
                    : "bg-gradient-to-r from-yellow-700 to-yellow-800 text-white px-6 py-3 rounded-full shadow-xl hover:from-yellow-800 hover:to-yellow-900"
                } transition duration-300`}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className={`${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } p-8 rounded-lg shadow-xl max-w-md w-full border-2 ${
            isDarkMode ? "border-yellow-700" : "border-yellow-500"
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode 
                ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600" 
                : "text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-800"
            }`}>Konfirmasi Logout</h2>
            
            <p className={`mb-6 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Apakah anda ingin Logout?
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-md border ${
                  isDarkMode 
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                } transition duration-200`}
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className={`px-4 py-2 rounded-md ${
                  isDarkMode
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800"
                    : "bg-gradient-to-r from-yellow-700 to-yellow-800 text-white hover:from-yellow-800 hover:to-yellow-900"
                } transition duration-200`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;