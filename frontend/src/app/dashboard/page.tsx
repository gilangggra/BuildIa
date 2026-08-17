"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight, Activity, FolderGit2, Clock, Loader2, Sparkles, MoreHorizontal, GitBranch } from "lucide-react";
import { api } from "@/lib/api";

export default function DashboardOverview() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const createProject = async () => {
    try {
      const name = prompt("Project Name:", "New Project");
      if (!name) return;
      const res = await api.projects.create({ name, description: "A new AI-generated project" });
      router.push(`/dashboard/projects/${res.id}`);
    } catch (e: any) {
      alert("Failed to create project: " + e.message);
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
            onClick={createProject}
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
          {/* Search/Filter Bar (Visual Only for Professional Look) */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="w-64 bg-white border border-[#181818]/10 focus:border-[#181818]/30 rounded-[6px] px-3 py-1.5 text-[14px] outline-none placeholder:text-[#181818]/40 shadow-sm"
              />
            </div>
            <div className="text-[13px] text-[#181818]/50 font-medium">
              Showing {projects.length} projects
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
                You haven't created any projects yet. Start by creating a new workspace.
              </p>
              <button
                onClick={createProject}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#181818] hover:bg-[#2a2a2a] text-[#f7f3ee] font-medium rounded-[6px] transition-all shadow-sm text-[14px]"
              >
                <Plus className="h-4 w-4" />
                Create New Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((proj) => (
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
                      <button className="text-[#181818]/30 hover:text-[#181818]/70 transition-colors p-1">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <p className="text-[#181818]/60 text-[13px] line-clamp-2 font-medium leading-relaxed">
                      {proj.description || "A standard BuildIA workspace configuration."}
                    </p>
                  </div>
                  
                  <div className="px-5 py-3 border-t border-[#181818]/5 bg-[#181818]/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[12px] text-[#181818]/50 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>2d ago</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <GitBranch className="h-3.5 w-3.5" />
                        <span>main</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-[12px] text-[#181818]/70 font-semibold">Ready</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
