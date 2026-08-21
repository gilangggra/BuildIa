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
    <div className="min-h-screen bg-[#f7f3ee] text-[#181818] font-sans overflow-x-hidden relative selection:bg-[#181818]/10 selection:text-[#181818]">
      
      {/* Navbar (Sticky) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f7f3ee]/80 backdrop-blur-xl border-b border-[#181818]/10">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#181818] rounded-[8px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#f7f3ee]" />
            </div>
            <span className="text-[22px] font-semibold tracking-[-0.03em] text-[#181818]">BuildIA</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#181818]/70">
            <Link href="#features" className="hover:text-[#181818] transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-[#181818] transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-[#181818] transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/auth">
              <div className="px-6 py-2.5 bg-white hover:bg-black/5 border border-[#181818]/20 transition-colors rounded-[8px] flex items-center gap-2 text-[15px] font-semibold text-[#181818] shadow-[0_2px_8px_rgba(24,24,24,0.04)]">
                Get Started
                <ArrowRight className="w-4 h-4" />
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
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#181818]/5 text-[#181818] text-[14px] font-semibold mb-8">
            <Zap className="w-4 h-4" />
            <span>BuildIA 1.0 is now live</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-[4rem] md:text-[6.5rem] font-semibold tracking-[-0.04em] text-[#181818] leading-[1.05] mb-8">
            The AI co-founder <br className="hidden md:block" />
            you've been <span className="text-[#181818]/50">waiting for.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-[18px] md:text-[22px] text-[#181818]/70 max-w-3xl mb-12 leading-[1.6] font-medium">
            Stop writing boilerplate. Command intelligent agents to architecture, code, and deploy your next big idea directly from your browser.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/auth" className="w-full sm:w-auto">
              <div className="px-8 py-4 bg-[#181818] hover:bg-[#2a2a2a] transition-all rounded-[8px] flex items-center justify-center gap-3 text-[17px] font-semibold text-[#f7f3ee] shadow-[0_8px_20px_rgba(24,24,24,0.12)]">
                Start Building Free
                <Rocket className="w-5 h-5" />
              </div>
            </Link>
            
            <Link href="#features" className="px-8 py-4 bg-white hover:bg-black/5 transition-colors rounded-[8px] flex items-center justify-center gap-2 text-[17px] font-semibold text-[#181818] border border-[#181818]/20 shadow-[0_2px_8px_rgba(24,24,24,0.04)] w-full sm:w-auto">
              See How it Works
            </Link>
          </motion.div>
          
          <motion.p variants={itemVariants} className="text-[14px] text-[#181818]/60 mt-6 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No credit card required. Free tier available.
          </motion.p>
        </motion.div>

        {/* Animated IDE Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full mt-24 relative group"
        >
          <div className="relative rounded-[12px] overflow-hidden border border-[#181818]/10 shadow-[0_30px_80px_rgba(24,24,24,0.1)] bg-white transition-transform duration-700 group-hover:scale-[1.01]">
            {/* Fake Mac Header */}
            <div className="flex items-center px-4 py-3 border-b border-[#181818]/10 bg-white">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="mx-auto px-4 py-1.5 rounded-[6px] bg-[#f7f3ee] border border-[#181818]/10 text-[12px] text-[#181818]/60 font-medium flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#181818]/40" />
                buildia.dev/workspace/app.ts
              </div>
            </div>
            
            {/* Fake Code / Interface */}
            <div className="p-0 flex flex-col md:flex-row h-[450px] text-left">
               {/* Sidebar */}
               <div className="hidden md:flex w-[240px] bg-[#f7f3ee] border-r border-[#181818]/10 flex-col py-4">
                  <div className="px-5 mb-4 text-[11px] font-bold text-[#181818]/40 uppercase tracking-wider">Explorer</div>
                  <div className="flex flex-col space-y-0.5">
                    <div className="px-5 py-2 bg-white text-[#181818] font-semibold text-[14px] flex items-center gap-3 border-l-[3px] border-[#181818] shadow-sm">
                      <Code2 className="w-4 h-4 text-[#181818]/60" /> app.ts
                    </div>
                    <div className="px-5 py-2 text-[#181818]/70 font-medium text-[14px] flex items-center gap-3 hover:bg-white cursor-pointer border-l-[3px] border-transparent">
                      <Bot className="w-4 h-4 text-[#181818]/40" /> agents.config.ts
                    </div>
                    <div className="px-5 py-2 text-[#181818]/70 font-medium text-[14px] flex items-center gap-3 hover:bg-white cursor-pointer border-l-[3px] border-transparent">
                      <GitBranch className="w-4 h-4 text-[#181818]/40" /> schema.prisma
                    </div>
                  </div>
               </div>
               
               {/* Main Editor — renders the live typing animation */}
               <div className="flex-1 bg-white p-6 font-mono text-[15px] leading-relaxed relative overflow-hidden">
                 <div className="flex text-[#181818]">
                   <div className="w-8 text-[#181818]/30 select-none text-right pr-4 mr-4 flex flex-col gap-1">
                     {[1,2,3,4,5,6].map(n => <span key={n}>{n}</span>)}
                   </div>
                   <div className="flex-1 overflow-hidden">
                     <pre className="whitespace-pre-wrap font-medium text-[#181818] text-[14px] leading-relaxed">
                       {typedCode}
                     </pre>
                     <span className="inline-block w-2 h-4 bg-[#181818] animate-pulse ml-0.5 align-middle" />
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-32 bg-white border-t border-[#181818]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-[3rem] md:text-[4rem] font-semibold tracking-[-0.03em] text-[#181818] mb-6">How <span className="text-[#181818]/50">BuildIA</span> Works</h2>
            <p className="text-[#181818]/70 max-w-2xl mx-auto text-[18px] font-medium">
              From concept to deployed application in three simple steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-[#181818]/10 -translate-y-1/2 z-0" />
            
            {[
              { step: "01", title: "Prompt your Vision", desc: "Describe the application you want to build in plain English. Our AI analyzes your requirements instantly." },
              { step: "02", title: "Agents Architect", desc: "A team of specialized AI agents draft the database schema, frontend components, and backend API routes." },
              { step: "03", title: "Deploy & Iterate", desc: "Watch the code run in our WebContainer sandbox. Chat with agents to tweak features in real-time." },
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-[16px] bg-[#f7f3ee] border border-[#181818]/10 text-[#181818] flex items-center justify-center text-[24px] font-semibold mb-8">
                  {item.step}
                </div>
                <h3 className="text-[22px] font-semibold text-[#181818] mb-4 tracking-tight">{item.title}</h3>
                <p className="text-[#181818]/70 font-medium text-[16px] leading-[1.6] max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 bg-[#f7f3ee] border-t border-[#181818]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-[3rem] md:text-[4rem] font-semibold tracking-[-0.03em] text-[#181818] mb-6">Unfair <span className="text-[#181818]/50">Advantage</span></h2>
            <p className="text-[#181818]/70 max-w-2xl mx-auto text-[18px] font-medium">
              Everything you need to conceptualize, build, and deploy software autonomously.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { icon: Bot, title: "Multi-Agent System", desc: "Coordinate specialized agents for planning, coding, and QA. Watch them collaborate to build complex architectures." },
              { icon: Terminal, title: "In-Browser Sandbox", desc: "Powered by WebContainers. Run full Node.js environments directly in your browser. No local setup required." },
              { icon: Cpu, title: "Native Architecture", desc: "Generate and visualize system architectures, database schemas, and state diagrams instantly." }
            ].map((feat, idx) => (
              <div key={idx} className="bg-white border border-[#181818]/20 rounded-[16px] p-10 hover:border-[#181818]/40 transition-colors group">
                <div className="w-14 h-14 bg-[#181818]/5 border border-[#181818]/10 rounded-[8px] flex items-center justify-center mb-8">
                  <feat.icon className="w-6 h-6 text-[#181818]" />
                </div>
                <h3 className="text-[22px] font-semibold text-[#181818] mb-4 tracking-tight">{feat.title}</h3>
                <p className="text-[#181818]/70 font-medium leading-[1.6] text-[16px]">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section (Teaser) */}
      <section id="pricing" className="relative z-10 py-32 bg-white border-t border-[#181818]/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-[3rem] md:text-[4rem] font-semibold tracking-[-0.03em] text-[#181818] mb-6">Start building for <span className="text-[#181818]/50">free</span></h2>
          <p className="text-[#181818]/70 text-[18px] mb-12 font-medium">Join thousands of developers accelerating their workflow with BuildIA.</p>
          
          <div className="p-12 rounded-[16px] bg-[#181818] text-[#f7f3ee] shadow-[0_20px_60px_rgba(24,24,24,0.15)] relative overflow-hidden flex flex-col items-center">
            <h3 className="text-[24px] font-semibold mb-2">Pro Developer</h3>
            <div className="text-[4rem] font-semibold mb-10 tracking-[-0.03em]">$0<span className="text-[20px] text-[#f7f3ee]/50 font-medium tracking-normal">/mo during beta</span></div>
            
            <Link href="/auth" className="px-8 py-4 bg-[#f7f3ee] text-[#181818] hover:bg-white transition-colors rounded-[8px] font-semibold text-[16px] shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#181818]/10 bg-[#f7f3ee] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#181818] rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#f7f3ee]" />
                </div>
                <span className="text-[20px] font-semibold text-[#181818] tracking-[-0.03em]">BuildIA</span>
              </div>
              <p className="text-[#181818]/70 font-medium max-w-sm leading-[1.6]">The world's first AI-native IDE built directly into your browser. Code, test, and ship faster.</p>
            </div>
            <div>
              <h4 className="text-[#181818] font-semibold mb-6 tracking-tight">Product</h4>
              <div className="flex flex-col gap-4 text-[#181818]/70 font-medium text-[15px]">
                <Link href="#features" className="hover:text-[#181818] transition-colors">Features</Link>
                <Link href="#pricing" className="hover:text-[#181818] transition-colors">Pricing</Link>
                <Link href="#how-it-works" className="hover:text-[#181818] transition-colors">How it Works</Link>
              </div>
            </div>
            <div>
              <h4 className="text-[#181818] font-semibold mb-6 tracking-tight">Platform</h4>
              <div className="flex flex-col gap-4 text-[#181818]/70 font-medium text-[15px]">
                <Link href="/auth" className="hover:text-[#181818] transition-colors">Get Started</Link>
                <Link href="/dashboard" className="hover:text-[#181818] transition-colors">Dashboard</Link>
                <Link href="#features" className="hover:text-[#181818] transition-colors">Documentation</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#181818]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#181818]/50 font-medium text-[14px]">
              © {new Date().getFullYear()} BuildIA Inc. All rights reserved.
            </p>
            <div className="flex gap-8 text-[14px] text-[#181818]/50 font-medium">
              <Link href="#" className="hover:text-[#181818] transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#181818] transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
