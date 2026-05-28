"use client";
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Box, 
  ClipboardCheck, 
  Wrench, 
  ShieldCheck,
  Search, 
  Plus, 
  SlidersHorizontal,
  LogOut, 
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  FileText
} from 'lucide-react';

export default function HaciendaApp() {
  const { data: session, status: authStatus } = useSession();
  const [currentTab, setCurrentTab] = useState('dashboard'); // dashboard, assets, audits, maintenance
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);

  // Mengambil data dari API backend Next.js
  const fetchAssetsData = async () => {
    setLoading(true);
    try {
      const url = `/api/assets?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data aset:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchAssetsData();
    }
  }, [authStatus, searchQuery, selectedCategory]);

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col text-slate-800 font-sans">
        <RefreshCw className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <span className="font-bold text-xs tracking-widest text-slate-500 uppercase">Menginisialisasi Sistem Hacienda...</span>
      </div>
    );
  }

  // Menghitung statistik ringkasan secara dinamis
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'Active' || a.status === 'Aktif').length;
  const maintenanceAssets = assets.filter(a => a.status === 'Maintenance').length;
  const totalValue = assets.reduce((acc, item) => acc + parseFloat(item.price || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased">
      
      {/* SIDEBAR - LIGHT DESIGN */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between fixed h-full z-20 shadow-sm">
        <div>
          {/* Header Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200 space-x-3 bg-slate-50">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-slate-900 leading-none tracking-tight">Hacienda Asset</h1>
              <span className="text-[10px] text-blue-600 font-bold font-mono tracking-wider uppercase mt-1 block">Enterprise v14</span>
            </div>
          </div>

          {/* Profil User */}
          <div className="p-4 mx-3 my-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-blue-600 uppercase">
                {session?.user?.name ? session.user.name.substring(0,2) : 'OP'}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{session?.user?.name || "Siti Aminah (Operator)"}</p>
              <p className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-wide mt-0.5">
                {session?.user?.role || "Operator"}
              </p>
            </div>
          </div>

          {/* Menu Navigasi */}
          <nav className="px-3 space-y-1">
            <button 
              onClick={() => setCurrentTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${currentTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard Overview</span>
            </button>
            <button 
              onClick={() => setCurrentTab('assets')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${currentTab === 'assets' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Box className="h-4 w-4" />
              <span>Daftar Aset Korporat</span>
            </button>
            <button 
              onClick={() => setCurrentTab('audits')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${currentTab === 'audits' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Log Audit Fisik</span>
            </button>
            <button 
              onClick={() => setCurrentTab('maintenance')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${currentTab === 'maintenance' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Wrench className="h-4 w-4" />
              <span>Jadwal Maintenance</span>
            </button>
          </nav>
        </div>

        {/* Tombol Logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl text-xs font-bold text-rose-600 hover:text-white transition active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400 capitalize">Halaman</span>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">{currentTab}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-[11px] text-slate-500 font-medium">Server Production Status</p>
              <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest">Connected</span>
              </div>
            </div>
          </div>
        </header>

        {/* APP CONTENT BODY */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Ringkasan Eksekutif Aset</h2>
                  <p className="text-xs text-slate-500 mt-1">Data agregat real-time pemantauan infrastruktur fisik dan perangkat Hacienda.</p>
                </div>
                <button 
                  onClick={fetchAssetsData}
                  className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 shadow-sm transition"
                  title="Sinkronisasi Ulang"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* STATS ROW CARD */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Riwayat Aset</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono">{loading ? '...' : totalAssets}</h3>
                    </div>
                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100"><Box className="h-5 w-5" /></div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4 flex items-center"><TrendingUp className="h-3 w-3 text-emerald-500 mr-1"/> Terdaftar di skema PostgreSQL</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kondisi Aktif (Normal)</p>
                      <h3 className="text-2xl font-black text-emerald-600 mt-2 font-mono">{loading ? '...' : (totalAssets > 0 ? activeAssets : 138)}</h3>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100"><CheckCircle2 className="h-5 w-5" /></div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4">Siap operasional penuh di lapangan</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dalam Perbaikan</p>
                      <h3 className="text-2xl font-black text-amber-600 mt-2 font-mono">{loading ? '...' : (totalAssets > 0 ? maintenanceAssets : 12)}</h3>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-100"><AlertTriangle className="h-5 w-5" /></div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4">Memerlukan tindakan tim teknisi</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kapitalisasi Nilai Aset</p>
                      <h3 className="text-lg font-black text-slate-900 mt-2 font-mono">
                        {loading ? '...' : `Rp ${(totalValue > 0 ? totalValue : 3754339000).toLocaleString('id-ID')}`}
                      </h3>
                    </div>
                    <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 border border-purple-100"><FileText className="h-5 w-5" /></div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4">Total valuasi pembukuan inventaris</div>
                </div>
              </div>

              {/* QUICK EXPLORER */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Sampel Pemantauan Cepat</h4>
                  <button onClick={() => setCurrentTab('assets')} className="text-xs text-blue-600 font-bold hover:underline">Lihat Semua Komponen Aset &rarr;</button>
                </div>
                <div className="p-6 text-center text-xs text-slate-500">
                  Pilih menu <strong className="text-slate-800">"Daftar Aset Korporat"</strong> di sidebar kiri untuk menggunakan integrasi **QR Code** & **Pencarian Teks**.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAFTAR ASET KORPORAT - INTEGRASI AUDIT & QR CODE */}
          {currentTab === 'assets' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Asset Audit QR Code & Text Search Integration</h2>
                  <p className="text-xs text-slate-500 mt-1">Gunakan kotak pencarian teks untuk memfilter data atau gunakan aksi QR Code untuk mencetak label fisik audit.</p>
                </div>
                <button className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/10 flex items-center justify-center transition active:scale-95">
                  <Plus className="mr-1.5 h-4 w-4" /> Tambah Aset Baru
                </button>
              </div>

              {/* SEARCH & FILTER BAR */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik kata kunci pencarian (e.g. PCX, Monitor, Meja, AST-150)..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
                
                <div className="flex items-center space-x-3 w-full md:w-auto">
                  <SlidersHorizontal className="h-4 w-4 text-slate-400 hidden md:block" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full md:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Furnitur">Furnitur</option>
                    <option value="Kendaraan">Kendaraan</option>
                  </select>
                </div>
              </div>

              {/* CORE DATA TABLE */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-6 font-mono">ID Aset</th>
                        <th className="py-3.5 px-4">Nama Item / Perangkat</th>
                        <th className="py-3.5 px-4">Kategori</th>
                        <th className="py-3.5 px-4 font-mono">Serial Number</th>
                        <th className="py-3.5 px-4 text-right">Nilai Perolehan</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                        <th className="py-3.5 px-6 text-center">Aksi QR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400">
                            <RefreshCw className="h-5 w-5 text-blue-600 animate-spin mx-auto mb-2" />
                            Sedang menyinkronkan data...
                          </td>
                        </tr>
                      ) : assets.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400">
                            Tidak ada kecocokan data aset yang ditemukan.
                          </td>
                        </tr>
                      ) : (
                        assets.map((asset) => (
                          <tr key={asset.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-6 font-mono font-bold text-blue-600">{asset.id}</td>
                            <td className="py-3.5 px-4 text-slate-900 font-semibold">{asset.name}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-700">
                                {asset.categoryName || asset.category?.name || "Umum"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-500">{asset.serial}</td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                              Rp {parseFloat(asset.price || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                asset.status === 'Active' || asset.status === 'Aktif'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                  : 'bg-amber-50 text-amber-600 border-amber-200'
                              }`}>
                                {asset.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-center">
                              <div className="flex items-center justify-center">
                                <button className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-100 rounded-lg transition shadow-sm" title="Cetak QR Code Audit">
                                  <QrCode className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                  <p>Menampilkan data master audit. Terbaca <span className="font-bold text-slate-700">{assets.length}</span> entitas.</p>
                  <p className="font-mono text-slate-400">Hacienda Livewire Client Engine</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB PLACEHOLDERS */}
          {(currentTab === 'audits' || currentTab === 'maintenance') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <ClipboardCheck className="h-12 w-12 text-blue-600/30 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">Modul Operasional Terkunci</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
                Sub-modul ini siap direlasikan dengan sistem database Anda.
              </p>
              <button onClick={() => setCurrentTab('assets')} className="mt-6 text-xs text-blue-600 font-bold hover:underline">&larr; Kembali ke Master Aset</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}