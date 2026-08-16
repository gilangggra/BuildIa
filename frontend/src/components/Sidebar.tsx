"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
    <aside className="w-60 h-screen bg-[#030509]/90 backdrop-blur-3xl border-r border-white/5 flex flex-col fixed left-0 top-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5 relative overflow-hidden group cursor-pointer">
        {/* Subtle glow behind logo */}
        <div className="absolute top-1/2 left-8 -translate-y-1/2 w-16 h-16 bg-blue-500/20 rounded-full blur-[20px] pointer-events-none group-hover:bg-blue-500/40 transition-colors"></div>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="font-black text-white text-lg tracking-tight">BuildIA</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm group ${
                isActive
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300"}`} />
              {label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Profile Pill */}
      <div className="p-4 border-t border-white/5 bg-gradient-to-t from-black/40 to-transparent">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
              <span className="text-xs font-bold text-slate-300">U</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">User</span>
              <span className="text-[10px] text-slate-500">Free Plan</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
