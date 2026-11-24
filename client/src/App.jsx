import { useState } from 'react';
import './App.css';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { loginStaff } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  const handleLogin = async (email, password) => {
    const data = await loginStaff(email, password);

    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
  };

  if (user && token) {
    return (
      <Dashboard
        user={user}
        token={token}
        onLogout={handleLogout}
      />
    );
  }

  return <Login onLogin={handleLogin} />;
}

export default App;
