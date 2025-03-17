import { GetServerSideProps } from "next";
import { verifyAuth } from "@/lib/middleware";
import Profile from "@/views/Profile";

const ProfilePage = () => {
  return (
    <div>
      <Profile />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;

  const allowedRoles = ["USER", "ADMIN", "AUTHOR"];

  const middlewareResponse = await verifyAuth(
    async (req, res) => {
      return { props: {} };
    },
    allowedRoles
  )(req, res);

  if (middlewareResponse) {
    return middlewareResponse;
  }

  return { props: {} };
};

export default ProfilePage;