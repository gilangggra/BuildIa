/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { User, Mail, Shield, Bell, Save, Loader2, Key } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    githubToken: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          
          // Fetch profile preferences to get the github token
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferences')
            .eq('id', user.id)
            .single();
            
          const prefs = profile?.preferences || {};
          
          setFormData({
            name: user.user_metadata?.name || "",
            email: user.email || "",
            githubToken: prefs.githubToken || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: formData.name }
      });
      if (error) throw error;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          preferences: { githubToken: formData.githubToken }
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;

      // Ideally show a success toast here
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "api-keys", label: "API Keys", icon: Key },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-100">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-56 flex-shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-left group
                    ${isActive 
                      ? "bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                    }`}
                >
                  <tab.icon className={`h-4 w-4 transition-colors ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400"}`} />
                  {tab.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#0A0D14]/90 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
            
            {activeTab === "profile" && (
              <form onSubmit={handleSave}>
                <div className="p-8 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white mb-1">Public Profile</h2>
                  <p className="text-sm text-slate-400 mb-8 font-medium">This information will be displayed publicly.</p>
                  
                  <div className="space-y-6 max-w-md">
                    <div>
                      <label className="block text-xs font-bold tracking-wide text-slate-400 uppercase mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-3 h-5 w-5 text-slate-500" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[15px] text-white rounded-2xl pl-12 pr-4 py-3 outline-none transition-all placeholder:text-slate-600"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold tracking-wide text-slate-400 uppercase mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3 h-5 w-5 text-slate-600" />
                        <input
                          type="email"
                          disabled
                          value={formData.email}
                          className="w-full bg-black/20 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-[15px] text-slate-500 outline-none cursor-not-allowed opacity-70"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 font-medium">Your email address is managed by your authentication provider.</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-8 py-5 bg-[#030509]/60 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="relative group overflow-hidden rounded-xl disabled:opacity-60"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600" />
                    <div className="absolute inset-0 bg-blue-500 blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
                    <div className="relative px-6 py-2.5 flex items-center gap-2 text-white text-sm font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-blue-400/30 rounded-xl transition-transform active:scale-95">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Changes
                    </div>
                  </button>
                </div>
              </form>
            )}

            {activeTab === "api-keys" && (
              <form onSubmit={handleSave}>
                <div className="p-8 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white mb-1">External Integrations</h2>
                  <p className="text-sm text-slate-400 mb-8 font-medium">Connect BuildIA to external platforms like GitHub.</p>
                  
                  <div className="space-y-6 max-w-md">
                    <div>
                      <label className="block text-xs font-bold tracking-wide text-slate-400 uppercase mb-2">GitHub Personal Access Token</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-3 h-5 w-5 text-slate-500" />
                        <input
                          type="password"
                          placeholder="ghp_xxxxxxxxxxxx"
                          value={formData.githubToken}
                          onChange={(e) => setFormData({...formData, githubToken: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[15px] text-white rounded-2xl pl-12 pr-4 py-3 outline-none transition-all placeholder:text-slate-600"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 font-medium">Requires &apos;repo&apos; scope to create repositories and push code.</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-8 py-5 bg-[#030509]/60 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="relative group overflow-hidden rounded-xl disabled:opacity-60"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600" />
                    <div className="absolute inset-0 bg-blue-500 blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
                    <div className="relative px-6 py-2.5 flex items-center gap-2 text-white text-sm font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-blue-400/30 rounded-xl transition-transform active:scale-95">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save API Keys
                    </div>
                  </button>
                </div>
              </form>
            )}

            {activeTab !== "profile" && activeTab !== "api-keys" && (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-slate-500" />
                </div>
                <h3 className="text-slate-200 font-medium mb-1">Coming Soon</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  This section is currently under development and will be available in a future update.
                </p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
