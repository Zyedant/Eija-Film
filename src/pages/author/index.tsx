import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/layouts/Admin/Navbar";
import AdminSidebar from "@/components/layouts/Admin/Sidebar";
import ManageFilm from "@/views/Manage-Film";
import ManageGenreRelation from "@/views/Manage-Genre-Relation";
import ManageCastingRelation from "@/views/Manage-Casting-Relation";
import AuthorDashboard from "@/components/layouts/Author/Dashboard";
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

const AuthorPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState("");

  useEffect(() => {
    const { pathname } = router;

    if (pathname === "/author/film") {
      setCurrentPage("film");
    } else if (pathname === "/author/genre-relation") {
      setCurrentPage("genre-relation");
    } else if (pathname === "/author/casting-relation") {
      setCurrentPage("casting-relation");
    } else {
      setCurrentPage("dashboard");
    }
  }, [router.pathname]);

  const handleDashboardClick = () => {
    setCurrentPage("dashboard");
    router.push("/author");
  };

  const handleFilmClick = () => {
    setCurrentPage("film");
    router.push("/author/film");
  };

  const handleGenreRelationClick = () => {
    setCurrentPage("genre-relation");
    router.push("/author/genre-relation");
  };

  const handleCastingRelationClick = () => {
    setCurrentPage("casting-relation");
    router.push("/author/casting-relation");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <AdminSidebar
        onDashboardClick={handleDashboardClick}
        onFilmClick={handleFilmClick}
        onGenreRelationClick={handleGenreRelationClick}
        onCastingRelationClick={handleCastingRelationClick}
        currentPage={currentPage}
      />

      <div className="flex-1">
        {/* NavBar */}
        <NavBar />

        {/* Render pages based on the currentPage */}
        {currentPage === "dashboard" && <AuthorDashboard />}
        {currentPage === "film" && <ManageFilm />}
        {currentPage === "genre-relation" && <ManageGenreRelation />}
        {currentPage === "casting-relation" && <ManageCastingRelation />}
      </div>
    </div>
  );
};

export const getServerSideProps = async (context: any) => {
  const cookies = parseCookies(context);
  const token = cookies.token;

  const allowedRoles = ['AUTHOR'];
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

export default AuthorPage;
