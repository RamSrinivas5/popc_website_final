import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('popc_token'));
  const [doctorId, setDoctorId] = useState(() => localStorage.getItem('popc_doctor_id'));
  const [username, setUsername] = useState(() => localStorage.getItem('popc_username'));

  const isLoggedIn = Boolean(token);

  function login(data) {
    localStorage.setItem('popc_token', data.token);
    localStorage.setItem('popc_doctor_id', data.doctor_id);
    localStorage.setItem('popc_username', data.username || '');
    setToken(data.token);
    setDoctorId(data.doctor_id);
    setUsername(data.username || '');
  }

  function logout() {
    localStorage.removeItem('popc_token');
    localStorage.removeItem('popc_doctor_id');
    localStorage.removeItem('popc_username');
    setToken(null);
    setDoctorId(null);
    setUsername(null);
  }

  return (
    <AuthContext.Provider value={{ token, doctorId, username, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
