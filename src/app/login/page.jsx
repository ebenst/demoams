"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Box, Lock, RefreshCw } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (res?.error) {
        setError("Kredensial atau sandi akun tidak valid.");
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem, silakan coba kembali.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] py-12 px-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-3xl opacity-40" />

      <div className="max-w-md w-full space-y-6 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative z-10">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
            <Box className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">
            Asset Management
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 font-medium">
            Sistem Autentikasi Pengawasan Aset Hacienda
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Kantor</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl bg-slate-850 border border-slate-800 w-full px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs transition" 
                placeholder="email@perusahaan.com" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kata Sandi</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl bg-slate-850 border border-slate-800 w-full px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs transition" 
                placeholder="Masukkan kata sandi..." 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                Mengecek Kredensial...
              </>
            ) : "Masuk Sekarang"}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            Hacienda Enterprise Asset Security &bull; 2026
          </p>
        </div>
      </div>
    </div>
  );
}