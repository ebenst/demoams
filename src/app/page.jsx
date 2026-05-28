"use client";
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from "next-auth/react";
import { 
  Home, LayoutDashboard, Tag, Wrench, LogOut, Box, ChevronLeft, ChevronRight, RefreshCw, ClipboardCheck
} from 'lucide-react';

export default function HaciendaApp() {
  const { data: session, status: authStatus } = useSession();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchProductionData();
    }
  }, [authStatus]);

  const fetchProductionData = async () => {
    setLoading(true);
    try {
      const resAssets = await fetch('/api/assets');
      setAssets(await resAssets.json());
    } catch (err) {
      console.error("Gagal sinkronisasi:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col text-slate-100">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <span className="font-bold text-sm tracking-wider">MEMUAT SISTEM KREDENSIAL HACIENDA...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-900 flex p-8">
      <div>
        <h1 className="text-xl font-bold">Layanan Produksi Hacienda Aktif</h1>
        <p className="text-xs text-slate-400 mt-1">Sesi Aktif: {session?.user?.email}</p>
        <button onClick={() => signOut()} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">Logout</button>
      </div>
    </div>
  );
}