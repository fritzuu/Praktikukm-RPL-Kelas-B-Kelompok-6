import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function AdminDashboard() {
  const { auth } = usePage().props;
  const user = auth?.user;
  
  // State for sidebar, tabs and inputs
  const [activeTab, setActiveTab] = useState('Assistant');
  const [assistantInput, setAssistantInput] = useState('');

  function handleLogout() {
      router.post(route('logout'));
  }

  return (
    <div className="bg-[#fcfcfc] w-full min-h-screen flex flex-col font-['Inter']">
      {/* Top Navbar */}
      <div className="bg-[#0f172a] h-[72px] shrink-0 border-b border-[#212f4d] flex items-center px-6 justify-between text-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#1e293b] rounded-xl flex items-center justify-center border border-[#334155]">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div className="text-xl font-bold tracking-tight">SARS<span className="text-blue-400">.</span></div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="text-right hidden md:block">
                <div className="text-sm font-semibold">{user?.name || 'Admin'}</div>
                <div className="text-xs text-gray-400">Admin Fakultas</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg border-2 border-white/10">
                {user?.name?.charAt(0) || 'A'}
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between py-6 shrink-0 hidden md:flex">
          <div className="flex flex-col px-4 gap-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-3">Menu</div>
            
            <button className="flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Jadwal
            </button>
            
            <button className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Master Data
            </button>

            <button className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Pengguna
            </button>
          </div>

          <div className="px-4">
             <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl font-medium transition-colors"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar
             </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto">
          {/* Header */}
          <div className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen Jadwal</h1>
                <p className="text-gray-500 mt-1">Kelola dan atur jadwal perkuliahan semester ganjil 2024/2025.</p>
              </div>
              <div className="flex items-center gap-3">
                 <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export PDF
                 </button>
                 <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Buat Jadwal Baru
                 </button>
              </div>
            </div>
            
            {/* Filters/Tabs */}
            <div className="flex items-center gap-6 mt-8 border-b border-gray-200">
               <button className="pb-3 border-b-2 border-blue-600 text-blue-600 font-semibold px-1">Semua Jadwal</button>
               <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium px-1 transition-colors">Menunggu Persetujuan <span className="bg-orange-100 text-orange-600 text-xs py-0.5 px-2 rounded-full ml-1 font-bold">3</span></button>
               <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium px-1 transition-colors">Bentrok <span className="bg-red-100 text-red-600 text-xs py-0.5 px-2 rounded-full ml-1 font-bold">1</span></button>
            </div>
          </div>

          {/* Table Content */}
          <div className="px-8 pb-8 flex-1">
             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                   <div className="relative w-64">
                      <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      <input 
                        type="text" 
                        placeholder="Cari mata kuliah atau dosen..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                   </div>
                   <div className="flex gap-2">
                      <select className="border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2 bg-white outline-none">
                         <option>Semua Hari</option>
                         <option>Senin</option>
                         <option>Selasa</option>
                         <option>Rabu</option>
                      </select>
                      <select className="border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2 bg-white outline-none">
                         <option>Semua Ruang</option>
                         <option>Lantai 1</option>
                         <option>Lantai 2</option>
                      </select>
                   </div>
                </div>
                
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                         <th className="px-6 py-4 font-semibold w-12">No</th>
                         <th className="px-6 py-4 font-semibold">Mata Kuliah</th>
                         <th className="px-6 py-4 font-semibold">Dosen</th>
                         <th className="px-6 py-4 font-semibold">Waktu & Ruang</th>
                         <th className="px-6 py-4 font-semibold">Status</th>
                         <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                      </tr>
                   </thead>
                   <tbody className="text-sm divide-y divide-gray-100">
                      {/* Row 1 */}
                      <tr className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 text-gray-500">1</td>
                         <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">Pemrograman Web</div>
                            <div className="text-gray-500 text-xs mt-0.5">IF301 • Kelas A</div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">A</div>
                               <span className="font-medium text-gray-700">Ahmad Faisal, M.Kom</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">Senin, 08:00 - 10:30</div>
                            <div className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                               </svg>
                               Lab Komputer 1
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                               Disetujui
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button>
                         </td>
                      </tr>
                      
                      {/* Row 2 */}
                      <tr className="hover:bg-gray-50 transition-colors bg-red-50/30">
                         <td className="px-6 py-4 text-gray-500">2</td>
                         <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">Struktur Data</div>
                            <div className="text-gray-500 text-xs mt-0.5">IF204 • Kelas B</div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">S</div>
                               <span className="font-medium text-gray-700">Siti Nurhaliza, M.T.</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="font-medium text-red-600 flex items-center gap-1.5">
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                               </svg>
                               Selasa, 10:00 - 12:30
                            </div>
                            <div className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                               </svg>
                               Ruang Teori 4 <span className="text-red-500 font-medium">(Bentrok)</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-semibold border border-red-100">
                               <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                               Bentrok Ruangan
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Selesaikan</button>
                         </td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Right Assistant Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 relative shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
             </div>
             <div>
                <h2 className="font-bold text-gray-900 text-lg">AI Assistant</h2>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                   <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                   </span>
                   Online
                </div>
             </div>
          </div>
          
          {/* Tabs */}
          <div className="flex p-3 bg-gray-50/80 border-b border-gray-100 gap-2">
             <button 
                onClick={() => setActiveTab('Assistant')}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'Assistant' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
             >
                Chat
             </button>
             <button 
                onClick={() => setActiveTab('Logs')}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'Logs' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
             >
                Aktivitas
             </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
             {/* AI Message */}
             <div className="flex flex-col gap-1 items-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm text-sm max-w-[90%] shadow-sm">
                   Halo! Ada yang bisa saya bantu terkait penyusunan jadwal hari ini?
                </div>
                <span className="text-[10px] text-gray-400 ml-1">09:41</span>
             </div>

             {/* User Message */}
             <div className="flex flex-col gap-1 items-end">
                <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm max-w-[90%] shadow-sm">
                   Tolong carikan jadwal kosong untuk mata kuliah Basis Data Kelas C. Dosennya Pak Budi.
                </div>
                <span className="text-[10px] text-gray-400 mr-1">09:42</span>
             </div>

             {/* AI Message */}
             <div className="flex flex-col gap-1 items-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm text-sm max-w-[90%] shadow-sm">
                   <p className="mb-2">Tentu. Berikut adalah slot kosong untuk Pak Budi (Basis Data - 3 SKS):</p>
                   <ul className="list-disc pl-4 space-y-1 mb-3">
                      <li>Rabu, 08:00 - 10:30 (Lab Komputer 2)</li>
                      <li>Jumat, 13:00 - 15:30 (Ruang Teori 1)</li>
                   </ul>
                   <button className="bg-white border border-gray-200 text-blue-600 px-3 py-1.5 rounded-lg font-medium w-full hover:bg-blue-50 transition-colors">
                      Tetapkan Jadwal
                   </button>
                </div>
                <span className="text-[10px] text-gray-400 ml-1">09:42</span>
             </div>
             
             {/* Suggestions */}
             <div className="mt-2 flex flex-wrap gap-2">
                <button className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium border border-blue-100 hover:bg-blue-100 transition-colors">
                   Cek bentrok jadwal
                </button>
                <button className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium border border-blue-100 hover:bg-blue-100 transition-colors">
                   Rekap beban mengajar
                </button>
             </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
             <div className="relative flex items-center">
                <input 
                   type="text" 
                   value={assistantInput}
                   onChange={(e) => setAssistantInput(e.target.value)}
                   placeholder="Tanya asisten AI..." 
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button className={`absolute right-2 p-2 rounded-lg transition-colors ${assistantInput.trim() ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-400 hover:text-blue-600'}`}>
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                   </svg>
                </button>
             </div>
             <div className="text-center mt-3">
                <span className="text-[10px] text-gray-400 font-medium">SARS Assistant AI • Powered by Gemini</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
