"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Sparkles,
  LogOut,
  ChevronRight,
  Store,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Store, label: "Marketplace", href: "/dashboard/marketplace" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <aside className="w-60 h-screen bg-zinc-950/80 backdrop-blur-xl border-r border-white/10 flex flex-col fixed left-0 top-0 z-20 transition-all">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10 relative overflow-hidden cursor-pointer">
        <div className="w-8 h-8 bg-white/10 rounded-[8px] flex items-center justify-center flex-shrink-0 border border-white/10 shadow-inner">
          <Sparkles className="h-4 w-4 text-emerald-400" />
        </div>
        <span className="font-semibold text-white text-[17px] tracking-[-0.03em]">BuildIA</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-200 font-medium text-[14px] group ${
                isActive
                  ? "bg-white/10 text-white border border-white/5 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] transition-colors ${isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Profile Pill */}
      <div className="p-4 border-t border-white/10 bg-transparent">
        <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-600 flex items-center justify-center flex-shrink-0 shadow-inner">
              <span className="text-[13px] font-bold text-white">U</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-zinc-200">User</span>
              <span className="text-[12px] text-zinc-500 font-medium leading-none mt-0.5">Free Plan</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-[6px] text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
