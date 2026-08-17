"use client";

import { motion } from "framer-motion";
import AuthForm from "@/components/AuthForm";
import { Sparkles, Layers, Zap, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="w-full min-h-screen bg-[#f7f3ee] text-[#181818] grid grid-cols-1 md:grid-cols-2 items-center gap-12 p-6 md:p-12 lg:px-24 relative overflow-hidden font-sans">
      
      <div className="flex flex-col items-center md:items-start text-center md:text-left z-10 w-full max-w-xl mx-auto md:ml-auto md:mr-0 h-full justify-center pt-10 md:pt-0">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#181818]/60 hover:text-[#181818] transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          {/* Logo / Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#181818]/20 mb-8 text-[12px] font-bold text-[#181818] shadow-[0_2px_8px_rgba(24,24,24,0.04)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>BuildIA Platform</span>
          </div>
          
          <h1 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-semibold tracking-[-0.03em] text-[#181818] leading-[1.1] mb-6">
            Welcome to the <br/>
            <span className="text-[#181818]/60">future of coding.</span>
          </h1>
          
          <p className="text-[16px] text-[#181818]/70 mb-12 leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
            A premium development ecosystem powered by autonomous AI agents. Turn your ideas into production-ready software effortlessly.
          </p>
          
          {/* Feature List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-[14px] text-[#181818] max-w-lg mx-auto md:mx-0">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-white border border-[#181818]/20 text-[#181818]">
                <Layers className="h-4 w-4" />
              </div>
              <span className="font-semibold">Automated Architecture</span>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-white border border-[#181818]/20 text-[#181818]">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-semibold">Lightning Fast IDE</span>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-white border border-[#181818]/20 text-[#181818]">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-semibold">Enterprise Security</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="w-full max-w-md mx-auto md:mx-0 z-10 pb-10 md:pb-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative group"
        >
          <div className="relative">
            <AuthForm />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
