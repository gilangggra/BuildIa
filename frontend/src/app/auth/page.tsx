"use client";

import { motion } from "framer-motion";
import AuthForm from "@/components/AuthForm";
import { Sparkles, Layers, Zap, Shield } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#06090F] flex flex-col md:flex-row items-center justify-center p-6 md:p-12 relative overflow-hidden">
      
      {/* Premium Minimal Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Subtle Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex-1 max-w-xl text-center md:text-left z-10 md:pr-12 lg:pr-24 mb-12 md:mb-0">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Logo / Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 mb-8 text-xs font-medium text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>BuildIA Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Design, code, and deploy in <span className="text-blue-400">minutes.</span>
          </h1>
          
          <p className="text-base text-slate-400 mb-10 leading-relaxed max-w-md mx-auto md:mx-0">
            A premium development ecosystem powered by autonomous AI agents. Turn your ideas into production-ready software effortlessly.
          </p>
          
          {/* Feature List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-400 max-w-lg mx-auto md:mx-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Layers className="h-4 w-4" />
              </div>
              <span>Automated Architecture</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Zap className="h-4 w-4" />
              </div>
              <span>Lightning Fast IDE</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Shield className="h-4 w-4" />
              </div>
              <span>Enterprise Security</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="w-full max-w-md z-10 flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="w-full"
        >
          <AuthForm />
        </motion.div>
      </div>
    </div>
  );
}
