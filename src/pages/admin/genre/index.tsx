import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/layouts/Admin/Navbar";
import AdminSidebar from "@/components/layouts/Admin/Sidebar";
import AdminDashboard from "@/components/layouts/Admin/Dashboard";
import ManageUser from "@/views/Manage-User";
import ManageFilm from "@/views/Manage-Film"; 
import ManageGenre from "@/views/Manage-Genre";
import ManageCasting from "@/views/Manage-Casting";
import ManageGenreRelation from "@/views/Manage-Genre-Relation";
import ManageCastingRelation from "@/views/Manage-Casting-Relation";
import ManageCommentRating from "@/views/Manage-Comment-Rating";
import { parseCookies } from "nookies";
import jwt from "jsonwebtoken";

const verifyAuth = (token: string | undefined, allowedRoles: string[]): boolean => {
  if (!token) return false;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return allowedRoles.includes(decoded.role);
  } catch (error) {
    return false;
  }
};

const GenrePage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState("");

  useEffect(() => {
    const { pathname } = router;

    if (pathname === "/admin/user") {
      setCurrentPage("user");
    } else if (pathname === "/admin/film") {
      setCurrentPage("film");
    } else if (pathname === "/admin/genre") {
      setCurrentPage("genre");
    } else if (pathname === "/admin/genre-relation") {
      setCurrentPage("genre-relation");
    } else if (pathname === "/admin/casting") {
      setCurrentPage("casting");
    } else if (pathname === "/admin/casting-relation") {
      setCurrentPage("casting-relation");
    } else if (pathname === "/admin/comment-rating") {
      setCurrentPage("comment-rating");
    } else {
      setCurrentPage("dashboard");
    }
  }, [router.pathname]);

  const handleDashboardClick = () => {
    setCurrentPage("dashboard");
    router.push("/admin");
  };

  const handleUsersClick = () => {
    setCurrentPage("user");
    router.push("/admin/user");
  };

  const handleFilmClick = () => {
    setCurrentPage("film");
    router.push("/admin/film");
  };

  const handleGenreClick = () => {
    setCurrentPage("genre");
    router.push("/admin/genre");
  };

  const handleGenreRelationClick = () => {
    setCurrentPage("genre-relation");
    router.push("/admin/genre-relation");
  };

  const handleCastingClick = () => {
    setCurrentPage("casting");
    router.push("/admin/casting");
  };

  const handleCastingRelationClick = () => {
    setCurrentPage("casting-relation");
    router.push("/admin/casting-relation");
  };

  const handleCommentRatingClick = () => {
    setCurrentPage("comment-rating");
    router.push("/admin/comment-rating");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar
        onUsersClick={handleUsersClick}
        onDashboardClick={handleDashboardClick}
        onFilmClick={handleFilmClick}
        onGenreClick={handleGenreClick}
        onGenreRelationClick={handleGenreRelationClick}
        onCastingClick={handleCastingClick}
        onCastingRelationClick={handleCastingRelationClick}
        onCommentRatingClick={handleCommentRatingClick}
        currentPage={currentPage}
      />

      <div className="flex-1">
        <NavBar />

        {currentPage === "dashboard" && <AdminDashboard />}
        {currentPage === "user" && <ManageUser />}
        {currentPage === "film" && <ManageFilm />}
        {currentPage === "genre" && <ManageGenre />}
        {currentPage === "genre-relation" && <ManageGenreRelation />}
        {currentPage === "casting" && <ManageCasting />}
        {currentPage === "casting-relation" && <ManageCastingRelation />}
        {currentPage === "comment-rating" && <ManageCommentRating />}
      </div>
    </div>
  );
};

export const getServerSideProps = async (context: any) => {
  const cookies = parseCookies(context);
  const token = cookies.token;

  const allowedRoles = ['ADMIN'];
  const isAuthorized = verifyAuth(token, allowedRoles);

  if (!isAuthorized) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default GenrePage;
