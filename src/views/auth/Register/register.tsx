import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/auth/login');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Something went wrong, please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 animate-gradient-x">
      <div className="absolute inset-0 bg-cover bg-center bg-opacity-30 bg-blur-sm" style={{ backgroundImage: 'url("/images/gold-texture.jpg")' }}></div>
      
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative z-10 bg-white dark:bg-gray-800 bg-opacity-50 backdrop-blur-lg p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 mb-4">
          Register
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white rounded hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 transition duration-200"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <a href="./login" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
