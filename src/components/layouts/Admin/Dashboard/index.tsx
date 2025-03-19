import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import Link from "next/link"; 
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FaChartLine, FaDollarSign, FaUsers, FaExclamationTriangle } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);
  const [totalFilms, setTotalFilms] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/auth/login');
    } else {
      const userRole = Cookies.get('role') || null;
      setRole(userRole);
      fetchDashboardData(); 
      setLoading(false);
    }
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setTotalUsers(data.totalUsers);
      setActiveSessions(data.activeSessions);
      setTotalFilms(data.totalFilms);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const dashboardStats = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(), 
      icon: <FaUsers className="text-2xl" />,
      gradient: "from-yellow-500 to-orange-600",
      link: "/admin/user" 
    },
    {
      title: "Active Sessions",
      value: activeSessions.toLocaleString(), 
      icon: <FaChartLine className="text-2xl" />,
      gradient: "from-yellow-500 to-orange-600",
      link: "/admin/user" 
    },
    {
      title: "Total Films",
      value: totalFilms.toLocaleString(), 
      icon: <FaDollarSign className="text-2xl" />,
      gradient: "from-yellow-500 to-orange-600",
      link: "/admin/film" 
    }
  ];

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-6">
        <div className="text-3xl font-extrabold mb-6 h-8 w-64">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  if (role !== "ADMIN") {
    return (
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <FaExclamationTriangle className="text-5xl text-red-500" />
              <h2 className="text-xl font-semibold text-red-700">Access Denied</h2>
              <p className="text-red-600">You do not have permission to access this page.</p>
              <button 
                onClick={() => router.push('/')}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Return to Home
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="text-3xl font-extrabold mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700">
        Dashboard Overview
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {dashboardStats.map((stat, index) => (
          <Link href={stat.link} key={index} passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-r ${stat.gradient} shadow-xl rounded-xl text-white transform transition-all duration-300 cursor-pointer`}
            >
              <CardHeader className="text-lg md:text-xl font-semibold flex items-center pb-2">
                <span className="mr-2">{stat.icon}</span> {stat.title}
              </CardHeader>
              <CardContent className="text-3xl md:text-4xl font-bold pt-0">
                {stat.value}
              </CardContent>
            </motion.div>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default AdminDashboard;