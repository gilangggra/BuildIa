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
    <div className="min-h-screen bg-[#f7f3ee] text-[#181818] relative overflow-hidden font-sans">
      {/* Ambient Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#181818]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] bg-[#181818]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex">
        {!isProjectPage && <Sidebar />}
        <div className={`flex-1 flex flex-col min-h-screen ${!isProjectPage ? 'ml-60' : ''}`}>
          {/* Top Header */}
          <header className="h-16 border-b border-[#181818]/10 px-8 flex items-center justify-between bg-[#f7f3ee]/80 sticky top-0 z-10 backdrop-blur-xl">
          <p className="text-sm font-medium text-[#181818]/60">
            AI-Powered Development Platform
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[6px] bg-[#181818] border border-[#181818]/20 flex items-center justify-center shadow-sm">
              <span className="text-xs font-semibold text-[#f7f3ee]">U</span>
            </div>
          </div>
        </header>

          {/* Page Content */}
          <main className={`flex-1 ${!isProjectPage ? 'p-0' : ''}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
