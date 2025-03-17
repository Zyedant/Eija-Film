import Link from "next/link";
import { 
  FaTwitter, 
  FaFacebook, 
  FaInstagram, 
  FaYoutube, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt
} from "react-icons/fa";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const savedTheme = Cookies.get("theme");
    setIsDarkMode(savedTheme === "dark");
    
    const checkTheme = () => {
      const currentTheme = Cookies.get("theme");
      setIsDarkMode(currentTheme === "dark");
    };
    
    const themeInterval = setInterval(checkTheme, 1000);
    
    return () => clearInterval(themeInterval);
  }, []);
  
  return (
    <footer className={`${
      isDarkMode 
        ? "bg-black text-white border-t border-gray-800" 
        : "bg-white text-gray-800 border-t border-gray-200"
    } transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div>
            <h3 className={`text-2xl font-bold mb-4 ${
              isDarkMode 
                ? "text-yellow-500" 
                : "text-yellow-700"
            }`}>EijaFilm</h3>
            <p className={`${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } mb-4`}>
              Your premium platform for movies, series, and anime. Watch anywhere, anytime on your favorite devices.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="https://x.com/zyedant?t=xHUbC4YSkENnyhyr0TGWzg&s=09" className={`${
                isDarkMode 
                  ? "text-gray-400 hover:text-yellow-500" 
                  : "text-gray-500 hover:text-yellow-700"
              } transition-colors duration-300`}>
                <FaTwitter size={22} />
              </a>
              <a href="https://www.facebook.com/share/12Jv64Fvhiz/" className={`${
                isDarkMode 
                  ? "text-gray-400 hover:text-yellow-500" 
                  : "text-gray-500 hover:text-yellow-700"
              } transition-colors duration-300`}>
                <FaFacebook size={22} />
              </a>
              <a href="https://www.instagram.com/wildme_706?igsh=cjFrczV6bzU2bWU=" className={`${
                isDarkMode 
                  ? "text-gray-400 hover:text-yellow-500" 
                  : "text-gray-500 hover:text-yellow-700"
              } transition-colors duration-300`}>
                <FaInstagram size={22} />
              </a>
              <a href="https://youtube.com/@ajiewildanrifani1210?si=Gokp1XUFWrYtlJT2" className={`${
                isDarkMode 
                  ? "text-gray-400 hover:text-yellow-500" 
                  : "text-gray-500 hover:text-yellow-700"
              } transition-colors duration-300`}>
                <FaYoutube size={22} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className={`text-xl font-bold mb-4 ${
              isDarkMode ? "text-yellow-500" : "text-yellow-700"
            }`}>Help & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className={`${
                  isDarkMode 
                    ? "text-gray-300 hover:text-yellow-500" 
                    : "text-gray-600 hover:text-yellow-700"
                } transition-colors duration-300`}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className={`${
                  isDarkMode 
                    ? "text-gray-300 hover:text-yellow-500" 
                    : "text-gray-600 hover:text-yellow-700"
                } transition-colors duration-300`}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className={`${
                  isDarkMode 
                    ? "text-gray-300 hover:text-yellow-500" 
                    : "text-gray-600 hover:text-yellow-700"
                } transition-colors duration-300`}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={`${
                  isDarkMode 
                    ? "text-gray-300 hover:text-yellow-500" 
                    : "text-gray-600 hover:text-yellow-700"
                } transition-colors duration-300`}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/help" className={`${
                  isDarkMode 
                    ? "text-gray-300 hover:text-yellow-500" 
                    : "text-gray-600 hover:text-yellow-700"
                } transition-colors duration-300`}>
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className={`text-xl font-bold mb-4 ${
              isDarkMode ? "text-yellow-500" : "text-yellow-700"
            }`}>Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className={`${
                  isDarkMode ? "text-yellow-500" : "text-yellow-700"
                } mt-1 mr-3`} />
                <span className={`${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  Jl. Arjuna, Tobratan RT05, Wirokerten, Banguntapan, Bantul
                </span>
              </li>
              <li className="flex items-center">
                <FaPhone className={`${
                  isDarkMode ? "text-yellow-500" : "text-yellow-700"
                } mr-3`} />
                <span className={`${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>+62 857 2656 2357</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className={`${
                  isDarkMode ? "text-yellow-500" : "text-yellow-700"
                } mr-3`} />
                <span className={`${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>support@eijafilm.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className={`${
        isDarkMode ? "border-t border-gray-800" : "border-t border-gray-200"
      } py-6`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p className={`${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          } text-center md:text-left`}>
            &copy; {currentYear} EijaFilm. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/terms" className={`${
              isDarkMode 
                ? "text-gray-400 hover:text-yellow-500" 
                : "text-gray-500 hover:text-yellow-700"
            } text-sm transition-colors duration-300`}>
              Terms
            </Link>
            <Link href="/privacy" className={`${
              isDarkMode 
                ? "text-gray-400 hover:text-yellow-500" 
                : "text-gray-500 hover:text-yellow-700"
            } text-sm transition-colors duration-300`}>
              Privacy
            </Link>
            <Link href="/cookies" className={`${
              isDarkMode 
                ? "text-gray-400 hover:text-yellow-500" 
                : "text-gray-500 hover:text-yellow-700"
            } text-sm transition-colors duration-300`}>
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;