/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, FileText, Code2, GitBranch, Rocket,
  TestTube, Sparkles, Send, Loader2, ChevronDown,
  Clock, CheckCircle2, FileCode2, AlertCircle, XCircle, Check, Zap
} from "lucide-react";
import { api } from "@/lib/api";

const AGENTS = [
  { id: "ideator",     label: "Ideator",    description: "Generate ideas & requirements",    icon: Sparkles,  type: "srs" },
  { id: "documenter",  label: "Documenter", description: "Write SRS & documentation",        icon: FileText,  type: "srs" },
  { id: "diagrammer",  label: "Diagrammer", description: "Create UML & Mermaid diagrams",    icon: GitBranch, type: "diagram" },
  { id: "code-generator", label: "Coder",   description: "Generate source code",             icon: Code2,     type: "code" },
  { id: "deployer",    label: "Deployer",   description: "Generate deployment config",        icon: Rocket,    type: "deployment" },
  { id: "reviewer",   label: "Reviewer",   description: "Review & validate artefacts",       icon: TestTube,  type: "test" },
];

const typeIcon: Record<string, any> = {
  srs: FileText, diagram: GitBranch, code: FileCode2,
  deployment: Rocket, test: TestTube,
};

const statusIcon: Record<string, any> = {
  draft:    Clock,
  approved: CheckCircle2,
  final:    CheckCircle2,
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject]       = useState<any>(null);
  const [artefacts, setArtefacts]   = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [error, setError]           = useState("");
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [prompt, setPrompt]         = useState("");
  const [activeArtefact, setActiveArtefact] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const fetchIt = async () => {
      try {
        const [proj, arts] = await Promise.all([
          api.projects.get(id as string),
          api.artefacts.list(id as string),
        ]);
        if (mounted) {
          setProject(proj);
          setArtefacts(arts || []);
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
    return () => { mounted = false; };
  }, [id]);

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
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl transition-all"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400" />
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
          className="flex items-center gap-2 px-4 py-2 bg-[#0B0F19] hover:bg-white/5 border border-white/10 text-slate-200 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitBranch className="h-4 w-4" />}
          {deploying ? "Deploying..." : "Push to GitHub"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-6 flex-1 min-h-0">
        {/* LEFT: Artefacts List (File Tree Style) */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              Artefacts ({artefacts.length})
            </p>
          </div>
          {artefacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
              <FileText className="h-6 w-6 text-slate-600 mb-2" />
              <p className="text-xs text-slate-500">No artefacts yet.<br />Generate one using an agent.</p>
            </div>
          ) : (
            <div className="space-y-0.5 overflow-y-auto pr-2">
              {artefacts.map((art) => {
                const Icon = typeIcon[art.type] ?? FileText;
                const isActive = activeArtefact?.id === art.id;
                return (
                  <button
                    key={art.id}
                    onClick={() => setActiveArtefact(art)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all relative group
                      ${isActive
                        ? "bg-blue-500/10 text-blue-300"
                        : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-1/2 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    )}
                    <Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {art.name}
                      </p>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Main Panel */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {/* Premium Code Editor / Viewer */}
          {activeArtefact ? (
            <div className="flex-1 bg-[#0B0F19]/90 border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
              {/* Fake Window Controls Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#06090F] border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-white/5 px-3 py-1 rounded-md">
                    <FileCode2 className="h-3 w-3" />
                    <span>{activeArtefact.name}.{activeArtefact.format || 'md'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {activeArtefact.status !== 'approved' && activeArtefact.status !== 'final' && (
                    <div className="flex items-center gap-1.5 mr-2">
                      <button 
                        onClick={() => handleStatusUpdate('rejected')}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-lg text-xs font-medium transition-all"
                        title="Request Changes"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate('approved')}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 rounded-lg text-xs font-medium transition-all"
                        title="Approve for next phase"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </button>
                    </div>
                  )}
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                    activeArtefact.status === 'approved' || activeArtefact.status === 'final' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : activeArtefact.status === 'rejected'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {activeArtefact.status}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-full">
                    {activeArtefact.generated_by}
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
                <pre className="text-sm text-slate-300 leading-loose whitespace-pre-wrap font-mono tracking-wide">
                  {activeArtefact.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#0B0F19]/40 border border-dashed border-white/5 rounded-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-slate-500" />
                </div>
                <p className="text-base text-slate-300 font-medium">Select an artefact to view it</p>
                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">Or generate a new one using the AI agent panel below.</p>
              </div>
            </div>
          )}

          {/* Generator Panel */}
          <form onSubmit={handleGenerate} className="bg-[#0B0F19]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-lg relative overflow-hidden">
            {/* Subtle glow in the background of the form */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[300px] h-20 bg-blue-500/10 blur-[50px] pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-3 relative z-10">
              {/* Premium Agent Picker */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-sm text-white transition-colors group"
                  onClick={() => {
                    const next = AGENTS[(AGENTS.findIndex(a => a.id === selectedAgent.id) + 1) % AGENTS.length];
                    setSelectedAgent(next);
                  }}
                >
                  <selectedAgent.icon className="h-3.5 w-3.5 text-blue-400" />
                  <span className="font-medium">{selectedAgent.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {selectedAgent.description}
              </p>
            </div>

            <div className="flex gap-3 items-end relative z-10">
              <div className="flex-1 relative">
                <textarea
                  rows={2}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder={`Tell the ${selectedAgent.label} agent what to do...`}
                  disabled={generating}
                  className="w-full bg-[#06090F] border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all resize-none disabled:opacity-50"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(e as any); } }}
                />
                <button
                  type="submit"
                  disabled={generating || !prompt.trim()}
                  className="absolute right-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-slate-600 text-white rounded-lg transition-all"
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2.5 font-medium uppercase tracking-wider relative z-10">Press <kbd className="font-sans px-1 py-0.5 bg-white/5 border border-white/5 rounded mx-0.5">Enter</kbd> to generate · <kbd className="font-sans px-1 py-0.5 bg-white/5 border border-white/5 rounded mx-0.5">Shift+Enter</kbd> for new line</p>
          </form>
        </div>
      </div>
    </div>
  );
}
