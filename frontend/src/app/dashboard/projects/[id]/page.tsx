/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, FileText, Code2, GitBranch, Rocket,
  TestTube, Sparkles, Send, Loader2, ChevronDown,
  Clock, CheckCircle2, FileCode2, AlertCircle, XCircle, Check, Zap, Bot, Plus, Wand2, X, Play, ArrowUp, Paperclip, LayoutDashboard, Terminal as TerminalIcon, RefreshCw, Brain, ShoppingCart, Blocks, Settings, Save} from "lucide-react";
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
  
  // IDE State
  const [editableContent, setEditableContent] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingCode, setSavingCode] = useState(false);

  // WebContainer Hook
  const { terminalRef, previewUrl, isWcReady, restartEnvironment, syncCode } = useWebContainer(viewMode, activeArtefact);

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
  
  // Magic Build State
  const [showMagicBuildModal, setShowMagicBuildModal] = useState(false);
  const [magicBuildPrompt, setMagicBuildPrompt] = useState("");
  const [isMagicBuilding, setIsMagicBuilding] = useState(false);
  const [magicBuildProgress, setMagicBuildProgress] = useState<{status: string, currentPhase: number, message: string} | null>(null);

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
            const newArt = payload.new as any;
            setArtefacts((prev) => {
              if (prev.find(a => a.id === newArt.id)) return prev;
              return [newArt, ...prev];
            });
            
            // Auto-advance magic build progress tracker
            setMagicBuildProgress(prev => {
              if (!prev || prev.status === 'done') return prev;
              if (newArt.type === 'srs') {
                return { status: 'running', currentPhase: 2, message: 'Generating Architecture Diagram...' };
              } else if (newArt.type === 'diagram') {
                return { status: 'running', currentPhase: 3, message: 'Writing Backend & Frontend Code...' };
              } else if (newArt.type === 'code') {
                // Auto-hide after 5 seconds
                setTimeout(() => setMagicBuildProgress(null), 5000);
                return { status: 'done', currentPhase: 4, message: 'Magic Build Complete! You can preview the code now.' };
              }
              return prev;
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

  useEffect(() => {
    if (activeArtefact) {
      setEditableContent(activeArtefact.content || "");
      setHasUnsavedChanges(false);
    }
  }, [activeArtefact]);

  const handleSaveArtefact = async () => {
    if (!activeArtefact || !hasUnsavedChanges) return;
    setSavingCode(true);
    try {
      const updated = await api.artefacts.update(id as string, activeArtefact.id, { content: editableContent });
      setArtefacts(prev => prev.map(a => a.id === updated.id ? updated : a));
      setActiveArtefact(updated);
      setHasUnsavedChanges(false);
      // Sync to WC if it's code
      if (activeArtefact.type === 'code') {
        syncCode(editableContent);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setSavingCode(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveArtefact();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, editableContent, activeArtefact]);



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





  const handleMagicBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicBuildPrompt.trim() || isMagicBuilding) return;
    try {
      setIsMagicBuilding(true);
      setError("");
      setMagicBuildProgress({ status: 'running', currentPhase: 1, message: 'Analyzing requirements and drafting SRS...' });
      await api.artefacts.magicBuild(id as string, magicBuildPrompt);
      setShowMagicBuildModal(false);
      setMagicBuildPrompt("");
    } catch (err: any) {
      setError(err.message || "Magic Build failed.");
      setMagicBuildProgress(null);
    } finally {
      setIsMagicBuilding(false);
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
    <div className="flex flex-col h-full bg-[#f7f3ee] p-6 pb-24 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#181818]/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Floating Magic Build Progress */}
      {magicBuildProgress && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#181818] text-[#f7f3ee] px-6 py-4 rounded-[12px] shadow-[0_8px_30px_rgba(24,24,24,0.12)] flex items-center gap-4 z-50 border border-[#181818]/30">
          {magicBuildProgress.status === 'running' ? (
            <Loader2 className="h-6 w-6 animate-spin text-[#f7f3ee]/80" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          )}
          <div>
            <p className="text-[15px] font-semibold">Magic Build: Phase {magicBuildProgress.currentPhase}/4</p>
            <p className="text-[13px] text-[#f7f3ee]/70 mt-0.5">{magicBuildProgress.message}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 bg-white hover:bg-[#f7f3ee] border border-[#181818]/20 rounded-[8px] transition-all shadow-sm text-[#181818]/60 hover:text-[#181818]/90"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#181818] tracking-tight flex items-center gap-2">
              {project?.name ?? "Project"}
              {deployUrl && (
                <a href={deployUrl} target="_blank" rel="noreferrer" className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-100 rounded-full font-bold ml-2 hover:bg-emerald-100 transition-colors flex items-center gap-1 shadow-sm">
                  <GitBranch className="h-3 w-3" /> View Repo
                </a>
              )}
              {artefacts.length > 0 && (
                <span className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full font-bold ml-1 flex items-center gap-1 shadow-sm">
                  <Zap className="h-3 w-3" /> {artefacts.reduce((sum, a) => sum + (a.metadata?.tokens?.totalTokens || 0), 0).toLocaleString()} Tokens
                </span>
              )}
            </h1>
            <p className="text-sm text-[#181818]/60 mt-0.5 font-medium">{project?.description}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowMagicBuildModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-[#f7f3ee] text-sm font-bold rounded-[8px] transition-all shadow-md hover:-translate-y-0.5 relative group"
          >
            <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity rounded-[8px] pointer-events-none" />
            <Wand2 className="h-4 w-4 relative z-10" />
            <span className="relative z-10">Magic Build</span>
          </button>
          
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#f7f3ee] border border-[#181818]/20 text-[#181818]/80 text-sm font-bold rounded-[8px] transition-colors shadow-sm disabled:opacity-50"
          >
            {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitBranch className="h-4 w-4" />}
            {deploying ? "Deploying..." : "Push to GitHub"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-[8px] text-red-400 text-sm relative z-10">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-4 flex-1 min-h-0 relative z-10 -mx-6 px-6">
        {/* FAR LEFT: IDE Activity Bar */}
        <div className="w-14 flex-shrink-0 flex flex-col items-center gap-6 py-4 bg-[#f7f3ee] border border-[#181818]/20 rounded-[12px] shadow-sm">
          <button className="p-2 text-[#181818] bg-[#181818]/10/50 rounded-[8px] relative group">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#181818] rounded-r-full" />
            <FileText className="h-5 w-5" />
          </button>
          <button className="p-2 text-[#181818]/40 hover:text-[#181818]/70 transition-colors">
            <GitBranch className="h-5 w-5" />
          </button>
          <button className="p-2 text-[#181818]/40 hover:text-[#181818]/70 transition-colors">
            <Blocks className="h-5 w-5" />
          </button>
          <button className="p-2 text-[#181818]/40 hover:text-[#181818]/70 transition-colors mt-auto">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* LEFT: Artefacts List (Explorer) */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-3 py-2 bg-[#f7f3ee] border border-[#181818]/20 rounded-[12px] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-[#181818]/20">
            <p className="text-xs font-bold text-[#181818]/60 tracking-wider">
              EXPLORER
            </p>
          </div>
          {artefacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center mx-4">
              <FileText className="h-5 w-5 text-[#181818]/40 mb-2" />
              <p className="text-[11px] text-[#181818]/60 font-medium">No artefacts yet.</p>
            </div>
          ) : (
            <div className="space-y-1 overflow-y-auto px-2 custom-scrollbar pb-2">
              {artefacts.map((art) => {
                const Icon = typeIcon[art.type] ?? FileText;
                const isActive = activeArtefact?.id === art.id;
                return (
                  <button
                    key={art.id}
                    onClick={() => setActiveArtefact(art)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-left transition-all
                      ${isActive
                        ? "bg-[#181818]/10 text-[#181818] shadow-sm"
                        : "bg-transparent hover:bg-[#181818]/5 text-[#181818]/70"
                      }`}
                  >
                    <Icon className={`h-3.5 w-3.5 flex-shrink-0 transition-colors ${isActive ? "text-[#181818]" : "text-[#181818]/40"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate">
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
        <div className="flex-1 flex flex-col min-w-0 pb-4">
          {activeArtefact ? (
            <div className="flex-1 bg-white border border-[#181818]/20 rounded-[12px] overflow-hidden flex flex-col shadow-sm relative">
              
              {/* Fake Window Controls & Tabs */}
              <div className="flex items-center justify-between px-4 bg-[#f7f3ee] border-b border-[#181818]/20">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2 py-3 pr-4 border-r border-[#181818]/20">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex pt-1">
                    <button 
                      onClick={() => setViewMode('code')}
                      className={`px-4 py-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${viewMode === 'code' ? 'text-[#181818] border-blue-600 bg-white' : 'text-[#181818]/60 border-transparent hover:text-[#181818]/80 hover:bg-[#181818]/5 rounded-t-lg'}`}
                    >
                      <FileCode2 className="h-3.5 w-3.5" /> 
                      {activeArtefact?.name || "Code"}
                    </button>
                    {(activeArtefact.type === 'code' || activeArtefact.type === 'diagram') && (
                      <button 
                        onClick={() => setViewMode('preview')}
                        className={`px-4 py-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${viewMode === 'preview' ? 'text-[#181818] border-blue-600 bg-white' : 'text-[#181818]/60 border-transparent hover:text-[#181818]/80 hover:bg-[#181818]/5 rounded-t-lg'}`}
                      >
                        <Play className="h-3.5 w-3.5" /> Preview
                      </button>
                    )}
                    <button 
                      onClick={() => setViewMode('terminal')}
                      className={`px-4 py-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${viewMode === 'terminal' ? 'text-[#181818] border-blue-600 bg-white' : 'text-[#181818]/60 border-transparent hover:text-[#181818]/80 hover:bg-[#181818]/5 rounded-t-lg'}`}
                    >
                      <TerminalIcon className="h-3.5 w-3.5" /> Terminal
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {hasUnsavedChanges && (
                    <button 
                      onClick={handleSaveArtefact}
                      disabled={savingCode}
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                    >
                      {savingCode ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} 
                      Save (Ctrl+S)
                    </button>
                  )}

                  <button 
                    onClick={restartEnvironment}
                    className="px-2.5 py-1.5 hover:bg-slate-200 text-[#181818]/60 hover:text-[#181818]/90 rounded-lg transition-colors flex items-center gap-1.5"
                    title="Restart Terminal & Dev Server"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>

                  <button onClick={() => setShowRefactorModal(true)} className="px-3 py-1.5 bg-[#181818]/5 hover:bg-[#181818]/10 border border-[#181818]/30 text-[#181818] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                    <Wand2 className="h-3.5 w-3.5" /> AI Refactor
                  </button>

                  {activeArtefact.status !== 'approved' && activeArtefact.status !== 'final' && (
                    <div className="flex items-center gap-1.5 ml-2 border-l border-[#181818]/20 pl-3">
                      <button 
                        onClick={() => handleStatusUpdate('rejected')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                        title="Request Changes"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate('approved')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                        title="Approve for next phase"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Editor / Preview Body */}
              <div className="flex-1 relative overflow-hidden bg-white">
                <div className={`absolute inset-0 ${viewMode === 'code' ? 'block' : 'hidden'}`}>
                  <Editor
                    height="100%"
                    language={activeArtefact.type === 'code' ? 'javascript' : activeArtefact.type === 'srs' ? 'markdown' : 'json'}
                    theme="vs-dark"
                    value={editableContent}
                    onChange={(val) => {
                      setEditableContent(val || "");
                      setHasUnsavedChanges(true);
                    }}
                    options={{ readOnly: false, minimap: { enabled: false }, padding: { top: 16 } }}
                  />
                </div>
                
                <div className={`absolute inset-0 bg-slate-900 ${viewMode === 'terminal' ? 'block' : 'hidden'}`}>
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
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#f7f3ee] text-[#181818]/60">
                       <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#181818]" />
                       <p className="font-bold text-[#181818]/90">Booting Environment...</p>
                       <p className="text-sm mt-2 font-medium">Open the Terminal tab to view logs.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white border border-[#181818]/20 rounded-[12px] flex items-center justify-center shadow-sm">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#f7f3ee] border border-[#181818]/10 rounded-[12px] flex items-center justify-center mx-auto mb-4">
                  <LayoutDashboard className="h-8 w-8 text-[#181818]/40" />
                </div>
                <p className="font-bold text-[#181818]/80">Select an artefact to view it</p>
                <p className="text-sm text-[#181818]/60 mt-1 font-medium">Or generate a new one using the AI agent panel below.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Pill Command Bar (Kapsul Melayang) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl z-40">
        <form onSubmit={handleGenerate} className="bg-white/90 backdrop-blur-2xl rounded-full p-2 flex items-center shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#181818]/20">
          
          {/* Subtle glowing orb inside the pill */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-full bg-[#181818]/10 blur-[30px] rounded-full pointer-events-none"></div>
          
          {/* Agent Selector Dropup */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAgentDropdown(!showAgentDropdown)}
              className="flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-full hover:bg-[#181818]/5 border-r border-[#181818]/20 transition-colors relative z-10"
            >
              <div className="w-7 h-7 rounded-full bg-[#181818]/5 border border-[#181818]/20 flex items-center justify-center text-[#181818]">
                {selectedAgent && (() => {
                  const Icon = ICON_MAP[selectedAgent.icon_name] || Bot;
                  return <Icon className="h-4 w-4" />;
                })()}
              </div>
              <span className="text-sm text-slate-200 font-medium whitespace-nowrap">{selectedAgent?.label || "Agent"}</span>
              <ChevronDown className={`h-4 w-4 text-[#181818]/60 transition-transform ${showAgentDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showAgentDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAgentDropdown(false)} />
                <div className="absolute bottom-full left-0 mb-3 w-56 bg-white border border-[#181818]/20 rounded-[12px] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
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
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-left transition-colors ${
                            isSelected ? "bg-[#181818]/5 text-[#181818]" : "hover:bg-[#f7f3ee] text-[#181818]/70 hover:text-[#181818]"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{agent.label}</p>
                            <p className="text-[9px] font-medium truncate text-[#181818]/40">{agent.description}</p>
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
            <button type="button" onClick={() => setShowMarketplaceModal(true)} className="p-2 hover:bg-[#181818]/5 rounded-full text-[#181818] transition-colors" title="Agent Marketplace">
              <ShoppingCart className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setShowAgentModal(true)} className="p-2 hover:bg-[#181818]/5 rounded-full text-[#181818]/40 hover:text-[#181818]/70 transition-colors" title="Create Custom Agent">
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
            className="flex-1 bg-transparent border-none focus:ring-0 text-[#181818] font-medium text-sm px-3 placeholder:text-[#181818]/40 outline-none disabled:opacity-50 relative z-10"
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pr-2 relative z-10">
            <button type="button" className="p-2 rounded-full text-[#181818]/40 hover:text-[#181818]/70 hover:bg-[#181818]/5 transition-colors">
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              type="submit"
              disabled={generating || !prompt.trim()}
              className="w-10 h-10 rounded-full bg-[#181818] text-[#f7f3ee] flex items-center justify-center hover:bg-[#2a2a2a] transition-all active:scale-95 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:active:scale-100"
            >
              {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
            </button>
          </div>
        </form>
      </div>

      {/* Refactor Prompt Modal */}
      {showRefactorModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#181818]/20 rounded-[12px] w-full max-w-lg shadow-[0_8px_30px_rgba(24,24,24,0.06)] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#181818]/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#181818] flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-[#181818]" /> Refactor with AI
                </h2>
                <p className="text-xs text-[#181818]/60 mt-1 font-medium">Tell the AI how to modify this artefact.</p>
              </div>
              <button onClick={() => setShowRefactorModal(false)} className="p-1.5 hover:bg-[#181818]/5 rounded-lg transition-colors">
                <X className="h-5 w-5 text-[#181818]/40" />
              </button>
            </div>
            <form onSubmit={handleRefactorRequest} className="p-6 space-y-5">
              <textarea
                rows={4}
                value={refactorPrompt}
                onChange={e => setRefactorPrompt(e.target.value)}
                placeholder="e.g. Can you convert this to use Tailwind CSS?"
                className="w-full bg-[#f7f3ee] border border-[#181818]/20 focus:bg-white focus:border-[#181818] focus:ring-1 focus:ring-[#181818] rounded-[8px] px-4 py-3 text-sm text-[#181818] placeholder-slate-400 font-medium outline-none transition-all resize-none"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowRefactorModal(false)} className="px-4 py-2 hover:bg-[#181818]/5 text-[#181818]/70 text-sm font-bold rounded-[8px] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isRefactoring || !refactorPrompt.trim()} className="flex items-center gap-2 px-5 py-2 bg-[#181818] hover:bg-[#2a2a2a] disabled:opacity-60 text-[#f7f3ee] text-sm font-bold rounded-[8px] transition-colors shadow-sm">
                  {isRefactoring ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Refactoring"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diff Viewer Modal */}
      {diffProposal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white border border-[#181818]/20 rounded-[12px] w-full h-full max-h-[90vh] shadow-[0_8px_30px_rgba(24,24,24,0.06)] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#181818]/10 flex items-center justify-between bg-[#f7f3ee]">
              <h2 className="text-lg font-bold text-[#181818] flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-[#181818]" /> Review Changes
              </h2>
              <div className="flex items-center gap-3">
                <button onClick={() => setDiffProposal(null)} className="px-4 py-2 border border-[#181818]/20 hover:bg-[#181818]/5 text-[#181818]/70 text-sm font-bold rounded-[8px] transition-colors">
                  Reject
                </button>
                <button onClick={handleAcceptRefactor} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-[#f7f3ee] text-sm font-bold rounded-[8px] transition-colors shadow-md shadow-emerald-600/20">
                  <Check className="h-4 w-4" /> Accept Changes
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-[#1e1e1e] relative">
              {isRefining && (
                <div className="absolute inset-0 z-10 bg-[#1e1e1e]/60 backdrop-blur-sm flex flex-col items-center justify-center text-[#f7f3ee]">
                  <Loader2 className="h-10 w-10 animate-spin text-[#181818]/80 mb-4" />
                  <p className="font-semibold text-lg text-slate-200">Refining changes...</p>
                  <p className="text-sm text-[#181818]/40 mt-2">Applying your feedback to the code.</p>
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
            <div className="px-6 py-4 border-t border-[#181818]/20 bg-[#f7f3ee] flex flex-col gap-4">
              <form onSubmit={handleRefineRequest} className="flex gap-3">
                <input
                  type="text"
                  value={refinePrompt}
                  onChange={e => setRefinePrompt(e.target.value)}
                  placeholder="Not quite right? Ask the AI to refine this code... (e.g., 'Make the button blue')"
                  disabled={isRefining}
                  className="flex-1 bg-white border border-[#181818]/20 focus:border-[#181818] focus:ring-1 focus:ring-[#181818] rounded-[8px] px-4 py-2.5 text-sm font-medium text-[#181818] placeholder-slate-400 outline-none transition-all disabled:opacity-50"
                />
                <button 
                  type="submit" 
                  disabled={isRefining || !refinePrompt.trim()} 
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#181818] hover:bg-[#2a2a2a] disabled:opacity-50 text-[#f7f3ee] text-sm font-bold rounded-[8px] transition-colors min-w-[120px] shadow-sm shadow-blue-900/20"
                >
                  {isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> Refine</>}
                </button>
              </form>
              
              <div className="flex justify-between items-center">
                <p className="text-xs font-medium text-[#181818]/60">You can iteratively refine this proposal or accept/reject it.</p>
                {diffProposal.usage && (
                  <div className="flex items-center gap-4 text-xs font-bold text-[#181818]/40">
                    <span className="flex items-center gap-1" title="Prompt Tokens"><ArrowUp className="h-3 w-3 text-emerald-500" /> {diffProposal.usage.promptTokens}</span>
                    <span className="flex items-center gap-1" title="Completion Tokens"><ArrowLeft className="h-3 w-3 text-[#181818]/80" /> {diffProposal.usage.completionTokens}</span>
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500" /> {diffProposal.usage.totalTokens} Total</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Agent Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#181818]/20 rounded-[12px] w-full max-w-md shadow-[0_8px_30px_rgba(24,24,24,0.06)] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#181818]/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#181818] flex items-center gap-2">
                  <Bot className="h-5 w-5 text-[#181818]" /> New Agent
                </h2>
                <p className="text-xs text-[#181818]/60 mt-1 font-medium">Create a specialized AI agent.</p>
              </div>
              <button onClick={() => setShowAgentModal(false)} className="p-1.5 hover:bg-[#181818]/5 rounded-lg transition-colors">
                <XCircle className="h-5 w-5 text-[#181818]/40" />
              </button>
            </div>
            <form onSubmit={handleCreateAgent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#181818]/80 mb-1.5">Agent Name</label>
                <input
                  type="text"
                  required
                  value={newAgent.label}
                  onChange={e => setNewAgent({ ...newAgent, label: e.target.value })}
                  placeholder="e.g., Code Architect"
                  className="w-full bg-[#f7f3ee] border border-[#181818]/20 focus:bg-white focus:border-[#181818] focus:ring-1 focus:ring-[#181818] rounded-[8px] px-4 py-2.5 text-sm font-medium text-[#181818] placeholder-slate-400 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#181818]/80 mb-1.5">Description</label>
                <input
                  type="text"
                  value={newAgent.description}
                  onChange={e => setNewAgent({ ...newAgent, description: e.target.value })}
                  placeholder="Short description of capabilities"
                  className="w-full bg-[#f7f3ee] border border-[#181818]/20 focus:bg-white focus:border-[#181818] focus:ring-1 focus:ring-[#181818] rounded-[8px] px-4 py-2.5 text-sm font-medium text-[#181818] placeholder-slate-400 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#181818]/80 mb-1.5">System Prompt</label>
                <textarea
                  required
                  rows={4}
                  value={newAgent.system_prompt}
                  onChange={e => setNewAgent({ ...newAgent, system_prompt: e.target.value })}
                  placeholder="You are an expert software engineer..."
                  className="w-full bg-[#f7f3ee] border border-[#181818]/20 focus:bg-white focus:border-[#181818] focus:ring-1 focus:ring-[#181818] rounded-[8px] px-4 py-3 text-sm font-medium text-[#181818] placeholder-slate-400 outline-none transition-all resize-none"
                />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={creatingAgent || !newAgent.label.trim() || !newAgent.system_prompt.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#181818] hover:bg-[#2a2a2a] disabled:opacity-60 text-[#f7f3ee] text-sm font-bold rounded-[8px] transition-colors shadow-sm">
                  {creatingAgent ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Marketplace Modal */}
      {showMarketplaceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#181818]/20 rounded-[12px] w-full max-w-2xl shadow-[0_8px_30px_rgba(24,24,24,0.06)] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-5 border-b border-[#181818]/10 flex items-center justify-between bg-[#f7f3ee]">
              <div>
                <h2 className="text-lg font-bold text-[#181818] flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-[#181818]" /> Agent Marketplace
                </h2>
                <p className="text-xs text-[#181818]/60 mt-1 font-medium">Discover and install specialized AI agents created by the community.</p>
              </div>
              <button onClick={() => setShowMarketplaceModal(false)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                <XCircle className="h-5 w-5 text-[#181818]/60" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
              {PRE_MADE_AGENTS.map((agent, i) => {
                const Icon = ICON_MAP[agent.icon_name] || Bot;
                // check if already installed by label
                const isInstalled = agents.some(a => a.label === agent.label);
                return (
                  <div key={i} className="bg-white border border-[#181818]/20 rounded-[8px] p-4 flex flex-col transition-all hover:border-blue-300 hover:shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[8px] bg-[#181818]/5 flex items-center justify-center text-[#181818] border border-[#181818]/20">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#181818]">{agent.label}</h3>
                          <p className="text-xs text-[#181818]/60 font-medium capitalize">{agent.type} agent</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#181818]/70 mb-5 flex-1 font-medium leading-relaxed">{agent.description}</p>
                    <button 
                      onClick={() => handleInstallAgent(agent)}
                      disabled={isInstalled || installingAgentId === agent.label}
                      className={`w-full py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        isInstalled 
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-200 cursor-not-allowed' 
                          : 'bg-[#181818] hover:bg-[#2a2a2a] text-[#f7f3ee] shadow-sm hover:shadow-blue-900/20'
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

      {/* Magic Build Modal */}
      {showMagicBuildModal && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#181818]/20 rounded-[12px] w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-[#181818]/10 blur-[60px] pointer-events-none" />
            <div className="px-6 py-5 border-b border-[#181818]/10 flex items-center justify-between relative z-10 bg-[#f7f3ee]/50">
              <div>
                <h2 className="text-lg font-bold text-[#181818] flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-[#181818]" /> Magic Build
                </h2>
                <p className="text-xs text-[#181818]/60 mt-1 font-medium">AI will automatically plan, architect, and code your app.</p>
              </div>
              <button onClick={() => setShowMagicBuildModal(false)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                <X className="h-5 w-5 text-[#181818]/40" />
              </button>
            </div>
            <form onSubmit={handleMagicBuild} className="p-6 space-y-5 relative z-10">
              <textarea
                rows={4}
                value={magicBuildPrompt}
                onChange={e => setMagicBuildPrompt(e.target.value)}
                placeholder="Describe your app. E.g., 'A simple calculator app with a modern light theme and history log.'"
                className="w-full bg-[#f7f3ee] border border-[#181818]/20 focus:border-[#181818] focus:ring-1 focus:ring-[#181818] rounded-[8px] px-4 py-3 text-sm font-medium text-[#181818] placeholder-slate-400 outline-none transition-all resize-none"
              />
              
              {magicBuildProgress && (
                <div className="p-4 bg-[#181818]/5 border border-[#181818]/20 rounded-[8px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-blue-900">Pipeline Progress</span>
                    <span className="text-xs font-bold text-[#181818]">{magicBuildProgress.currentPhase} / 4</span>
                  </div>
                  <div className="w-full bg-[#181818]/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#181818] h-full transition-all duration-500 ease-out"
                      style={{ width: `${(magicBuildProgress.currentPhase / 4) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#181818] mt-2 font-medium flex items-center gap-2">
                    {magicBuildProgress.status === 'running' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    {magicBuildProgress.message}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-[#181818]/10 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowMagicBuildModal(false)} 
                  className="px-4 py-2 hover:bg-[#181818]/5 text-[#181818]/70 text-sm font-bold rounded-[8px] transition-colors"
                >
                  Close
                </button>
                <button 
                  type="submit" 
                  disabled={magicBuildProgress?.status === 'running' || !magicBuildPrompt.trim()} 
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#181818] to-[#2a2a2a] hover:from-[#2a2a2a] hover:to-[#3a3a3a] disabled:opacity-60 text-[#f7f3ee] text-sm font-bold rounded-[8px] transition-all shadow-md"
                >
                  {magicBuildProgress?.status === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  {magicBuildProgress?.status === 'running' ? "Building..." : "Start Magic Build"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
