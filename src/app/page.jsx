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
  FileText,
  Edit2,
  Trash2,
  X,
  UserPlus,
  Layers
} from 'lucide-react';

export default function HaciendaApp() {
  const { data: session, status: authStatus } = useSession();
  const [currentTab, setCurrentTab] = useState('dashboard'); 
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);

  const isAdmin = session?.user?.role?.toLowerCase() === 'admin';

  // --- STATE UNTUK MODAL ---
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  
  // --- STATE FORM DATA ---
  const [selectedAsset, setSelectedAsset] = useState({ id: '', name: '', categoryName: '', serial: '', price: '', status: 'Active' });
  const [selectedUser, setSelectedUser] = useState({ id: '', name: '', email: '', role: 'Operator', password: '' });

  // 1. Ambil Data Kategori & User untuk Admin
  const fetchAuxiliaryData = async () => {
    try {
      const resCat = await fetch('/api/categories');
      if (resCat.ok) {
        const dataCat = await resCat.json();
        setCategories(dataCat.map(c => c.name || c));
      } else {
        setCategories(["Elektronik", "Furnitur", "Kendaraan"]);
      }

      if (isAdmin) {
        setUserLoading(true);
        const resUser = await fetch('/api/users');
        if (resUser.ok) {
          const dataUser = await resUser.json();
          setUsers(dataUser);
        }
        setUserLoading(false);
      }
    } catch (err) {
      console.error("Gagal mengambil data auxiliary:", err);
    }
  };

  // 2. Ambil Data Aset (Read) dari Postgres
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
      fetchAuxiliaryData();
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

  // --- ASSET DATABASE MUTATIONS (CRUD) ---
  const handleOpenAssetModal = (mode, asset = null) => {
    setModalMode(mode);
    if (mode === 'edit' && asset) {
      setSelectedAsset(asset);
    } else {
      setSelectedAsset({ id: '', name: '', categoryName: categories[0] || 'Elektronik', serial: '', price: '', status: 'Active' });
    }
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    try {
      const isCreate = modalMode === 'create';
      const url = isCreate ? '/api/assets' : `/api/assets/${selectedAsset.id}`;
      const method = isCreate ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedAsset)
      });

      if (res.ok) {
        setIsAssetModalOpen(false);
        fetchAssetsData(); // Refresh data langsung dari PostgreSQL
      } else {
        alert("Gagal menyimpan data ke database. Periksa API Route Anda.");
      }
    } catch (err) {
      console.error("Error saving asset:", err);
    }
  };

  const handleDeleteAsset = async (id, e) => {
    e.stopPropagation();
    if (confirm("Apakah Anda yakin ingin menghapus aset ini dari database?")) {
      try {
        const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchAssetsData();
        } else {
          alert("Gagal menghapus data dari database.");
        }
      } catch (err) {
        console.error("Error deleting asset:", err);
      }
    }
  };

  // --- USER DATABASE MUTATIONS (CRUD) ---
  const handleOpenUserModal = (mode, user = null) => {
    setModalMode(mode);
    if (mode === 'edit' && user) {
      setSelectedUser({ ...user, password: '' });
    } else {
      setSelectedUser({ id: '', name: '', email: '', role: 'Operator', password: '' });
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const isCreate = modalMode === 'create';
      const url = isCreate ? '/api/users' : `/api/users/${selectedUser.id}`;
      const method = isCreate ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedUser)
      });

      if (res.ok) {
        setIsUserModalOpen(false);
        fetchAuxiliaryData(); // Refresh list user
      } else {
        alert("Gagal menyimpan data pengguna.");
      }
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (confirm("Hapus pengguna ini secara permanen dari database?")) {
      try {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchAuxiliaryData();
        }
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  // Kalkulasi statistik data riil database
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'Active' || a.status === 'Aktif').length;
  const maintenanceAssets = assets.filter(a => a.status === 'Maintenance').length;
  const totalValue = assets.reduce((acc, item) => acc + parseFloat(item.price || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between fixed h-full z-20 shadow-sm">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-200 space-x-3 bg-slate-50">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-slate-900 leading-none tracking-tight">Hacienda Asset</h1>
              <span className="text-[10px] text-blue-600 font-bold font-mono tracking-wider uppercase mt-1 block">Enterprise v14</span>
            </div>
          </div>

          <div className="p-4 mx-3 my-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-blue-600 uppercase">
                {session?.user?.name ? session.user.name.substring(0,2) : 'US'}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{session?.user?.name || "User Hacienda"}</p>
              <p className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-wide mt-0.5">
                {session?.user?.role || "Operator"}
              </p>
            </div>
          </div>

          <nav className="px-3 space-y-1">
            <button onClick={() => setCurrentTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${currentTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard Overview</span>
            </button>
            <button onClick={() => setCurrentTab('assets')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${currentTab === 'assets' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Box className="h-4 w-4" />
              <span>Daftar Aset Korporat</span>
            </button>
            <button onClick={() => setCurrentTab('audits')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${currentTab === 'audits' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
              <ClipboardCheck className="h-4 w-4" />
              <span>Log Audit Fisik</span>
            </button>
            <button onClick={() => setCurrentTab('maintenance')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${currentTab === 'maintenance' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Wrench className="h-4 w-4" />
              <span>Jadwal Maintenance</span>
            </button>

            {isAdmin && (
              <div className="pt-4 mt-4 border-t border-slate-200">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Menu Kontrol Admin</p>
                <button onClick={() => setCurrentTab('master-data')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${currentTab === 'master-data' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Master Data & Users</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button onClick={() => signOut()} className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 hover:text-white transition">
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">Halaman</span>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">{currentTab}</span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          
          {/* TAB 1: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Riwayat Aset</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono">{loading ? '...' : totalAssets}</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kondisi Aktif</p>
                  <h3 className="text-2xl font-black text-emerald-600 mt-2 font-mono">{loading ? '...' : activeAssets}</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dalam Perbaikan</p>
                  <h3 className="text-2xl font-black text-amber-600 mt-2 font-mono">{loading ? '...' : maintenanceAssets}</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kapitalisasi Nilai</p>
                  <h3 className="text-lg font-black text-slate-900 mt-2 font-mono">Rp {loading ? '...' : totalValue.toLocaleString('id-ID')}</h3>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAFTAR ASET KORPORAT */}
          {currentTab === 'assets' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Asset Audit QR Code & Text Search</h2>
                  <p className="text-xs text-slate-500 mt-1">Gunakan fungsionalitas di bawah untuk berinteraksi langsung dengan database PostgreSQL.</p>
                </div>
                <button onClick={() => handleOpenAssetModal('create')} className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center transition">
                  <Plus className="mr-1.5 h-4 w-4" /> Tambah Aset Baru
                </button>
              </div>

              {/* SEARCH BAR */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama aset, ID, atau S/N..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                </div>
              </div>

              {/* TABLE DATA */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-6">ID Aset</th>
                      <th className="py-3.5 px-4">Nama Perangkat</th>
                      <th className="py-3.5 px-4">Kategori</th>
                      <th className="py-3.5 px-4">Serial Number</th>
                      <th className="py-3.5 px-4 text-right">Nilai Perolehan</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-6 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400">Menyinkronkan data Neon Postgres...</td>
                      </tr>
                    ) : assets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400">Tidak ada data aset ditemukan.</td>
                      </tr>
                    ) : (
                      assets.map((asset) => (
                        <tr key={asset.id} onClick={() => handleOpenAssetModal('edit', asset)} className="hover:bg-slate-50 cursor-pointer transition">
                          <td className="py-3.5 px-6 font-mono font-bold text-blue-600">{asset.id}</td>
                          <td className="py-3.5 px-4 text-slate-900 font-semibold">{asset.name}</td>
                          <td className="py-3.5 px-4">{asset.categoryName || asset.category?.name}</td>
                          <td className="py-3.5 px-4 font-mono">{asset.serial}</td>
                          <td className="py-3.5 px-4 text-right font-mono">Rp {parseFloat(asset.price || 0).toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${asset.status === 'Active' || asset.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{asset.status}</span>
                          </td>
                          <td className="py-3.5 px-6 text-center flex items-center justify-center space-x-2">
                            <button className="p-1.5 bg-slate-50 hover:bg-blue-50 text-blue-600 border rounded-lg" title="Cetak QR" onClick={(e) => { e.stopPropagation(); alert(`Cetak QR untuk ${asset.id}`); }}>
                              <QrCode className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition" title="Hapus Aset" onClick={(e) => handleDeleteAsset(asset.id, e)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MASTER DATA & USERS MANAGEMENT */}
          {currentTab === 'master-data' && (
            <div className="space-y-8">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Manajemen Akses Pengguna</h3>
                    <p className="text-xs text-slate-500">Kredensial disimpan langsung ke tabel internal database relasional.</p>
                  </div>
                  <button onClick={() => handleOpenUserModal('create')} className="py-1.5 px-3 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center shadow-sm">
                    <UserPlus className="mr-1 h-3.5 w-3.5" /> Tambah User
                  </button>
                </div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-400">
                      <th className="p-3">Nama</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Hak Akses / Role</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userLoading ? (
                      <tr><td colSpan="4" className="p-4 text-center text-slate-400">Memuat berkas pengguna...</td></tr>
                    ) : users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{u.name}</td>
                        <td className="p-3 font-mono text-slate-500">{u.email}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'Admin' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span></td>
                        <td className="p-3 text-center space-x-2">
                          <button onClick={() => handleOpenUserModal('edit', u)} className="text-blue-600 hover:underline"><Edit2 className="h-3.5 w-3.5 inline" /></button>
                          <button onClick={() => handleDeleteUser(u.id)} className="text-rose-600 hover:underline"><Trash2 className="h-3.5 w-3.5 inline" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-2">Master Kategori Infrastruktur</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 border rounded-xl text-xs flex items-center space-x-2">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">{cat}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4 & 5 PLACEHOLDER INTEGRATED LOGS */}
          {currentTab === 'audits' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-2">Log Audit Fisik Lapangan</h3>
              <p className="text-xs text-slate-500">Menampilkan riwayat verifikasi aset fisik real-time.</p>
            </div>
          )}

          {currentTab === 'maintenance' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-2">Penjadwalan Perawatan Preventif</h3>
              <p className="text-xs text-slate-500">Modul kalibrasi perangkat keras.</p>
            </div>
          )}
        </main>
      </div>

      {/* --- MODAL DIALOG ASSET --- */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{modalMode === 'create' ? 'Tambah Komponen Aset' : 'Ubah Detail Aset'}</h3>
              <button onClick={() => setIsAssetModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
              {modalMode === 'edit' && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">ID Aset (Read Only)</label>
                  <input type="text" disabled value={selectedAsset.id} className="w-full p-2.5 bg-slate-100 border rounded-xl font-mono" />
                </div>
              )}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Perangkat</label>
                <input type="text" required value={selectedAsset.name} onChange={e => setSelectedAsset({...selectedAsset, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl" placeholder="e.g. ThinkPad X1 Carbon" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kategori</label>
                  <select value={selectedAsset.categoryName} onChange={e => setSelectedAsset({...selectedAsset, categoryName: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl">
                    {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select value={selectedAsset.status} onChange={e => setSelectedAsset({...selectedAsset, status: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl">
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Serial Number</label>
                <input type="text" required value={selectedAsset.serial} onChange={e => setSelectedAsset({...selectedAsset, serial: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono" placeholder="SN-XXXXXX" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nilai Perolehan (Harga Rp)</label>
                <input type="number" required value={selectedAsset.price} onChange={e => setSelectedAsset({...selectedAsset, price: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono" placeholder="Masukkan angka saja" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md transition mt-2">
                {modalMode === 'create' ? 'Tambah ke Database' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DIALOG USER --- */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{modalMode === 'create' ? 'Daftarkan Pengguna Baru' : 'Ubah Akses Pengguna'}</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Lengkap</label>
                <input type="text" required value={selectedUser.name} onChange={e => setSelectedUser({...selectedUser, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Alamat Email</label>
                <input type="email" required value={selectedUser.email} onChange={e => setSelectedUser({...selectedUser, email: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Kata Sandi {modalMode === 'edit' && '(Kosongkan jika tidak diubah)'}</label>
                <input type="password" required={modalMode === 'create'} value={selectedUser.password} onChange={e => setSelectedUser({...selectedUser, password: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Peran Sistem / Role</label>
                <select value={selectedUser.role} onChange={e => setSelectedUser({...selectedUser, role: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl">
                  <option value="Admin">Admin</option>
                  <option value="Operator">Operator</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold transition">Simpan Kredensial User</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}