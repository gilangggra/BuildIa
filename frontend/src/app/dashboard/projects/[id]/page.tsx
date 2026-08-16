/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, FileText, Code2, GitBranch, Rocket,
  TestTube, Sparkles, Send, Loader2, ChevronDown,
  Clock, CheckCircle2, FileCode2, AlertCircle, XCircle, Check, Zap, Bot, Plus, Wand2, X, Play, ArrowUp, Paperclip, LayoutDashboard, Terminal as TerminalIcon, RefreshCw, Brain, ShoppingCart, Blocks, Settings
} from "lucide-react";
import ReactDiffViewer from "react-diff-viewer-continued";
import Editor from "@monaco-editor/react";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { teardownWebContainer } from "@/lib/webcontainer";
import { useWebContainer } from "@/hooks/useWebContainer";

const ICON_MAP: Record<string, any> = {
  Sparkles, FileText, GitBranch, Code2, Rocket, TestTube, Bot, Wand2
};

const typeIcon: Record<string, any> = {
  srs: FileText, diagram: GitBranch, code: FileCode2,
  deployment: Rocket, test: TestTube,
};

const statusIcon: Record<string, any> = {
  draft:    Clock,
  approved: CheckCircle2,
  final:    CheckCircle2,
};

const PRE_MADE_AGENTS = [
  {
    label: "Tailwind CSS Wizard",
    description: "Expert at building beautiful, responsive UI using Tailwind CSS",
    type: "code",
    icon_name: "Wand2",
    system_prompt: "You are a Tailwind CSS expert. Write beautiful, modern, responsive UIs using standard Tailwind utility classes. Do not use custom CSS."
  },
  {
    label: "SEO Optimizer",
    description: "Analyzes and generates SEO-friendly HTML structures",
    type: "code",
    icon_name: "Rocket",
    system_prompt: "You are an SEO expert. Analyze user requirements and generate HTML/React code with optimal meta tags, semantic HTML5, and schema markups."
  },
  {
    label: "Database Architect",
    description: "Designs robust SQL schemas and ORM models",
    type: "code",
    icon_name: "Bot",
    system_prompt: "You are a Database Architecture expert. Provide highly normalized, performant SQL schemas or ORM models based on user needs."
  },
  {
    label: "Security Auditor",
    description: "Reviews code for vulnerabilities and best practices",
    type: "code",
    icon_name: "CheckCircle2",
    system_prompt: "You are an Application Security expert. Review the provided code for vulnerabilities like XSS, SQLi, CSRF, and provide secure implementations."
  }
];

