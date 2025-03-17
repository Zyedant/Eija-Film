import { useRouter } from "next/router";
import Navbar from "../Navbar";

type AppShellProps = {
  children: React.ReactNode;
};

const AppShell = (props: AppShellProps) => {
  const { children } = props;
  const { pathname } = useRouter();

  const disableNavbar = [
    "/auth/login", 
    "/auth/register", 
    "/auth/forgot-password",
    "/auth/reset-password",
    "/404", 
    "/admin",
    "/author",
    "/profile"
  ];

  return (
    <main className="transition duration-300">
      {!disableNavbar.some((path) => pathname.startsWith(path)) && <Navbar />}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800">{children}</div>
    </main>
  );
};

export default AppShell;
