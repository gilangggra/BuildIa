import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#06090F] text-slate-100 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex">
        <Sidebar />
        <div className="flex-1 ml-60 flex flex-col min-h-screen">
          {/* Top Header */}
          <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-[#06090F]/60 sticky top-0 z-10 backdrop-blur-xl">
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
          <main className="p-8 md:p-10 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