function extractCode(content: string): string {
  if (!content) return "";
  const codeBlockMatch = content.match(/```[a-z]*\n([\s\S]*?)```/);
  return codeBlockMatch ? codeBlockMatch[1] : content;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject]       = useState<any>(null);
  const [artefacts, setArtefacts]   = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [prompt, setPrompt]         = useState("");
  const [activeArtefact, setActiveArtefact] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'code' | 'preview' | 'terminal'>('code');
  const [error, setError] = useState("");
  
  // WebContainer Hook
  const { terminalRef, previewUrl, isWcReady, restartEnvironment } = useWebContainer(viewMode, activeArtefact);

  // Refactor State
  const [showRefactorModal, setShowRefactorModal] = useState(false);
  const [refactorPrompt, setRefactorPrompt] = useState("");
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [diffProposal, setDiffProposal] = useState<{ originalId: string; proposedContent: string; usage: any } | null>(null);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  // Custom Agent State
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ label: '', description: '', type: 'code', system_prompt: '' });
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  
  // Marketplace State
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [installingAgentId, setInstallingAgentId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchIt = async () => {
      try {
        const [proj, arts, ags] = await Promise.all([
          api.projects.get(id as string),
          api.artefacts.list(id as string),
          api.agents.list(),
        ]);
        if (mounted) {
          setProject(proj);
          setArtefacts(arts || []);
          setAgents(ags || []);
          if (ags && ags.length > 0) setSelectedAgent(ags[0]);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Failed to load project.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    fetchIt();

    // Supabase Realtime Subscription
    const channel = supabase
      .channel('public:artefacts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artefacts', filter: `project_id=eq.${id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setArtefacts((prev) => {
              if (prev.find(a => a.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setArtefacts((prev) => 
              prev.map(a => a.id === payload.new.id ? payload.new : a)
            );
            setActiveArtefact((current: any) => 
              current?.id === payload.new.id ? payload.new : current
            );
          }
        }
      )
      .subscribe();

    return () => { 
      mounted = false; 
      supabase.removeChannel(channel);
    };
  }, [id]);



  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.label || !newAgent.system_prompt) return;
    try {
      setCreatingAgent(true);
      await api.agents.create({ ...newAgent, icon_name: 'Bot' });
      const updatedAgents = await api.agents.list();
      setAgents(updatedAgents || []);
      setShowAgentModal(false);
      setNewAgent({ label: '', description: '', type: 'code', system_prompt: '' });
    } catch (err: any) {
      alert("Failed to create agent: " + err.message);
    } finally {
      setCreatingAgent(false);
    }
  };

  const handleInstallAgent = async (agentInfo: any) => {
    try {
      setInstallingAgentId(agentInfo.label);
      await api.agents.create(agentInfo);
      const updatedAgents = await api.agents.list();
      setAgents(updatedAgents || []);
    } catch (err: any) {
      alert("Failed to install agent: " + err.message);
    } finally {
      setInstallingAgentId(null);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || generating) return;
    try {
      setGenerating(true);
      setError("");
      const result = await api.artefacts.generate(id as string, {
        type: selectedAgent.type,
        agentType: selectedAgent.id,
        prompt,
      });
      setArtefacts(prev => [result, ...prev]);
      setActiveArtefact(result);
      setPrompt("");
    } catch (err: any) {
      setError(err.message || "Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const handleRefactorRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArtefact || !refactorPrompt.trim() || isRefactoring) return;
    try {
      setIsRefactoring(true);
      setError("");
      
      const res = await api.artefacts.refactor(id as string, activeArtefact.id, refactorPrompt);
      
      setDiffProposal({
        originalId: activeArtefact.id,
        proposedContent: res.proposedContent,
        usage: res.usage
      });
      setShowRefactorModal(false);
      setRefactorPrompt("");
    } catch (err: any) {
      setError(err.message || "Refactor failed.");
    } finally {
      setIsRefactoring(false);
    }
  };

  const handleAcceptRefactor = async () => {
    if (!diffProposal) return;
    try {
      setError("");
      const updated = await api.artefacts.update(id as string, diffProposal.originalId, {
        content: diffProposal.proposedContent
      });
      setArtefacts(prev => prev.map(a => a.id === updated.id ? updated : a));
      setActiveArtefact(updated);
      setDiffProposal(null);
    } catch (err: any) {
      setError(err.message || "Failed to save refactored code.");
    }
  };

  const handleRefineRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diffProposal || !refinePrompt.trim() || isRefining) return;
    try {
      setIsRefining(true);
      setError("");
      
      const refinedContextPrompt = `You previously proposed the following code changes, but the user requested further refinement:\n"${refinePrompt}"\n\nPlease generate a new proposal taking this feedback into account.`;
      
      const res = await api.artefacts.refactor(id as string, diffProposal.originalId, refinedContextPrompt);
      
      setDiffProposal({
        originalId: diffProposal.originalId,
        proposedContent: res.proposedContent,
        usage: res.usage
      });
      setRefinePrompt("");
    } catch (err: any) {
      setError(err.message || "Refinement failed.");
    } finally {
      setIsRefining(false);
    }
  };





  const handleStatusUpdate = async (newStatus: string) => {
    if (!activeArtefact) return;
    try {
      const updated = await api.artefacts.update(id as string, activeArtefact.id, { status: newStatus });
      setArtefacts(prev => prev.map(a => a.id === updated.id ? updated : a));
      setActiveArtefact(updated);
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setError("");
    try {
      const res = await api.projects.deployToGithub(id as string);
      if (res.success && res.repoUrl) {
        setDeployUrl(res.repoUrl);
      }
    } catch (err: any) {
      setError(err.message || "Failed to deploy to GitHub. Did you set your API token in Settings?");
    } finally {
      setDeploying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#06090F] p-6 pb-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          >
            <ArrowLeft className="h-4 w-4 text-slate-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              {project?.name ?? "Project"}
              {deployUrl && (
                <a href={deployUrl} target="_blank" rel="noreferrer" className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium ml-2 hover:bg-emerald-500/20 transition-colors flex items-center gap-1">
                  <GitBranch className="h-3 w-3" /> View Repo
                </a>
              )}
              {artefacts.length > 0 && (
                <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full font-medium ml-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {artefacts.reduce((sum, a) => sum + (a.metadata?.tokens?.totalTokens || 0), 0).toLocaleString()} Tokens
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">{project?.description}</p>
          </div>
        </div>
        <button
          onClick={handleDeploy}
          disabled={deploying}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitBranch className="h-4 w-4" />}
          {deploying ? "Deploying..." : "Push to GitHub"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm relative z-10">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-4 flex-1 min-h-0 relative z-10 -mx-6 px-6">
        {/* FAR LEFT: IDE Activity Bar */}
        <div className="w-14 flex-shrink-0 flex flex-col items-center gap-6 py-4 border-r border-white/5">
          <button className="p-2 text-white bg-blue-500/20 rounded-xl relative group">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
            <FileText className="h-5 w-5" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
            <GitBranch className="h-5 w-5" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
            <Blocks className="h-5 w-5" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors mt-auto">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* LEFT: Artefacts List (Explorer) */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-3 py-2">
          <div className="flex items-center justify-between px-2">
            <p className="text-xs font-semibold text-slate-400 tracking-wider">
              EXPLORER
            </p>
          </div>
          {artefacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-white/10 rounded-2xl bg-white/5 mx-2">
              <FileText className="h-5 w-5 text-slate-600 mb-2" />
              <p className="text-[11px] text-slate-500">No artefacts yet.</p>
            </div>
          ) : (
            <div className="space-y-0.5 overflow-y-auto pr-2 custom-scrollbar">
              {artefacts.map((art) => {
                const Icon = typeIcon[art.type] ?? FileText;
                const isActive = activeArtefact?.id === art.id;
                return (
                  <button
                    key={art.id}
                    onClick={() => setActiveArtefact(art)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all
                      ${isActive
                        ? "bg-blue-500/10 text-blue-300"
                        : "bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    <Icon className={`h-3.5 w-3.5 flex-shrink-0 transition-colors ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">
                        {art.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Main Panel */}
        <div className="flex-1 flex flex-col min-w-0 pb-4 pr-4">
          {activeArtefact ? (
            <div className="flex-1 bg-[#0B0F19]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
              
              {/* Fake Window Controls & Tabs */}
              <div className="flex items-center justify-between px-4 bg-[#0A0D14] border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2 py-3 pr-4 border-r border-white/5">
                    <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600"></div>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex">
                    <button 
                      onClick={() => setViewMode('code')}
                      className={`px-4 py-2.5 text-xs font-medium flex items-center gap-2 border-t-2 ${viewMode === 'code' ? 'text-blue-400 border-blue-500 bg-[#0B0F19]' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                      <FileCode2 className="h-3.5 w-3.5" /> 
                      {activeArtefact?.name || "Code"}
                    </button>
                    {(activeArtefact.type === 'code' || activeArtefact.type === 'diagram') && (
                      <button 
                        onClick={() => setViewMode('preview')}
                        className={`px-4 py-2.5 text-xs font-medium flex items-center gap-2 border-t-2 ${viewMode === 'preview' ? 'text-blue-400 border-blue-500 bg-[#0B0F19]' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                      >
                        <Play className="h-3.5 w-3.5" /> Preview
                      </button>
                    )}
                    <button 
                      onClick={() => setViewMode('terminal')}
                      className={`px-4 py-2.5 text-xs font-medium flex items-center gap-2 border-t-2 ${viewMode === 'terminal' ? 'text-blue-400 border-blue-500 bg-[#0B0F19]' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                      <TerminalIcon className="h-3.5 w-3.5" /> Terminal
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={restartEnvironment}
                    className="px-2.5 py-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1.5"
                    title="Restart Terminal & Dev Server"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>

                  <button onClick={() => setShowRefactorModal(true)} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5">
                    <Wand2 className="h-3.5 w-3.5" /> AI Refactor
                  </button>

                  {activeArtefact.status !== 'approved' && activeArtefact.status !== 'final' && (
                    <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-3">
                      <button 
                        onClick={() => handleStatusUpdate('rejected')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-lg text-xs font-medium transition-all"
                        title="Request Changes"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate('approved')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 rounded-lg text-xs font-medium transition-all"
                        title="Approve for next phase"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Editor / Preview Body */}
              <div className="flex-1 relative overflow-hidden bg-[#0A0D14]">
                <div className={`absolute inset-0 ${viewMode === 'code' ? 'block' : 'hidden'}`}>
                  <Editor
                    height="100%"
                    language={activeArtefact.type === 'code' ? 'javascript' : activeArtefact.type === 'srs' ? 'markdown' : 'json'}
                    theme="vs-dark"
                    value={activeArtefact.content}
                    options={{ readOnly: true, minimap: { enabled: false }, padding: { top: 16 } }}
                  />
                </div>
                
                <div className={`absolute inset-0 bg-[#0A0D14] ${viewMode === 'terminal' ? 'block' : 'hidden'}`}>
                  <div ref={terminalRef} className="w-full h-full p-4" />
                </div>
                
                <div className={`absolute inset-0 bg-white ${viewMode === 'preview' ? 'block' : 'hidden'}`}>
                  {previewUrl ? (
                    <iframe
                      className="w-full h-full border-none"
                      src={previewUrl}
                      title="Preview"
                      allow="cross-origin-isolated"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0B0F19] text-slate-400">
                       <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
                       <p className="font-medium text-white">Booting Environment...</p>
                       <p className="text-sm mt-2">Open the Terminal tab to view logs.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-[#0B0F19]/40 border border-dashed border-white/5 rounded-2xl flex items-center justify-center shadow-inner">
              <div className="text-center opacity-70">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <LayoutDashboard className="h-8 w-8 text-slate-500" />
                </div>
                <p className="font-medium text-slate-400">Select an artefact to view it</p>
                <p className="text-xs text-slate-500 mt-1">Or generate a new one using the AI agent panel below.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Pill Command Bar (Kapsul Melayang) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl z-40">
        <form onSubmit={handleGenerate} className="bg-[#0B0F19]/80 backdrop-blur-2xl rounded-full p-2 flex items-center shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10">
          
          {/* Subtle glowing orb inside the pill */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-full bg-blue-500/10 blur-[30px] rounded-full pointer-events-none"></div>
          
          {/* Agent Selector Dropup */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAgentDropdown(!showAgentDropdown)}
              className="flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-full hover:bg-white/5 border-r border-white/10 transition-colors relative z-10"
            >
              <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                {selectedAgent && (() => {
                  const Icon = ICON_MAP[selectedAgent.icon_name] || Bot;
                  return <Icon className="h-4 w-4" />;
                })()}
              </div>
              <span className="text-sm text-slate-200 font-medium whitespace-nowrap">{selectedAgent?.label || "Agent"}</span>
              <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${showAgentDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showAgentDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAgentDropdown(false)} />
                <div className="absolute bottom-full left-0 mb-3 w-56 bg-[#0B0F19] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="p-1.5 flex flex-col gap-0.5">
                    {agents.map((agent) => {
                      const Icon = ICON_MAP[agent.icon_name] || Bot;
                      const isSelected = selectedAgent?.id === agent.id;
                      return (
                        <button
                          key={agent.id}
                          type="button"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setShowAgentDropdown(false);
                          }}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                            isSelected ? "bg-blue-500/10 text-blue-400" : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{agent.label}</p>
                            <p className="text-[9px] truncate opacity-50">{agent.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Add Agent Button next to the picker */}
          <div className="flex gap-1 ml-1 mr-2 relative z-10">
            <button type="button" onClick={() => setShowMarketplaceModal(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-purple-400 hover:text-purple-300 transition-colors" title="Agent Marketplace">
              <ShoppingCart className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setShowAgentModal(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors" title="Create Custom Agent">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={`Tell the ${selectedAgent?.label || 'agent'} what to do...`}
            disabled={generating}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white text-sm px-3 placeholder:text-slate-500 outline-none disabled:opacity-50 relative z-10"
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pr-2 relative z-10">
            <button type="button" className="p-2 rounded-full text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              type="submit"
              disabled={generating || !prompt.trim()}
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:active:scale-100"
            >
              {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
            </button>
          </div>
        </form>
      </div>

      {/* Refactor Prompt Modal */}
      {showRefactorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F19] border border-white/10 rounded-2xl w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-blue-400" /> Refactor with AI
                </h2>
                <p className="text-xs text-slate-400 mt-1">Tell the AI how to modify this artefact.</p>
              </div>
              <button onClick={() => setShowRefactorModal(false)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleRefactorRequest} className="p-6 space-y-5">
              <textarea
                rows={4}
                value={refactorPrompt}
                onChange={e => setRefactorPrompt(e.target.value)}
                placeholder="e.g. Can you convert this to use Tailwind CSS?"
                className="w-full bg-[#121825] border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all resize-none"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowRefactorModal(false)} className="px-4 py-2 hover:bg-white/5 text-slate-300 text-sm font-medium rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isRefactoring || !refactorPrompt.trim()} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
                  {isRefactoring ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Refactoring"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diff Viewer Modal */}
      {diffProposal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-[#0B0F19] border border-white/10 rounded-2xl w-full h-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#06090F]/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-blue-400" /> Review Changes
              </h2>
              <div className="flex items-center gap-3">
                <button onClick={() => setDiffProposal(null)} className="px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium rounded-xl transition-colors">
                  Reject
                </button>
                <button onClick={handleAcceptRefactor} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-emerald-600/20">
                  <Check className="h-4 w-4" /> Accept Changes
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-[#1e1e1e] relative">
              {isRefining && (
                <div className="absolute inset-0 z-10 bg-[#1e1e1e]/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                  <p className="font-semibold text-lg text-slate-200">Refining changes...</p>
                  <p className="text-sm text-slate-400 mt-2">Applying your feedback to the code.</p>
                </div>
              )}
              <ReactDiffViewer
                oldValue={activeArtefact?.content || ""}
                newValue={diffProposal.proposedContent}
                splitView={true}
                useDarkTheme={true}
                leftTitle="Current Code"
                rightTitle="AI Proposed Code"
                styles={{
                  variables: { dark: { diffViewerBackground: '#1e1e1e', gutterBackground: '#1e1e1e' } }
                }}
              />
            </div>
            <div className="px-6 py-4 border-t border-white/5 bg-[#0B0F19] flex flex-col gap-4">
              <form onSubmit={handleRefineRequest} className="flex gap-3">
                <input
                  type="text"
                  value={refinePrompt}
                  onChange={e => setRefinePrompt(e.target.value)}
                  placeholder="Not quite right? Ask the AI to refine this code... (e.g., 'Make the button blue')"
                  disabled={isRefining}
                  className="flex-1 bg-[#121825] border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all disabled:opacity-50"
                />
                <button 
                  type="submit" 
                  disabled={isRefining || !refinePrompt.trim()} 
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors min-w-[120px] shadow-sm shadow-blue-900/20"
                >
                  {isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> Refine</>}
                </button>
              </form>
              
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">You can iteratively refine this proposal or accept/reject it.</p>
                {diffProposal.usage && (
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1" title="Prompt Tokens"><ArrowUp className="h-3 w-3 text-emerald-400" /> {diffProposal.usage.promptTokens}</span>
                    <span className="flex items-center gap-1" title="Completion Tokens"><ArrowLeft className="h-3 w-3 text-blue-400" /> {diffProposal.usage.completionTokens}</span>
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-500" /> {diffProposal.usage.totalTokens} Total</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Agent Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F19] border border-white/10 rounded-2xl w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-400" /> New Agent
                </h2>
                <p className="text-xs text-slate-400 mt-1">Create a specialized AI agent.</p>
              </div>
              <button onClick={() => setShowAgentModal(false)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                <XCircle className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateAgent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Agent Name</label>
                <input
                  type="text"
                  required
                  value={newAgent.label}
                  onChange={e => setNewAgent({ ...newAgent, label: e.target.value })}
                  placeholder="e.g., Code Architect"
                  className="w-full bg-[#121825] border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                <input
                  type="text"
                  value={newAgent.description}
                  onChange={e => setNewAgent({ ...newAgent, description: e.target.value })}
                  placeholder="Short description of capabilities"
                  className="w-full bg-[#121825] border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">System Prompt</label>
                <textarea
                  required
                  rows={4}
                  value={newAgent.system_prompt}
                  onChange={e => setNewAgent({ ...newAgent, system_prompt: e.target.value })}
                  placeholder="You are an expert software engineer..."
                  className="w-full bg-[#121825] border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all resize-none"
                />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={creatingAgent || !newAgent.label.trim() || !newAgent.system_prompt.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
                  {creatingAgent ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Marketplace Modal */}
      {showMarketplaceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F19] border border-white/10 rounded-2xl w-full max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#06090F]/50">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-purple-400" /> Agent Marketplace
                </h2>
                <p className="text-xs text-slate-400 mt-1">Discover and install specialized AI agents created by the community.</p>
              </div>
              <button onClick={() => setShowMarketplaceModal(false)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                <XCircle className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0B0F19]">
              {PRE_MADE_AGENTS.map((agent, i) => {
                const Icon = ICON_MAP[agent.icon_name] || Bot;
                // check if already installed by label
                const isInstalled = agents.some(a => a.label === agent.label);
                return (
                  <div key={i} className="bg-[#121825] border border-white/5 rounded-xl p-4 flex flex-col transition-all hover:border-purple-500/30 hover:bg-[#151b2a]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">{agent.label}</h3>
                          <p className="text-xs text-slate-400 capitalize">{agent.type} agent</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 mb-5 flex-1 leading-relaxed">{agent.description}</p>
                    <button 
                      onClick={() => handleInstallAgent(agent)}
                      disabled={isInstalled || installingAgentId === agent.label}
                      className={`w-full py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        isInstalled 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed' 
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm hover:shadow-purple-900/50'
                      }`}
                    >
                      {installingAgentId === agent.label ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        isInstalled ? <><Check className="h-4 w-4" /> Installed</> : <><Plus className="h-4 w-4" /> Install</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
