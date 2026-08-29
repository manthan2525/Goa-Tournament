import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <AdminSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-slate-900 font-display">Admin Panel</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
