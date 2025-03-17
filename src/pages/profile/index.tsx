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

export default ProfilePage;