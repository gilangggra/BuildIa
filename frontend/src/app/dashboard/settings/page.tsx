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
    <div className="flex flex-col h-full bg-[#f7f3ee] text-[#181818] p-6 lg:p-12 relative overflow-hidden font-sans">
      
      {/* Page Header */}
      <div className="mb-12 relative z-10">
        <h1 className="text-[2rem] font-semibold tracking-[-0.03em] flex items-center gap-3">
          <Settings className="h-7 w-7 text-[#181818]/60" /> Settings
        </h1>
        <p className="text-[#181818]/70 mt-2 text-[15px] font-medium max-w-xl">
          Manage your account preferences, configurations, and integrations to customize your workspace.
        </p>
      </div>

      <div className="max-w-2xl relative z-10">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Account Details Section */}
          <div className="bg-white border border-[#181818]/10 rounded-[12px] p-8 shadow-sm">
            <h2 className="text-[17px] font-semibold flex items-center gap-2.5 mb-6">
              <User className="h-5 w-5" /> Account Profile
            </h2>
            
            <div className="flex items-center gap-5 p-5 bg-[#f7f3ee]/50 border border-[#181818]/10 rounded-[8px]">
              <div className="w-14 h-14 rounded-full bg-[#181818] flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-xl font-medium text-white">U</span>
              </div>
              <div>
                <p className="text-[15px] font-semibold">Current Plan: Free Tier</p>
                <p className="text-[13px] text-[#181818]/70 mt-0.5">Upgrade to Pro for unlimited agents and storage.</p>
                <button type="button" className="mt-2 text-[13px] font-medium underline underline-offset-4 hover:text-[#181818]/70 transition-colors">
                  Upgrade Plan &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Integrations Section */}
          <div className="bg-white border border-[#181818]/10 rounded-[12px] p-8 shadow-sm">
            <h2 className="text-[17px] font-semibold flex items-center gap-2.5 mb-6">
              <GitBranch className="h-5 w-5" /> Version Control
            </h2>
            
            <p className="text-[14px] text-[#181818]/70 mb-6 font-medium">
              Connect your GitHub account to allow BuildIA to automatically push generated code to your repositories.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-semibold mb-2.5 flex items-center gap-2">
                  <Key className="h-4 w-4 text-[#181818]/60" /> GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full bg-white border border-[#181818]/20 focus:border-[#181818] focus:ring-1 focus:ring-[#181818] rounded-[8px] px-4 py-3 outline-none transition-all placeholder:text-[#181818]/30 font-medium text-[15px]"
                />
                <p className="text-[13px] text-[#181818]/60 mt-3 font-medium">
                  Needs <code className="px-1.5 py-0.5 bg-white border border-[#181818]/10 rounded text-[#181818] font-mono text-xs">repo</code> scope to create and push to repositories.
                </p>
              </div>
              
              <div className="pt-4 border-t border-[#181818]/10">
                <label className="block text-[14px] font-semibold mb-2.5 flex items-center gap-2">
                  <Key className="h-4 w-4 text-[#181818]/60" /> Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={geminiToken}
                  onChange={(e) => setGeminiToken(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-white border border-[#181818]/20 focus:border-[#181818] focus:ring-1 focus:ring-[#181818] rounded-[8px] px-4 py-3 outline-none transition-all placeholder:text-[#181818]/30 font-medium text-[15px]"
                />
                <p className="text-[13px] text-[#181818]/60 mt-3 font-medium">
                  Provide your own Gemini API key to power your personal AI Developer workspace.
                </p>
              </div>
            </div>
          </div>

          {message.text && (
            <div className={`p-4 rounded-[8px] text-[14px] font-medium flex items-center gap-2 border ${
              message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2.5 px-6 py-3 bg-[#181818] hover:bg-[#2a2a2a] text-[#f7f3ee] font-medium rounded-[8px] transition-all disabled:opacity-50 text-[15px] shadow-[0_3px_10px_rgba(24,24,24,0.12)]"
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
