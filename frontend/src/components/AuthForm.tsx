"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Code, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { name: formData.name },
          },
        });
        if (error) throw error;
        setSuccessMsg("Registration successful! Check your email to verify.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <div className="bg-[#f7f3ee] p-8 rounded-[12px] shadow-[0_8px_30px_rgba(24,24,24,0.04)] border border-[#181818]/20 relative overflow-hidden">
        
        {/* Toggle Tabs */}
        <div className="flex bg-[#181818]/5 p-1.5 rounded-[8px] mb-8 border border-[#181818]/10 relative z-10">
          <button
            onClick={() => { setIsLogin(true); setErrorMsg(""); setSuccessMsg(""); }}
            className={`flex-1 py-2 text-[14px] font-semibold rounded-[6px] transition-all ${isLogin ? 'bg-white text-[#181818] shadow-[0_2px_8px_rgba(24,24,24,0.08)]' : 'text-[#181818]/60 hover:text-[#181818]'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrorMsg(""); setSuccessMsg(""); }}
            className={`flex-1 py-2 text-[14px] font-semibold rounded-[6px] transition-all ${!isLogin ? 'bg-white text-[#181818] shadow-[0_2px_8px_rgba(24,24,24,0.08)]' : 'text-[#181818]/60 hover:text-[#181818]'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-3 bg-red-50 border border-red-200 rounded-[8px] text-red-700 text-[14px] flex items-start gap-2 relative z-10 font-medium">
              <span>{errorMsg}</span>
            </motion.div>
          )}
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-[8px] text-emerald-700 text-[14px] flex items-start gap-2 relative z-10 font-medium">
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="relative pb-1">
                  <User className="absolute left-4 top-3.5 h-[18px] w-[18px] text-[#181818]/40" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full bg-white border border-[#181818]/20 focus:border-[#181818] focus:ring-1 focus:ring-[#181818] text-[15px] text-[#181818] rounded-[8px] pl-11 pr-4 py-3 outline-none transition-all placeholder:text-[#181818]/40 font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-[18px] w-[18px] text-[#181818]/40" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-white border border-[#181818]/20 focus:border-[#181818] focus:ring-1 focus:ring-[#181818] text-[15px] text-[#181818] rounded-[8px] pl-11 pr-4 py-3 outline-none transition-all placeholder:text-[#181818]/40 font-medium"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-[18px] w-[18px] text-[#181818]/40" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white border border-[#181818]/20 focus:border-[#181818] focus:ring-1 focus:ring-[#181818] text-[15px] text-[#181818] rounded-[8px] pl-11 pr-4 py-3 outline-none transition-all placeholder:text-[#181818]/40 font-medium"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="group relative w-full overflow-hidden rounded-[8px] mt-4 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_3px_10px_rgba(24,24,24,0.12)] bg-[#181818]"
          >
            <div className="absolute inset-0 bg-[#2a2a2a] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-full py-3.5 px-4 flex items-center justify-center gap-2 text-[#f7f3ee] font-semibold transition-all text-[15px]">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In to BuildIA' : 'Create Account'}
                  <ArrowRight className="h-[18px] w-[18px] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </form>

        <div className="mt-8 relative z-10">
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-[#181818]/10"></div>
            <span className="flex-shrink-0 mx-4 text-[#181818]/40 text-[11px] font-bold tracking-wider uppercase">OR</span>
            <div className="flex-grow border-t border-[#181818]/10"></div>
          </div>
          
          <button type="button" className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-black/5 border border-[#181818]/20 rounded-[8px] transition-all text-[15px] text-[#181818] font-semibold group shadow-[0_2px_8px_rgba(24,24,24,0.04)]">
            <Code className="h-5 w-5 text-[#181818]/60 group-hover:text-[#181818] transition-colors" />
            Continue with GitHub
          </button>
        </div>
        
      </div>
    </div>
  );
}
