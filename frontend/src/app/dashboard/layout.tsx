"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isProjectPage = pathname?.includes("/projects/");
  return (
    <div className="min-h-screen bg-[#030509] text-slate-100 relative overflow-hidden font-sans">
      {/* Ambient Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBmaWxsPSJub25lIj48cGF0aCBkPSJNMCA0MGw0MC00ME0wIDBsNDAgNDAiLz48L2c+PC9zdmc+')] opacity-[0.015]" />
      </div>

      <div className="relative z-10 flex">
        {!isProjectPage && <Sidebar />}
        <div className={`flex-1 flex flex-col min-h-screen ${!isProjectPage ? 'ml-60' : ''}`}>
          {/* Top Header */}
          <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-[#030509]/80 sticky top-0 z-10 backdrop-blur-xl">
          <p className="text-sm text-slate-400">
            AI-Powered Development Platform
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
              <span className="text-xs font-semibold text-blue-400">U</span>
            </div>
          </div>
        </header>

          {/* Page Content */}
          <main className={`flex-1 ${!isProjectPage ? 'p-8 md:p-10' : ''}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
