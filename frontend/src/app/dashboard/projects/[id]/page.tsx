"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, FileText, Code2, GitBranch, Rocket,
  TestTube, Sparkles, Send, Loader2, ChevronDown,
  Clock, CheckCircle2, FileCode2, AlertCircle,
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
  const [error, setError]           = useState("");
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [prompt, setPrompt]         = useState("");
  const [activeArtefact, setActiveArtefact] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [proj, arts] = await Promise.all([
        api.projects.get(id),
        api.artefacts.list(id),
      ]);
      setProject(proj);
      setArtefacts(arts || []);
    } catch (err: any) {
      setError(err.message || "Failed to load project.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || generating) return;
    try {
      setGenerating(true);
      setError("");
      const result = await api.artefacts.generate(id, {
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
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-slate-400" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-slate-100">
            {project?.name ?? "Project"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{project?.description}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-6 flex-1 min-h-0">
        {/* LEFT: Artefacts List */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            Artefacts ({artefacts.length})
          </p>
          {artefacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-700 rounded-xl">
              <FileText className="h-6 w-6 text-slate-600 mb-2" />
              <p className="text-xs text-slate-500">No artefacts yet.<br />Generate one using an agent.</p>
            </div>
          ) : (
            <div className="space-y-1 overflow-y-auto">
              {artefacts.map((art) => {
                const Icon = typeIcon[art.type] ?? FileText;
                const StatusIcon = statusIcon[art.status] ?? Clock;
                const isActive = activeArtefact?.id === art.id;
                return (
                  <button
                    key={art.id}
                    onClick={() => setActiveArtefact(art)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                      ${isActive
                        ? "bg-blue-600/15 border border-blue-500/30"
                        : "hover:bg-slate-800/60 border border-transparent"
                      }`}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isActive ? "text-blue-300" : "text-slate-300"}`}>
                        {art.name}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">{art.type}</p>
                    </div>
                    <StatusIcon className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Main Panel */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Active Artefact Viewer */}
          {activeArtefact ? (
            <div className="flex-1 bg-slate-800/40 border border-slate-700/60 rounded-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60">
                <div>
                  <p className="text-sm font-medium text-slate-200">{activeArtefact.name}</p>
                  <p className="text-xs text-slate-400 capitalize">
                    Generated by {activeArtefact.generated_by} · {activeArtefact.format}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-slate-700/60 text-slate-400 rounded-full capitalize">
                  {activeArtefact.status}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <pre className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
                  {activeArtefact.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-800/20 border border-dashed border-slate-700 rounded-xl">
              <div className="text-center">
                <Sparkles className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">Select an artefact to view it</p>
                <p className="text-xs text-slate-500 mt-1">Or generate a new one using the panel below.</p>
              </div>
            </div>
          )}

          {/* Generator Panel */}
          <form onSubmit={handleGenerate} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
            <div className="flex gap-3 mb-3">
              {/* Agent Picker */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-sm text-slate-200 transition-colors group"
                  onClick={() => {
                    const next = AGENTS[(AGENTS.findIndex(a => a.id === selectedAgent.id) + 1) % AGENTS.length];
                    setSelectedAgent(next);
                  }}
                >
                  <selectedAgent.icon className="h-4 w-4 text-blue-400" />
                  <span>{selectedAgent.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
              <p className="flex items-center text-xs text-slate-400 italic">
                {selectedAgent.description}
              </p>
            </div>

            <div className="flex gap-2 items-end">
              <textarea
                rows={2}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={`Tell the ${selectedAgent.label} agent what to do...`}
                disabled={generating}
                className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all resize-none disabled:opacity-50"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(e as any); } }}
              />
              <button
                type="submit"
                disabled={generating || !prompt.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {generating ? "Generating..." : "Generate"}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Enter</kbd> to generate · <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Shift+Enter</kbd> for new line</p>
          </form>
        </div>
      </div>
    </div>
  );
}
