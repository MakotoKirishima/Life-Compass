import "../styles/globals.css";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ChatBot = dynamic(() => import("../components/ChatBot"), { ssr: false });
const CookieConsent = dynamic(() => import("../components/CookieConsent"), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export { API };

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      localStorage.setItem("token", urlToken);
      window.history.replaceState({}, "", window.location.pathname);
    }

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ id: payload.sub || payload.user_id, email: payload.email || "", display_name: payload.display_name || "", role: payload.role || "user", token });
      } catch { localStorage.removeItem("token"); }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser({ ...userData, token });
  };

  const logout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(`${API}/api/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      } catch {}
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Component {...pageProps} user={user} login={login} logout={logout} api={API} />
      {user && <ChatBot token={user.token} />}
      <CookieConsent />
    </>
  );
}

export default MyApp;
