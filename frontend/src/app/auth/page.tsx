"use client";

import { motion } from "framer-motion";
import AuthForm from "@/components/AuthForm";
import { Sparkles } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-mesh flex flex-col md:flex-row items-center justify-center p-6 md:p-12 gap-12 overflow-hidden relative">
      
      {/* Decorative Orbs */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        animate={{ 
          y: [0, 30, 0],
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
      />

      <div className="flex-1 max-w-xl text-center md:text-left z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 text-sm text-blue-200">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Platform</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Build software <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              at the speed of thought.
            </span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            Unleash a team of autonomous AI agents to brainstorm, design, and code your next big idea into reality.
          </p>
          
          <div className="flex gap-4 items-center justify-center md:justify-start text-sm text-slate-400">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center">
                  <div className="w-4 h-4 bg-white/10 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
            <span>Trusted by 10,000+ developers</span>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex justify-center w-full max-w-md z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full"
        >
          <AuthForm />
        </motion.div>
      </div>
    </div>
  );
}
