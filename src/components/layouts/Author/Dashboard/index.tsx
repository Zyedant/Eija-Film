import React from "react";

const AuthorDashboard = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-800">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-gray-800 dark:text-white">
          Welcome back, Author!
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          You're doing great! Ready to manage your content and share your awesome work?
        </p>
      </div>
    </div>
  );
};

export default AuthorDashboard;
