"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus, FolderKanban, MoreHorizontal,
  Globe, Smartphone, Server, Layers,
  Clock, ArrowRight, X, Loader2, AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

const templateIcons: Record<string, any> = {
  "web-app": Globe,
  "mobile": Smartphone,
  "api": Server,
  "fullstack": Layers,
};

const statusColors: Record<string, string> = {
  draft:    "bg-slate-700/50 text-slate-400",
  active:   "bg-blue-500/15 text-blue-400",
  archived: "bg-slate-700/50 text-slate-500",
  deployed: "bg-green-500/15 text-green-400",
};

function ProjectSkeleton() {
  return (
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 bg-slate-700 rounded-lg" />
        <div className="w-16 h-5 bg-slate-700 rounded-full" />
      </div>
      <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-700/60 rounded w-full mb-1.5" />
      <div className="h-3 bg-slate-700/60 rounded w-2/3 mb-4" />
      <div className="h-3 bg-slate-700/40 rounded w-1/3" />
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

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.projects.list();
      setProjects(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Projects</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage and generate your software projects with AI.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
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
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Projects", value: loading ? "—" : projects.length },
          { label: "Active",         value: loading ? "—" : activeCount },
          { label: "Deployed",       value: loading ? "—" : deployedCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-800/50 border border-slate-700/60 rounded-xl px-5 py-4">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-2xl font-semibold text-slate-100 mt-1">{value}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => {
            const Icon = templateIcons[project.template] ?? FolderKanban;
            return (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <div className="group bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 hover:border-slate-600/80 rounded-xl p-5 transition-all duration-200 cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 bg-slate-700/80 rounded-lg flex items-center justify-center">
                      <Icon className="h-4 w-4 text-slate-300" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[project.status] ?? statusColors.draft}`}>
                        {project.status}
                      </span>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded-md"
                        onClick={e => e.preventDefault()}
                      >
                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-slate-100 text-sm mb-1.5">{project.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                    {project.description || "No description."}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-100">New Project</h2>
                <p className="text-xs text-slate-400 mt-0.5">Fill in the details to get started.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My E-Commerce App"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what you're building..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((t) => {
                    const Icon = templateIcons[t];
                    const active = selectedTemplate === t;
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setSelectedTemplate(t)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm capitalize transition-all border
                          ${active
                            ? "bg-blue-600/15 border-blue-500/50 text-blue-300"
                            : "bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300 hover:bg-slate-700/80"
                          }`}
                      >
                        <Icon className={`h-4 w-4 ${active ? "text-blue-400" : "text-slate-400"}`} />
                        {t.replace("-", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
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
