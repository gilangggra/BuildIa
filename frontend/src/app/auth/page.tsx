"use client";

import { motion } from "framer-motion";
import AuthForm from "@/components/AuthForm";
import { Sparkles, Layers, Zap, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="w-full min-h-screen bg-[#030509] grid grid-cols-1 md:grid-cols-2 items-center gap-12 p-6 md:p-12 lg:px-24 relative overflow-hidden font-sans">
      
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" 
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBmaWxsPSJub25lIj48cGF0aCBkPSJNMCA0MGw0MC00ME0wIDBsNDAgNDAiLz48L2c+PC9zdmc+')] opacity-20" />
      </div>

      <div className="flex flex-col items-center md:items-start text-center md:text-left z-10 w-full max-w-xl mx-auto md:ml-auto md:mr-0 h-full justify-center pt-10 md:pt-0">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group">
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 text-xs font-bold text-blue-400 backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>BuildIA Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 leading-tight mb-6">
            Welcome to the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">future of coding.</span>
          </h1>
          
          <p className="text-base text-slate-400 mb-10 leading-relaxed max-w-md mx-auto md:mx-0 font-light">
            A premium development ecosystem powered by autonomous AI agents. Turn your ideas into production-ready software effortlessly.
          </p>
          
          {/* Feature List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-400 max-w-lg mx-auto md:mx-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Layers className="h-4 w-4" />
              </div>
              <span className="font-medium text-slate-300">Automated Architecture</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-medium text-slate-300">Lightning Fast IDE</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-medium text-slate-300">Enterprise Security</span>
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
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20 blur-xl opacity-50 rounded-3xl group-hover:opacity-70 transition-opacity pointer-events-none" />
          <div className="relative">
            <AuthForm />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
