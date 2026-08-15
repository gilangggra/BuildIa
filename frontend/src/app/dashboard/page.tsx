/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus, FolderKanban, MoreHorizontal,
  Globe, Smartphone, Server, Layers,
  Clock, ArrowRight, X, Loader2, AlertCircle,
  LucideIcon
} from "lucide-react";
import { api } from "@/lib/api";

const templateIcons: Record<string, LucideIcon> = {
  "web-app": Globe,
  "mobile": Smartphone,
  "api": Server,
  "fullstack": Layers,
};



function ProjectSkeleton() {
  return (
    <div className="bg-[#0B0F19]/60 border border-white/5 rounded-2xl p-6 animate-pulse shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-white/5 rounded-xl" />
        <div className="w-16 h-5 bg-white/5 rounded-full" />
      </div>
      <div className="h-5 bg-white/10 rounded-lg w-2/3 mb-2" />
      <div className="h-3.5 bg-white/5 rounded-lg w-full mb-1.5" />
      <div className="h-3.5 bg-white/5 rounded-lg w-3/4 mb-5" />
      <div className="h-3.5 bg-white/5 rounded-lg w-1/3" />
    </div>
  );
}

const TEMPLATES = ["web-app", "api", "mobile", "fullstack"] as const;

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("web-app");
  const [form, setForm] = useState({ name: "", description: "" });

  const loadProjects = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await api.projects.list();
      setProjects(data || []);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    // Already loading by default on mount, so pass false to prevent synchronous setState
    loadProjects(false); 
  }, [loadProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      setCreating(true);
      await api.projects.create({ ...form, template: selectedTemplate });
      setShowModal(false);
      setForm({ name: "", description: "" });
      setSelectedTemplate("web-app");
      loadProjects();
    } catch (err: any) {
      setError(err.message || "Failed to create project.");
    } finally {
      setCreating(false);
    }
  };

  const activeCount   = projects.filter(p => p.status === "active").length;
  const deployedCount = projects.filter(p => p.status === "deployed").length;

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Projects</h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            Manage and generate your software projects with AI.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.6)] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        {[
          { label: "Total Projects", value: loading ? "—" : projects.length },
          { label: "Active",         value: loading ? "—" : activeCount },
          { label: "Deployed",       value: loading ? "—" : deployedCount },
        ].map(({ label, value }, i) => (
          <div key={label} className="relative overflow-hidden bg-[#0B0F19]/60 backdrop-blur-xl border border-white/5 rounded-2xl px-6 py-5 group shadow-sm transition-all hover:border-white/10">
            {/* Subtle gradient accent on hover */}
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl rounded-full ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
            <p className="text-sm text-slate-400 font-medium mb-1 relative z-10">{label}</p>
            <p className="text-3xl font-bold text-white relative z-10">{value}</p>
          </div>
        ))}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <ProjectSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4">
            <FolderKanban className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="text-slate-300 font-medium mb-1">No projects yet</h3>
          <p className="text-sm text-slate-500 mb-6">Create your first project and let AI do the heavy lifting.</p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => {
            const Icon = templateIcons[project.template] ?? FolderKanban;
            return (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <div className="group bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 hover:bg-[#0B0F19] rounded-3xl p-7 transition-all duration-300 cursor-pointer h-full relative overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1.5 flex flex-col">
                  
                  {/* Subtle top spotlight on hover */}
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  <div className="flex items-start justify-between mb-5 relative z-10">
                    <div className="w-12 h-12 bg-white/5 group-hover:bg-blue-500/10 border border-white/10 group-hover:border-blue-500/20 rounded-2xl flex items-center justify-center transition-colors shadow-sm">
                      <Icon className="h-6 w-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full capitalize bg-white/5 border border-white/5 text-slate-300">
                        <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'active' ? 'bg-blue-400 shadow-[0_0_5px_#60a5fa]' : project.status === 'deployed' ? 'bg-emerald-400 shadow-[0_0_5px_#34d399]' : 'bg-slate-400'}`}></div>
                        {project.status}
                      </span>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg"
                        onClick={e => e.preventDefault()}
                      >
                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-white text-xl mb-2 relative z-10 group-hover:text-blue-50 transition-colors tracking-tight">{project.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-8 flex-1 relative z-10 font-medium">
                    {project.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center justify-between relative z-10 pt-4 border-t border-white/5">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 group-hover:text-slate-400 transition-colors">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      Open <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F19] border border-white/10 rounded-2xl w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">New Project</h2>
                <p className="text-xs text-slate-400 mt-1">Configure your new AI-powered project.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My E-Commerce App"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-black/20 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what you're building..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-black/20 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Template</label>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map((t) => {
                    const Icon = templateIcons[t];
                    const active = selectedTemplate === t;
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setSelectedTemplate(t)}
                        className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm capitalize transition-all border
                          ${active
                            ? "bg-blue-500/10 border-blue-500/50 text-blue-300 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]"
                            : "bg-black/20 border-white/5 hover:border-white/20 text-slate-300 hover:bg-white/5"
                          }`}
                      >
                        <Icon className={`h-4 w-4 ${active ? "text-blue-400" : "text-slate-400"}`} />
                        {t.replace("-", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-slate-300 text-sm font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                >
                  {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
