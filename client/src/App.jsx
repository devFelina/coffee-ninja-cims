
import { useState } from 'react';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5005/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);

    } catch (err) {
      setError(err.message || 'Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  // Display dashboard placeholder after successful login
  if (user && token) {
    return (
      <div className="dashboard">
        <header className="topbar">
          <h2>Coffee Ninja</h2>
          <button onClick={handleLogout}>Logout</button>
        </header>

        <main className="welcome">
          <h1>Welcome, {user.name}!</h1>
          <p>You are successfully logged in.</p>
          <p>Email: {user.email}</p>
          <p>Staff ID: {user.id}</p>
          <p className="success">Authentication successful!</p>
        </main>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand">
          <span className="coffee-icon">☕</span>
          <h1>Coffee Ninja</h1>
          <p>Customer Inquiry Management System</p>
        </div>

        <div className="login-heading">
          <h2>Staff Login</h2>
          <p>Sign in to manage customer inquiries.</p>
        </div>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="footer-text">Coffee Ninja Staff Portal</p>
      </div>
    </div>
  );
}

export default App;
