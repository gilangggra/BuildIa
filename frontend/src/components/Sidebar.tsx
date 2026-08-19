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
    <aside className="w-60 h-screen bg-[#f7f3ee] border-r border-[#181818]/20 flex flex-col fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[#181818]/10 relative overflow-hidden cursor-pointer">
        <div className="w-8 h-8 bg-[#181818] rounded-[8px] flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-4 w-4 text-[#f7f3ee]" />
        </div>
        <span className="font-semibold text-[#181818] text-[17px] tracking-[-0.03em]">BuildIA</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] transition-all font-medium text-[15px] group ${
                isActive
                  ? "bg-white text-[#181818] border border-[#181818]/10 shadow-[0_2px_8px_rgba(24,24,24,0.04)]"
                  : "text-[#181818]/70 hover:text-[#181818] hover:bg-black/5"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${isActive ? "text-[#181818]" : "text-[#181818]/50 group-hover:text-[#181818]"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Profile Pill */}
      <div className="p-4 border-t border-[#181818]/10 bg-[#f7f3ee]">
        <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-white border border-[#181818]/20 hover:border-[#181818]/40 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#181818] flex items-center justify-center flex-shrink-0">
              <span className="text-[13px] font-medium text-[#f7f3ee]">U</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[#181818]">User</span>
              <span className="text-[12px] text-[#181818]/60 font-medium leading-none mt-0.5">Free Plan</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-[6px] text-[#181818]/40 hover:text-[#181818] hover:bg-[#181818]/5 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
