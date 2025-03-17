// File: /pages/forgot-password.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Email has been sent with password reset instructions");
        setEmail(""); // Clear the form
      } else {
        setError(data.message || "Failed to process request");
      }
    } catch (err) {
      setError("Something went wrong, please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password</title>
      </Head>
      <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 animate-gradient-x">
        <div className="absolute inset-0 bg-cover bg-center bg-opacity-30 bg-blur-sm" style={{ backgroundImage: 'url("/images/gold-texture.jpg")' }}></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 bg-white dark:bg-gray-800 bg-opacity-50 backdrop-blur-lg p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 mb-4">
            Forgot Password
          </h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
              <p>{success}</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full p-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white rounded hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 transition duration-200"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
          <p className="text-sm text-white text-center mt-4">
            <Link href="/auth/login" className="text-blue-500 hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;