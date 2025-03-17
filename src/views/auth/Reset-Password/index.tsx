// File: /pages/reset-password.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [validating, setValidating] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get token from URL query parameters
    if (router.isReady) {
      const { token } = router.query;
      if (token && typeof token === "string") {
        setToken(token);
        setTokenValid(true);
        setValidating(false);
      } else {
        setError("Invalid or missing reset token");
        setValidating(false);
        setTokenValid(false);
      }
    }
  }, [router.isReady, router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password has been reset successfully");
        setPassword("");
        setConfirmPassword("");
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Something went wrong, please try again later");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600">
        <p className="text-white">Validating reset token...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Invalid Reset Link</h2>
          <p className="mb-4">The password reset link is invalid or has expired.</p>
          <Link
            href="/auth/forgot-password"
            className="block text-center w-full p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-200"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Reset Password</title>
      </Head>
      <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 animate-gradient-x">
        <div className="absolute inset-0 bg-cover bg-center bg-opacity-30 bg-blur-sm" style={{ backgroundImage: 'url("/images/gold-texture.jpg")' }}></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 bg-white dark:bg-gray-800 bg-opacity-50 backdrop-blur-lg p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 mb-4">
            Reset Password
          </h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
              <p>{success}</p>
              <p className="text-sm mt-2">Redirecting to login page...</p>
            </div>
          )}
          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full p-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white rounded hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 transition duration-200"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;