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
    <div className="flex flex-col h-full bg-[#f7f3ee] text-[#181818] relative overflow-hidden font-sans">
      
      {/* Top Header */}
      <div className="bg-white border-b border-[#181818]/10 px-8 py-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#181818] rounded-[8px] flex items-center justify-center shadow-sm">
              <Bot className="h-5 w-5 text-[#f7f3ee]" />
            </div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight flex items-center gap-2">
                Agent Marketplace
              </h1>
              <p className="text-[#181818]/60 text-[14px] font-medium mt-0.5">Discover and install specialized AI agents for your workspace.</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#181818] hover:bg-[#2a2a2a] text-[#f7f3ee] font-semibold rounded-[6px] transition-all shadow-[0_2px_8px_rgba(24,24,24,0.12)] text-[14px]"
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
              <Search className="h-4 w-4 text-[#181818]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents..." 
                className="w-72 bg-white border border-[#181818]/10 focus:border-[#181818]/30 rounded-[6px] pl-10 pr-3 py-2 text-[14px] outline-none placeholder:text-[#181818]/40 shadow-sm"
              />
            </div>
            <div className="text-[13px] text-[#181818]/50 font-medium bg-white px-3 py-1.5 rounded-full border border-[#181818]/10 shadow-sm">
              <Zap className="h-3.5 w-3.5 inline-block mr-1 text-amber-500" />
              Powered by Google Gemini
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white border border-[#181818]/10 rounded-[8px] shadow-sm">
              <Loader2 className="h-6 w-6 text-[#181818]/40 animate-spin mb-4" />
              <p className="text-[#181818]/60 font-medium text-[14px]">Loading agents...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredAgents.map((agent) => {
                const AgentIcon = iconMap[agent.type] || iconMap[agent.icon_name] || Bot;
                return (
                  <div
                    key={agent.id}
                    className="group bg-white border border-[#181818]/10 rounded-[12px] hover:border-[#181818]/30 transition-all shadow-[0_2px_4px_rgba(24,24,24,0.02)] hover:shadow-[0_8px_20px_rgba(24,24,24,0.06)] flex flex-col"
                  >
                    <div className="p-5 flex-1">
                      <div className="w-12 h-12 bg-[#f7f3ee] border border-[#181818]/10 rounded-[8px] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <AgentIcon className="h-6 w-6 text-[#181818]/80" />
                      </div>
                      <h3 className="text-[16px] font-semibold text-[#181818] mb-1.5">
                        {agent.label}
                      </h3>
                      <p className="text-[#181818]/60 text-[13px] leading-relaxed line-clamp-3">
                        {agent.description || "A specialized AI assistant to help you write better code."}
                      </p>
                    </div>
                    <div className="px-5 py-4 border-t border-[#181818]/5">
                      <button className="w-full py-2 bg-[#181818]/5 hover:bg-[#181818]/10 text-[#181818] font-semibold rounded-[6px] text-[13px] transition-colors flex items-center justify-center gap-2">
                        <Plus className="h-3.5 w-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181818]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[16px] shadow-[0_20px_60px_rgba(24,24,24,0.15)] border border-[#181818]/10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#181818]/10 bg-[#f7f3ee]">
              <h2 className="text-[16px] font-bold text-[#181818] flex items-center gap-2">
                <Wand2 className="h-4 w-4" /> Create Custom Agent
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[#181818]/40 hover:text-[#181818] transition-colors p-1"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAgent} className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-[#181818] mb-1.5">Agent Name</label>
                  <input 
                    type="text" 
                    required
                    value={newAgent.label}
                    onChange={(e) => setNewAgent({...newAgent, label: e.target.value})}
                    placeholder="e.g. Tailwind UI Master" 
                    className="w-full bg-white border border-[#181818]/20 focus:border-[#181818] focus:ring-1 focus:ring-[#181818] rounded-[8px] px-3.5 py-2.5 outline-none transition-all placeholder:text-[#181818]/30 font-medium text-[14px]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#181818] mb-1.5">Short Description</label>
                  <input 
                    type="text" 
                    value={newAgent.description}
                    onChange={(e) => setNewAgent({...newAgent, description: e.target.value})}
                    placeholder="e.g. Specializes in building modern Tailwind components" 
                    className="w-full bg-white border border-[#181818]/20 focus:border-[#181818] focus:ring-1 focus:ring-[#181818] rounded-[8px] px-3.5 py-2.5 outline-none transition-all placeholder:text-[#181818]/30 font-medium text-[14px]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#181818] mb-1.5">System Prompt / Instructions</label>
                  <textarea 
                    required
                    value={newAgent.system_prompt}
                    onChange={(e) => setNewAgent({...newAgent, system_prompt: e.target.value})}
                    placeholder="You are an expert React developer specializing in Tailwind CSS..." 
                    className="w-full h-32 resize-none bg-white border border-[#181818]/20 focus:border-[#181818] focus:ring-1 focus:ring-[#181818] rounded-[8px] px-3.5 py-2.5 outline-none transition-all placeholder:text-[#181818]/30 font-medium text-[14px] custom-scrollbar"
                  />
                  <p className="text-[12px] text-[#181818]/50 mt-2 font-medium">This is the core behavior that dictates how the agent thinks and writes code.</p>
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-[#181818]/10 bg-gray-50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 font-semibold text-[#181818]/60 hover:bg-[#181818]/5 rounded-[6px] transition-colors text-[13px]"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleCreateAgent}
                disabled={creating}
                className="flex items-center gap-2 px-5 py-2 bg-[#181818] hover:bg-[#2a2a2a] text-[#f7f3ee] font-semibold rounded-[6px] transition-colors text-[13px] shadow-sm disabled:opacity-50"
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
