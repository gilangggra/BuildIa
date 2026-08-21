"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight, Activity, FolderGit2, Clock, Loader2, Sparkles, MoreHorizontal, GitBranch, X, Code2, Search } from "lucide-react";
import { api } from "@/lib/api";

/** Simple relative time formatter — avoids adding date-fns dependency */
function relativeTime(dateStr: string): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  active:   { color: "bg-emerald-500", label: "Active" },
  deployed: { color: "bg-blue-500",    label: "Deployed" },
  building: { color: "bg-amber-400",   label: "Building" },
  error:    { color: "bg-red-500",     label: "Error" },
};

export default function DashboardOverview() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    api.projects.list().then(data => {
      if(mounted) {
        setProjects(data || []);
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if(mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  // Functional search/filter — filters by name and description
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [projects, searchQuery]);

  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;
    try {
      setCreating(true);
      setError("");
      const res = await api.projects.create({ 
        name: newProject.name, 
        description: newProject.description || "A new AI-generated project" 
      });
      router.push(`/dashboard/projects/${res.id}`);
    } catch (err: any) {
      setError("Failed to create project: " + err.message);
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f3ee] text-[#181818] relative overflow-hidden font-sans">
      
      {/* Top Header */}
      <div className="bg-white border-b border-[#181818]/10 px-8 py-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#181818] rounded-[8px] flex items-center justify-center shadow-sm">
              <FolderGit2 className="h-5 w-5 text-[#f7f3ee]" />
            </div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight flex items-center gap-2">
                Projects
              </h1>
              <p className="text-[#181818]/60 text-[14px] font-medium mt-0.5">Manage your workspaces and deployments.</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#181818] hover:bg-[#2a2a2a] text-[#f7f3ee] font-semibold rounded-[6px] transition-all shadow-[0_2px_8px_rgba(24,24,24,0.12)] text-[14px]"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Search/Filter Bar — now functional */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 relative">
              <Search className="absolute left-3 h-4 w-4 text-[#181818]/40 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-white border border-[#181818]/10 focus:border-[#181818]/30 rounded-[6px] pl-9 pr-3 py-1.5 text-[14px] outline-none placeholder:text-[#181818]/40 shadow-sm"
              />
            </div>
            <div className="text-[13px] text-[#181818]/50 font-medium">
              {searchQuery ? `${filteredProjects.length} of ${projects.length} projects` : `${projects.length} projects`}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white border border-[#181818]/10 rounded-[8px] shadow-sm">
              <Loader2 className="h-6 w-6 text-[#181818]/40 animate-spin mb-4" />
              <p className="text-[#181818]/60 font-medium text-[14px]">Loading workspace...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white border border-[#181818]/10 rounded-[8px] p-16 text-center shadow-sm flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[#f7f3ee] border border-[#181818]/10 rounded-[8px] flex items-center justify-center mb-6">
                <Activity className="h-6 w-6 text-[#181818]/60" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#181818] mb-2">No projects found</h3>
              <p className="text-[#181818]/60 max-w-sm mx-auto mb-8 font-medium text-[14px]">
                You haven&apos;t created any projects yet. Start by creating a new workspace.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#181818] hover:bg-[#2a2a2a] text-[#f7f3ee] font-medium rounded-[6px] transition-all shadow-sm text-[14px]"
              >
                <Plus className="h-4 w-4" />
                Create New Project
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white border border-[#181818]/10 rounded-[8px] p-16 text-center shadow-sm flex flex-col items-center justify-center">
              <Search className="h-8 w-8 text-[#181818]/30 mb-4" />
              <h3 className="text-[18px] font-semibold text-[#181818] mb-2">No results found</h3>
              <p className="text-[#181818]/60 font-medium text-[14px]">
                No projects match &quot;<span className="font-semibold">{searchQuery}</span>&quot;. Try a different keyword.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((proj) => {
                const statusCfg = STATUS_CONFIG[proj.status] ?? STATUS_CONFIG["active"];
                return (
                  <div
                    key={proj.id}
                    onClick={() => router.push(`/dashboard/projects/${proj.id}`)}
                    className="group cursor-pointer bg-white border border-[#181818]/10 rounded-[8px] hover:border-[#181818]/30 transition-all shadow-[0_2px_4px_rgba(24,24,24,0.02)] hover:shadow-[0_4px_12px_rgba(24,24,24,0.05)] flex flex-col h-[200px]"
                  >
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-[16px] font-semibold text-[#181818] group-hover:text-blue-600 transition-colors">
                            {proj.name}
                          </h3>
                        </div>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#181818]/30 hover:text-[#181818]/70 transition-colors p-1"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <p className="text-[#181818]/60 text-[13px] line-clamp-2 font-medium leading-relaxed">
                        {proj.description || "A standard BuildIA workspace configuration."}
                      </p>
                    </div>
                    
                    <div className="px-5 py-3 border-t border-[#181818]/5 bg-[#181818]/[0.02] flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[12px] text-[#181818]/50 font-medium">
                        {/* Real timestamp from database */}
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{relativeTime(proj.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GitBranch className="h-3.5 w-3.5" />
                          <span>main</span>
                        </div>
                      </div>
                      {/* Real status from database */}
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${statusCfg.color}`}></span>
                        <span className="text-[12px] text-[#181818]/70 font-semibold">{statusCfg.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181818]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[16px] shadow-[0_20px_60px_rgba(24,24,24,0.15)] border border-[#181818]/10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#181818]/10 bg-[#f7f3ee]">
              <h2 className="text-[16px] font-bold text-[#181818] flex items-center gap-2">
                <FolderGit2 className="h-4 w-4" /> Create New Project
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[#181818]/40 hover:text-[#181818] transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-[8px] text-[13px] font-medium">
                  {error}
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-[#181818] mb-1.5">Project Name</label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    placeholder="e.g. NextJS E-Commerce" 
                    className="w-full bg-white border border-[#181818]/20 focus:border-[#181818] focus:ring-1 focus:ring-[#181818] rounded-[8px] px-3.5 py-2.5 outline-none transition-all placeholder:text-[#181818]/30 font-medium text-[14px]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#181818] mb-1.5">Description (Optional)</label>
                  <textarea 
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="e.g. A fullstack marketplace with Stripe payments..." 
                    rows={3}
                    className="w-full resize-none bg-white border border-[#181818]/20 focus:border-[#181818] focus:ring-1 focus:ring-[#181818] rounded-[8px] px-3.5 py-2.5 outline-none transition-all placeholder:text-[#181818]/30 font-medium text-[14px]"
                  />
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-[#181818]/10 bg-[#f7f3ee]/50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                disabled={creating}
                className="px-4 py-2 font-semibold text-[#181818]/60 hover:bg-[#181818]/5 rounded-[6px] transition-colors text-[13px]"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleCreateProject}
                disabled={creating || !newProject.name}
                className="flex items-center gap-2 px-5 py-2 bg-[#181818] hover:bg-[#2a2a2a] text-[#f7f3ee] font-semibold rounded-[6px] transition-colors text-[13px] shadow-sm disabled:opacity-50"
              >
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Code2 className="h-3.5 w-3.5" />}
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
