"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Terminal,
  Rocket,
  CheckCircle2,
  Zap,
  Code2,
  GitBranch
} from "lucide-react";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  const [typedCode, setTypedCode] = useState("");
  const fullCode = `import { AIOrchestrator } from "@buildia/core";\n\nconst agent = new AIOrchestrator();\n\n// Analyzing architecture...\nawait agent.deployFullStackApp();`;

  useEffect(() => {
    let i = 0;
    let typingInterval: NodeJS.Timeout;
    
    const startTyping = () => {
      typingInterval = setInterval(() => {
        if (i <= fullCode.length) {
          setTypedCode(fullCode.slice(0, i));
          i++;
        } else {
          clearInterval(typingInterval);
          // Reset after 5 seconds to loop the typing effect
          setTimeout(() => {
            setTypedCode("");
            i = 0;
            startTyping();
          }, 5000);
        }
      }, 50);
    };

    startTyping();

    return () => clearInterval(typingInterval);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[#030509] text-slate-200 selection:bg-blue-500/30 font-sans overflow-x-hidden relative">
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
        <motion.div style={{ y }} className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBmaWxsPSJub25lIj48cGF0aCBkPSJNMCA0MGw0MC00ME0wIDBsNDAgNDAiLz48L2c+PC9zdmc+')] opacity-30" />
      </div>

      {/* Navbar (Sticky) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030509]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-blue-500 blur-md opacity-40 group-hover:opacity-70 transition-opacity rounded-xl" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">BuildIA</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/auth" className="relative group">
              <div className="absolute inset-0 bg-blue-500 blur-md opacity-40 group-hover:opacity-80 transition-opacity rounded-full" />
              <div className="relative px-6 py-2.5 bg-blue-600 hover:bg-blue-500 transition-colors rounded-full flex items-center gap-2 text-sm font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-blue-400/20">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-40 pb-20 px-6 max-w-7xl mx-auto text-center min-h-[90vh]">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col items-center max-w-4xl"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-8 backdrop-blur-sm cursor-pointer hover:bg-blue-500/20 transition-colors">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>BuildIA 1.0 is now live</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-600 leading-[1.1] mb-8">
            The AI co-founder <br className="hidden md:block" />
            you've been <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">waiting for.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-2xl text-slate-400 max-w-2xl mb-12 leading-relaxed font-light">
            Stop writing boilerplate. Command intelligent agents to architecture, code, and deploy your next big idea directly from your browser.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/auth" className="relative group w-full sm:w-auto">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity rounded-full" />
              <div className="relative px-8 py-4 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 transition-all rounded-full flex items-center justify-center gap-3 text-lg font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] border border-blue-400/30">
                Start Building Free
                <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </Link>
            
            <Link href="#features" className="px-8 py-4 bg-white/5 hover:bg-white/10 transition-colors rounded-full flex items-center justify-center gap-2 text-lg font-medium text-slate-200 border border-white/10 backdrop-blur-md w-full sm:w-auto">
              See How it Works
            </Link>
          </motion.div>
          
          <motion.p variants={itemVariants} className="text-sm text-slate-500 mt-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> No credit card required. Free tier available.
          </motion.p>
        </motion.div>

        {/* Animated IDE Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full mt-24 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#030509] via-transparent to-transparent z-10 h-full pointer-events-none" />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.15)] bg-[#0A0D14] ring-1 ring-white/5 transition-transform duration-700 group-hover:scale-[1.02]">
            {/* Fake Mac Header */}
            <div className="flex items-center px-4 py-3 border-b border-white/5 bg-[#06090F]/80 backdrop-blur-md">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto px-6 py-1.5 rounded-md bg-[#030509] border border-white/5 text-xs text-slate-400 flex items-center gap-2 shadow-inner">
                <ShieldCheck className="w-3 h-3 text-green-400" />
                buildia.dev/workspace/app.ts
              </div>
            </div>
            
            {/* Fake Code / Interface */}
            <div className="p-0 flex flex-col md:flex-row h-[450px] text-left">
               {/* Sidebar */}
               <div className="hidden md:flex w-[250px] bg-[#06090F] border-r border-white/5 flex-col py-4">
                  <div className="px-4 mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Explorer</div>
                  <div className="flex flex-col space-y-1">
                    <div className="px-4 py-1.5 bg-blue-500/10 text-blue-400 text-sm flex items-center gap-2 border-l-2 border-blue-500">
                      <Code2 className="w-4 h-4" /> app.ts
                    </div>
                    <div className="px-4 py-1.5 text-slate-400 text-sm flex items-center gap-2 hover:bg-white/5 cursor-pointer">
                      <Bot className="w-4 h-4" /> agents.config.ts
                    </div>
                    <div className="px-4 py-1.5 text-slate-400 text-sm flex items-center gap-2 hover:bg-white/5 cursor-pointer">
                      <GitBranch className="w-4 h-4" /> schema.prisma
                    </div>
                  </div>
               </div>
               
               {/* Main Editor */}
               <div className="flex-1 bg-[#0A0D14] p-6 font-mono text-[15px] leading-relaxed relative overflow-hidden">
                 <div className="flex text-slate-300">
                   <div className="w-8 text-slate-600 select-none text-right pr-4 border-r border-white/5 mr-4 flex flex-col gap-1">
                     <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
                   </div>
                   <div className="whitespace-pre-wrap">
                     {typedCode}
                     
                     {/* Typing animation overlay cursor */}
                     <span className="inline-block w-2.5 h-5 bg-white/80 animate-pulse ml-1 align-middle" />
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-32 bg-[#06090F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">How <span className="text-blue-400">BuildIA</span> Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              From concept to deployed application in three simple steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 -translate-y-1/2 z-0" />
            
            {[
              { step: "01", title: "Prompt your Vision", desc: "Describe the application you want to build in plain English. Our AI analyzes your requirements instantly." },
              { step: "02", title: "Agents Architect", desc: "A team of specialized AI agents draft the database schema, frontend components, and backend API routes." },
              { step: "03", title: "Deploy & Iterate", desc: "Watch the code run in our WebContainer sandbox. Chat with agents to tweak features in real-time." },
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#030509] border border-blue-500/30 text-blue-400 flex items-center justify-center text-2xl font-black shadow-[0_0_30px_rgba(59,130,246,0.2)] mb-6">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 bg-[#030509]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Unfair <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Advantage</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Everything you need to conceptualize, build, and deploy software autonomously.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { icon: Bot, title: "Multi-Agent System", desc: "Coordinate specialized agents for planning, coding, and QA. Watch them collaborate to build complex architectures." },
              { icon: Terminal, title: "In-Browser Sandbox", desc: "Powered by WebContainers. Run full Node.js environments directly in your browser. No local setup required." },
              { icon: Cpu, title: "Native Architecture", desc: "Generate and visualize system architectures, database schemas, and state diagrams instantly." }
            ].map((feat, idx) => (
              <div key={idx} className="bg-[#0A0D14] border border-white/5 rounded-3xl p-10 hover:bg-[#0C101A] hover:border-blue-500/20 transition-all duration-300 group cursor-default">
                <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <feat.icon className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section (Teaser) */}
      <section id="pricing" className="relative z-10 py-32 bg-[#06090F] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Start building for <span className="text-blue-400">free</span></h2>
          <p className="text-slate-400 text-lg mb-12">Join thousands of developers accelerating their workflow with BuildIA.</p>
          
          <div className="p-10 rounded-3xl bg-gradient-to-b from-[#0A0D14] to-[#030509] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
            <h3 className="text-3xl font-bold text-white mb-2">Pro Developer</h3>
            <div className="text-5xl font-black text-white mb-8">$0<span className="text-xl text-slate-500 font-medium">/mo during beta</span></div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth" className="px-8 py-4 bg-white text-[#030509] hover:bg-slate-200 transition-colors rounded-full font-bold text-lg">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#030509] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-blue-500" />
                <span className="text-2xl font-black text-white tracking-tighter">BuildIA</span>
              </div>
              <p className="text-slate-400 max-w-sm">The world's first AI-native IDE built directly into your browser. Code, test, and ship faster.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <div className="flex flex-col gap-3 text-slate-400">
                <Link href="#" className="hover:text-blue-400">Features</Link>
                <Link href="#" className="hover:text-blue-400">Pricing</Link>
                <Link href="#" className="hover:text-blue-400">Changelog</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <div className="flex flex-col gap-3 text-slate-400">
                <Link href="#" className="hover:text-blue-400">About Us</Link>
                <Link href="#" className="hover:text-blue-400">Careers</Link>
                <Link href="#" className="hover:text-blue-400">Contact</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} BuildIA Inc. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
