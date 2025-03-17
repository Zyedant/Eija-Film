import { GetServerSideProps } from "next";
import { verifyAuth } from "@/lib/middleware";
import Profile from "@/views/Profile";

// Halaman Profile dengan Middleware
const ProfilePage = () => {
  return (
    <div>
      <Profile />
    </div>
  );
};

// Gunakan `getServerSideProps` untuk memanggil middleware
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;

  // Role yang diizinkan untuk mengakses halaman profil
  const allowedRoles = ["USER", "ADMIN", "AUTHOR"];

  // Middleware untuk memverifikasi autentikasi
  const middlewareResponse = await verifyAuth(
    async (req, res) => {
      // Jika verifikasi berhasil, lanjutkan ke halaman profil
      return { props: {} };
    },
    allowedRoles // Role yang diizinkan
  )(req, res);

  // Jika middleware mengembalikan respons (misalnya, redirect atau error), kembalikan ke client
  if (middlewareResponse) {
    return middlewareResponse;
  }

  // Jika berhasil, lanjutkan ke halaman profil
  return { props: {} };
};

export default ProfilePage;