import { useState, useEffect, useRef } from "react";
import { FaSearch, FaMoon, FaSun, FaUserCircle, FaChevronDown } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import Link from "next/link";

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk modal logout
  const router = useRouter();
  const profileRef = useRef(null);

  useEffect(() => {
    const savedTheme = Cookies.get("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    // Fetch user data if logged in
    const token = Cookies.get("token");
    const isLoggedIn = Cookies.get("isLoggedIn");
    if (token && isLoggedIn === "true") {
      const decoded = jwt.decode(token);
      const userId = decoded?.id || Cookies.get("userId");

      if (userId) {
        fetchUserData(userId);
      } else {
        console.error("User ID not found in token or cookies");
      }
    }

    // Close profile dropdown when clicking outside
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
      setUserImage(userData.imageUrl); // Simpan imageUrl ke state
    } catch (error) {
      console.error("Error fetching user data:", error);
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

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  
    // Ambil path saat ini tanpa query
    const currentPath = router.pathname;
  
    // Push ke path yang sama dengan query search
    router.push({
      pathname: currentPath, // Tetap di path yang sama
      query: { ...router.query, search: query }, // Tambahkan atau update query search
    });
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      Cookies.remove("token");
      Cookies.remove("isLoggedIn");
      Cookies.remove("userId"); // Hapus userId dari cookie

      router.push("/auth/login");
    } else {
      console.error("Logout failed.");
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl shadow-md mb-6 mt-6 mx-4 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
      <div className={`flex items-center w-full px-4 py-2 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
        <FaSearch className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
        <Input
          type="text"
          placeholder="Search"
          className={`bg-transparent border-none focus:ring-0 ml-2 w-full ${isDarkMode ? "text-white" : "text-gray-900"}`}
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="flex items-center space-x-6 ml-4">
        {/* Toggle Theme Button */}
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

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={toggleProfileDropdown}
            className={`flex items-center space-x-2 ${
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            } p-2 rounded-full transition duration-200`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500 shadow-md">
              {userImage ? (
                <img
                  src={userImage} // Gunakan imageUrl dari state
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

          {/* Profile Dropdown Menu */}
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
              <Link
                href="/"
                className={`block px-4 py-2 text-sm ${
                  isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
                } transition duration-150`}
                onClick={() => setIsProfileOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={openModal} // Buka modal saat tombol logout diklik
                className={`block w-full text-left px-4 py-2 text-sm ${
                  isDarkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-gray-100"
                } transition duration-150`}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
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