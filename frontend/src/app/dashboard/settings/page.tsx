"use client";

import { useState, useEffect } from "react";
import { User, Key, Save, Loader2, GitBranch, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [geminiToken, setGeminiToken] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Load existing preferences if any
    const loadSettings = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data } = await supabase.from('profiles').select('preferences').eq('id', session.user.id).single();
        if (data?.preferences) {
          if (data.preferences.githubToken) setGithubToken(data.preferences.githubToken);
          if (data.preferences.geminiToken) setGeminiToken(data.preferences.geminiToken);
        }
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("No active session");

      const preferences = { githubToken, geminiToken };
      const { error } = await supabase.from('profiles').update({ preferences }).eq('id', session.user.id);

      if (error) throw error;
      setMessage({ type: "success", text: "Settings saved successfully." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save settings." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white p-6 lg:p-12 relative overflow-hidden font-sans">
      
      {/* Page Header */}
      <div className="mb-12 relative z-10">
        <h1 className="text-[2rem] font-semibold tracking-[-0.03em] flex items-center gap-3">
          <Settings className="h-7 w-7 text-zinc-500" /> Settings
        </h1>
        <p className="text-zinc-400 mt-2 text-[15px] font-medium max-w-xl">
          Manage your account preferences, configurations, and integrations to customize your workspace.
        </p>
      </div>

      <div className="max-w-2xl relative z-10">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Account Details Section */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-8">
            <h2 className="text-[17px] font-semibold flex items-center gap-2.5 mb-6">
              <User className="h-5 w-5" /> Account Profile
            </h2>
            
            <div className="flex items-center gap-5 p-5 bg-zinc-900 border border-white/5 rounded-lg shadow-sm">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                <span className="text-xl font-bold text-white">U</span>
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white">Current Plan: Free Tier</p>
                <p className="text-[13px] text-zinc-400 mt-0.5">Upgrade to Pro for unlimited agents and storage.</p>
                <button type="button" className="mt-2 text-[13px] font-medium text-zinc-300 underline underline-offset-4 hover:text-white transition-colors">
                  Upgrade Plan &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Integrations Section */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-8">
            <h2 className="text-[17px] font-semibold flex items-center gap-2.5 mb-6">
              <GitBranch className="h-5 w-5" /> Version Control
            </h2>
            
            <p className="text-[14px] text-zinc-400 mb-6 font-medium">
              Connect your GitHub account to allow BuildIA to automatically push generated code to your repositories.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-semibold mb-2.5 flex items-center gap-2">
                  <Key className="h-4 w-4 text-zinc-500" /> GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full bg-zinc-900 border border-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-lg px-4 py-3 outline-none transition-all placeholder:text-zinc-600 font-medium text-[15px] text-white"
                />
                <p className="text-[13px] text-zinc-500 mt-3 font-medium">
                  Needs <code className="px-1.5 py-0.5 bg-zinc-800 border border-white/5 rounded text-zinc-300 font-mono text-xs">repo</code> scope to create and push to repositories.
                </p>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <label className="block text-[14px] font-semibold mb-2.5 flex items-center gap-2">
                  <Key className="h-4 w-4 text-zinc-500" /> Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={geminiToken}
                  onChange={(e) => setGeminiToken(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-zinc-900 border border-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-lg px-4 py-3 outline-none transition-all placeholder:text-zinc-600 font-medium text-[15px] text-white"
                />
                <p className="text-[13px] text-zinc-500 mt-3 font-medium">
                  Provide your own Gemini API key to power your personal AI Developer workspace.
                </p>
              </div>
            </div>
          </div>

          {message.text && (
            <div className={`p-4 rounded-[8px] text-[14px] font-medium flex items-center gap-2 border ${
              message.type === 'error' ? 'bg-red-950/50 text-red-400 border-red-900/50' : 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2.5 px-6 py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-medium rounded-md transition-all disabled:opacity-50 text-[15px] shadow-sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
