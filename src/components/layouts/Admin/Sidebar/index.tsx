import { useState, useEffect } from "react";
import { FaTachometerAlt, FaUsers, FaBars, FaCaretDown, FaVideo, FaUserAlt, FaTag, FaComment } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie"; 

const AdminSidebar = ({ 
  onUsersClick, 
  onDashboardClick, 
  onFilmClick, 
  onGenreClick, 
  onGenreRelationClick,
  onCastingClick,
  onCastingRelationClick, 
  onCommentRatingClick, 
  currentPage,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [isCastingDropdownOpen, setIsCastingDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); 

  useEffect(() => {
    const role = Cookies.get("role"); 
    setIsAdmin(role === "ADMIN"); 
  }, []); 

  const isActive = (page) => currentPage === page;

  const SidebarItem = ({ onClick, icon, label, page }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 p-3 rounded-md hover:bg-yellow-600 hover:text-white transition duration-300 w-full
        ${isActive(page) ? 'bg-yellow-500 text-white' : ''}`}
    >
      {icon}
      {isSidebarOpen && <span className="text-base">{isSidebarOpen ? label : ""}</span>}
    </button>
  );

  return (
    <aside
      className={`transition-all duration-300 min-h-screen p-4
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        bg-white text-black dark:bg-gray-800 dark:text-white
        shadow-lg dark:shadow-xl rounded-lg mr-2`}
    >
      <Button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="mb-6 p-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <FaBars size={20} />
      </Button>

      <ul className="space-y-6">
        {/* Link to Dashboard - Only visible to Admin */}
        {isAdmin && (
          <li>
            <SidebarItem 
              onClick={onDashboardClick} 
              icon={<FaTachometerAlt size={20} />} 
              label="Dashboard" 
              page="dashboard"
            />
          </li>
        )}

        {/* Link to Users - Only visible to Admin */}
        {isAdmin && (
          <li>
            <SidebarItem 
              onClick={onUsersClick} 
              icon={<FaUserAlt size={20} />} 
              label="User" 
              page="user"
            />
          </li>
        )}

        {/* Link to Manage Film - Visible for both Admin and Author */}
        {isAdmin && (
          <li>
            <SidebarItem 
              onClick={onFilmClick} 
              icon={<FaVideo size={20} />} 
              label="Film" 
              page="film"
            />
          </li>
        )}

        {/* Dropdown for Genre - Only visible to Admin */}
        {isAdmin && (
          <li>
            <button
              onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)} 
              className={`flex items-center space-x-3 p-3 rounded-md hover:bg-yellow-600 hover:text-white transition duration-300 w-full
                ${isActive("genre") || isActive("genre-relation") ? 'bg-yellow-500 text-white' : ''}`}
            >
              <FaTag size={20} />
              {isSidebarOpen && <span className="text-base">{isSidebarOpen ? "Genre" : ""}</span>}
              <FaCaretDown className="ml-2" />
            </button>
            {isGenreDropdownOpen && (
              <ul className="space-y-2 pl-8 mt-2">
                {/* Link to Genre */}
                <li>
                  <SidebarItem 
                    onClick={onGenreClick} 
                    icon={<FaTag size={20} />}
                    label="Genre" 
                    page="genre"
                  />
                </li>

                {/* Link to Genre Relation */}
                <li>
                  <SidebarItem 
                    onClick={onGenreRelationClick} 
                    icon={<FaTag size={20} />}
                    label="Genre Relation" 
                    page="genre-relation"
                  />
                </li>
              </ul>
            )}
          </li>
        )}

        {isAdmin && (
          <li>
            <button
              onClick={() => setIsCastingDropdownOpen(!isCastingDropdownOpen)}
              className={`flex items-center space-x-3 p-3 rounded-md hover:bg-yellow-600 hover:text-white transition duration-300 w-full
                ${isActive("casting") || isActive("casting-relation") ? 'bg-yellow-500 text-white' : ''}`}
            >
              <FaUsers size={20} />
              {isSidebarOpen && <span className="text-base">{isSidebarOpen ? "Casting" : ""}</span>}
              <FaCaretDown className="ml-2" />
            </button>
            {isCastingDropdownOpen && (
              <ul className="space-y-2 pl-8 mt-2">
                {/* Link to Casting */}
                <li>
                  <SidebarItem 
                    onClick={onCastingClick} 
                    icon={<FaUsers size={20} />}
                    label="Casting" 
                    page="casting"
                  />
                </li>

                {/* Link to Casting Relation */}
                <li>
                  <SidebarItem 
                    onClick={onCastingRelationClick} 
                    icon={<FaUsers size={20} />}
                    label="Casting Relation" 
                    page="casting-relation"
                  />
                </li>
              </ul>
            )}
          </li>
        )}

        {/* Link to Comments & Ratings - Only visible to Admin */}
        {isAdmin && (
          <li>
            <SidebarItem 
              onClick={onCommentRatingClick} 
              icon={<FaComment size={20} />} 
              label="Comment & Rating" 
              page="comment-rating"
            />
          </li>
        )}

        {/* If user is Author, display only Film, Genre Relation, and Casting Relation */}
        {!isAdmin && (
          <>
            <li>
            <SidebarItem 
              onClick={onDashboardClick} 
              icon={<FaTachometerAlt size={20} />} 
              label="Dashboard" 
              page="dashboard"
            />
            </li>
            <li>
              <SidebarItem 
                onClick={onFilmClick} 
                icon={<FaVideo size={20} />} 
                label="Film" 
                page="film"
              />
            </li>
            <li>
              <SidebarItem 
                onClick={onGenreRelationClick} 
                icon={<FaTag size={20} />} 
                label="Genre Relation" 
                page="genre-relation"
              />
            </li>
            <li>
              <SidebarItem 
                onClick={onCastingRelationClick} 
                icon={<FaUsers size={20} />} 
                label="Casting Relation" 
                page="casting-relation"
              />
            </li>
          </>
        )}
      </ul>
    </aside>
  );
};

export default AdminSidebar;
