import { useState, useEffect } from "react";
import Head from "next/head";
import Button from "../components/ui/Button";

export default function Login({ login, api, user }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) errors.email = "Email wajib diisi";
    else if (!emailRe.test(email)) errors.email = "Format email tidak valid";
    if (!password) errors.password = "Password wajib diisi";
    else if (password.length < 6) errors.password = "Password minimal 6 karakter";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const [googleStatus, setGoogleStatus] = useState<{ configured: boolean; missing: string[] } | null>(null);

  useEffect(() => {
    fetch(`${api}/api/auth/google/status`)
      .then((r) => r.json())
      .then(setGoogleStatus)
      .catch(() => setGoogleStatus({ configured: false, missing: ["GOOGLE_CLIENT_ID"] }));
  }, []);

  if (user && typeof window !== "undefined") {
    window.location.href = "/dashboard";
    return null;
  }

  const handleGoogleLogin = () => {
    if (!googleStatus?.configured) return;
    window.location.href = `${api}/api/auth/google/login`;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError("");

    try {
      const r = await fetch(`${api}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (r.ok) {
        login(data.access_token, {
          id: data.user_id,
          email: data.email,
          display_name: data.display_name,
        });
        window.location.href = "/dashboard";
        return;
      }

      if (r.status === 401) {
        const r2 = await fetch(`${api}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, display_name: email.split("@")[0] }),
        });
        const d2 = await r2.json();
        if (r2.ok) {
          login(d2.access_token, {
            id: d2.user_id,
            email: d2.email,
            display_name: d2.display_name,
          });
          window.location.href = "/dashboard";
          return;
        }
        throw new Error(d2.detail || "Registrasi gagal");
      }
      throw new Error(data.detail || "Login gagal");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Masuk — Life Compass</title>
        <meta name="description" content="Masuk atau daftar gratis untuk memulai perjalanan karirmu." />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <a href="/" className="text-blue-600 text-sm mb-6 inline-flex items-center gap-1 hover:underline">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </a>

        <div className="bg-white p-8 rounded-2xl shadow-lg border">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Masuk</h1>
            <p className="text-gray-500">Lanjutkan perjalanan karirmu</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading || !googleStatus?.configured}
            className={`w-full border-2 py-3 rounded-xl flex items-center justify-center gap-3 transition mb-6 font-medium text-sm ${
              googleStatus?.configured
                ? "border-gray-200 hover:bg-gray-50 text-gray-700"
                : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleStatus?.configured
              ? "Lanjutkan dengan Google"
              : "Login Google belum dikonfigurasi"}
          </button>

          {!googleStatus?.configured && (
            <p className="text-xs text-amber-600 text-center -mt-4 mb-6">
              Gunakan email untuk sementara.
            </p>
          )}

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-gray-400 text-sm">atau</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
                placeholder="nama@email.com"
                className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${fieldErrors.email ? "border-red-300" : ""}`}
              />
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                placeholder="Minimal 6 karakter"
                className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${fieldErrors.password ? "border-red-300" : ""}`}
              />
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
            </div>
            <Button type="submit" loading={loading} disabled={!email || !password} className="w-full" size="lg">
              Masuk / Daftar
            </Button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            Dengan masuk, kamu menyetujui{" "}
            <a href="/terms" className="text-blue-600 hover:underline">Syarat Ketentuan</a>{" "}
            dan{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">Kebijakan Privasi</a>.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
