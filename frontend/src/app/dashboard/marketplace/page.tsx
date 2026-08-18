"use client";

import { useEffect, useState } from "react";
import { Plus, Bot, Code2, BookOpen, Layout, Wand2, Shield, Loader2, Search, Zap } from "lucide-react";
import { api } from "@/lib/api";

const iconMap: Record<string, any> = {
  "code-generator": Code2,
  "ideator": BookOpen,
  "diagrammer": Layout,
  "reviewer": Shield,
  "Bot": Bot,
};

export default function MarketplacePage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create Agent Modal State
  const [showModal, setShowModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ label: '', description: '', type: 'custom', system_prompt: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.agents.list().then(data => {
      if(mounted) {
        setAgents(data || []);
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if(mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.label || !newAgent.system_prompt) return;
    try {
      setCreating(true);
      await api.agents.create({ ...newAgent, icon_name: 'Bot' });
      const updatedAgents = await api.agents.list();
      setAgents(updatedAgents || []);
      setShowModal(false);
      setNewAgent({ label: '', description: '', type: 'custom', system_prompt: '' });
    } catch (err: any) {
      alert("Failed to create agent: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const filteredAgents = agents.filter(agent => 
    agent.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white relative overflow-hidden font-sans">
      
      {/* Top Header */}
      <div className="bg-zinc-950/80 backdrop-blur-md border-b border-white/10 px-8 py-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shadow-sm">
              <Bot className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight flex items-center gap-2">
                Agent Marketplace
              </h1>
              <p className="text-zinc-400 text-[14px] font-medium mt-0.5">Discover and install specialized AI agents for your workspace.</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-md transition-all shadow-sm text-[14px]"
          >
            <Plus className="h-4 w-4" />
            Create Custom Agent
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto pb-12">
          {/* Search/Filter Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="relative">
              <Search className="h-4 w-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents..." 
                className="w-72 bg-zinc-900 border border-white/10 focus:border-white/20 rounded-md pl-10 pr-3 py-2 text-[14px] outline-none placeholder:text-zinc-600 text-white shadow-sm transition-all"
              />
            </div>
            <div className="text-[13px] text-zinc-400 font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
              <Zap className="h-3.5 w-3.5 inline-block mr-1 text-emerald-400" />
              Powered by Google Gemini
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-zinc-900/30 border border-white/5 rounded-xl shadow-sm">
              <Loader2 className="h-6 w-6 text-zinc-500 animate-spin mb-4" />
              <p className="text-zinc-400 font-medium text-[14px]">Loading agents...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredAgents.map((agent) => {
                const AgentIcon = iconMap[agent.type] || iconMap[agent.icon_name] || Bot;
                return (
                  <div
                    key={agent.id}
                    className="group bg-zinc-900/50 border border-white/10 rounded-xl hover:bg-zinc-900 hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col hover:-translate-y-1 relative overflow-hidden"
                  >
                    {/* Top gradient glow effect */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="p-6 flex-1 relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-zinc-800 to-zinc-700 border border-white/10 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm relative">
                        {/* Glow behind icon on hover */}
                        <div className="absolute inset-0 bg-white/5 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <AgentIcon className="h-5 w-5 text-white relative z-10" />
                      </div>
                      <h3 className="text-[17px] font-bold text-white mb-2 tracking-tight group-hover:text-zinc-200 transition-colors">
                        {agent.label}
                      </h3>
                      <p className="text-zinc-400 text-[14px] leading-relaxed line-clamp-3 font-medium">
                        {agent.description || "A specialized AI assistant to help you write better code."}
                      </p>
                    </div>
                    <div className="px-6 py-4 border-t border-white/5 bg-black/20">
                      <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 hover:text-white text-zinc-300 font-semibold rounded-md text-[13px] transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                        <Plus className="h-4 w-4 transition-transform group-hover/btn:rotate-90" />
                        Install to Workspace
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Custom Agent Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 w-full max-w-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/50">
              <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-emerald-400" /> Create Custom Agent
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAgent} className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-zinc-300 mb-1.5">Agent Name</label>
                  <input 
                    type="text" 
                    required
                    value={newAgent.label}
                    onChange={(e) => setNewAgent({...newAgent, label: e.target.value})}
                    placeholder="e.g. Tailwind UI Master" 
                    className="w-full bg-zinc-900 border border-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-md px-3.5 py-2.5 outline-none transition-all placeholder:text-zinc-600 font-medium text-[14px] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-zinc-300 mb-1.5">Short Description</label>
                  <input 
                    type="text" 
                    value={newAgent.description}
                    onChange={(e) => setNewAgent({...newAgent, description: e.target.value})}
                    placeholder="e.g. Specializes in building modern Tailwind components" 
                    className="w-full bg-zinc-900 border border-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-md px-3.5 py-2.5 outline-none transition-all placeholder:text-zinc-600 font-medium text-[14px] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-zinc-300 mb-1.5">System Prompt / Instructions</label>
                  <textarea 
                    required
                    value={newAgent.system_prompt}
                    onChange={(e) => setNewAgent({...newAgent, system_prompt: e.target.value})}
                    placeholder="You are an expert React developer specializing in Tailwind CSS..." 
                    className="w-full h-32 resize-none bg-zinc-900 border border-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-md px-3.5 py-2.5 outline-none transition-all placeholder:text-zinc-600 font-medium text-[14px] text-white custom-scrollbar"
                  />
                  <p className="text-[12px] text-zinc-500 mt-2 font-medium">This is the core behavior that dictates how the agent thinks and writes code.</p>
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-white/10 bg-zinc-900/50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 font-semibold text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors text-[13px]"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleCreateAgent}
                disabled={creating}
                className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-md transition-colors text-[13px] shadow-sm disabled:opacity-50"
              >
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                Create Agent
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
