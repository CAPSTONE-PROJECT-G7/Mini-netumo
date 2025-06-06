// ── File: frontend/src/context/AuthContext.jsx ───────────────────────────
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

axios.defaults.baseURL = baseURL;

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete axios.defaults.headers.common["Authorization"];
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    const { data } = await axios.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setLoading(false);
  };

  const register = async (email, password) => {
    setLoading(true);
    await axios.post("/auth/register", { email, password });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
