'use client';

import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Zap, 
  LogOut,
  Menu,
  X,
  Terminal
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/app' },
    { label: 'Clientes', icon: <Users className="w-5 h-5" />, href: '/app/clients' },
    { label: 'Registros', icon: <Terminal className="w-5 h-5" />, href: '/app/logs' },
    { label: 'Configuración', icon: <Settings className="w-5 h-5" />, href: '/app/settings' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 p-8 fixed h-full">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Zap className="text-patagonia-gold w-5 h-5 fill-patagonia-gold" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase italic">Click Admin</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 hover:text-black hover:bg-gray-50 transition-all font-medium group"
            >
              <div className="transition-transform group-hover:scale-110">{item.icon}</div>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="pt-8 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-bold text-xs uppercase tracking-widest">Cerrar Sesión</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
           <div className="flex items-center gap-2">
            <Zap className="text-patagonia-gold w-6 h-6 fill-patagonia-gold" />
            <span className="font-black uppercase italic">Click</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        <div className="p-6 md:p-12 max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in" onClick={() => setIsSidebarOpen(false)}>
           <div className="bg-white w-64 h-full p-8 space-y-8" onClick={e => e.stopPropagation()}>
              <nav className="space-y-4">
                {menuItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center gap-4 py-4 text-gray-500 font-bold"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
           </div>
        </div>
      )}
    </div>
  );
}
