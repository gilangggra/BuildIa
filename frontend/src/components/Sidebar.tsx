"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  LayoutDashboard,
  Settings,
  Sparkles,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <aside className="w-60 h-screen bg-[#06090F]/70 backdrop-blur-2xl border-r border-white/5 flex flex-col fixed left-0 top-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 relative overflow-hidden">
        {/* Subtle glow behind logo */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-16 h-16 bg-blue-500/20 rounded-full blur-xl pointer-events-none"></div>
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-slate-100 text-sm tracking-wide">BuildIA</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group
                ${isActive
                  ? "text-blue-300 bg-blue-500/10 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[60%] bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              )}
              <Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              {label}
              {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-blue-400/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-6 border-t border-white/5 bg-gradient-to-t from-black/20 to-transparent">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-red-400 transition-all duration-300 group"
        >
          <LogOut className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
