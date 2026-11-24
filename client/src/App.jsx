
import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5005/api';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  const [inquiries, setInquiries] = useState([]);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Staff login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      setError(err.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch inquiries from backend
  const fetchInquiries = async () => {
    setInquiryLoading(true);
    setInquiryError('');

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.append('search', search.trim());
      }

      if (status) {
        params.append('status', status);
      }

      const response = await fetch(
        `${API_URL}/inquiries?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load inquiries');
      }

      // Accept either an array or an object containing inquiries
      const records = Array.isArray(data)
        ? data
        : data.inquiries || data.results || [];

      setInquiries(records);
    } catch (err) {
      setInquiryError(err.message || 'Unable to load inquiries');
    } finally {
      setInquiryLoading(false);
    }
  };

  // Reload when login, search or status changes
  useEffect(() => {
    if (token) {
      fetchInquiries();
    }
  }, [token, search, status]);

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setInquiries([]);
    setSearch('');
    setStatus('');
    setError('');
  };

  // Dashboard
  if (user && token) {
    return (
      <div className="dashboard">
        <header className="topbar">
          <h2>Coffee Ninja</h2>

          <div className="user-info">
            <span>{user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <h1>Customer Inquiries</h1>
              <p>Manage and track customer inquiries.</p>
            </div>

            <button
              className="refresh-button"
              onClick={fetchInquiries}
              disabled={inquiryLoading}
            >
              {inquiryLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="filters">
            <input
              type="text"
              placeholder="Search customer or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {inquiryError && (
            <p className="error">{inquiryError}</p>
          )}

          {inquiryLoading ? (
            <p className="message">Loading inquiries...</p>
          ) : inquiries.length === 0 ? (
            <p className="message">No inquiries found.</p>
          ) : (
            <div className="inquiry-list">
              {inquiries.map((inquiry) => (
                <article className="inquiry-card" key={inquiry.id}>
                  <div className="inquiry-card-header">
                    <h3>{inquiry.subject}</h3>

                    <span
                      className={`status status-${inquiry.status
                        .toLowerCase()
                        .replace(' ', '-')}`}
                    >
                      {inquiry.status}
                    </span>
                  </div>

                  <p>
                    <strong>Customer:</strong> {inquiry.customer_name}
                  </p>

                  <p>
                    <strong>Contact:</strong> {inquiry.contact}
                  </p>

                  <p className="description">
                    {inquiry.description}
                  </p>

                  <small>Inquiry #{inquiry.id}</small>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Login screen
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
