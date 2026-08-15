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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left
                    ${isActive 
                      ? "bg-slate-800 border border-slate-700/50 text-slate-100" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent"
                    }`}
                >
                  <tab.icon className={`h-4 w-4 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl overflow-hidden">
            
            {activeTab === "profile" && (
              <form onSubmit={handleSave}>
                <div className="p-6 border-b border-slate-700/60">
                  <h2 className="text-base font-semibold text-slate-100 mb-1">Public Profile</h2>
                  <p className="text-sm text-slate-400 mb-6">This information will be displayed publicly.</p>
                  
                  <div className="space-y-5 max-w-md">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-slate-900/50 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                          type="email"
                          disabled
                          value={formData.email}
                          className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-400 outline-none cursor-not-allowed opacity-70"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">Your email address is managed by your authentication provider.</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-slate-800/30 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === "api-keys" && (
              <form onSubmit={handleSave}>
                <div className="p-6 border-b border-slate-700/60">
                  <h2 className="text-base font-semibold text-slate-100 mb-1">External Integrations</h2>
                  <p className="text-sm text-slate-400 mb-6">Connect BuildIA to external platforms like GitHub.</p>
                  
                  <div className="space-y-5 max-w-md">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">GitHub Personal Access Token</label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                          type="password"
                          placeholder="ghp_xxxxxxxxxxxx"
                          value={formData.githubToken}
                          onChange={(e) => setFormData({...formData, githubToken: e.target.value})}
                          className="w-full bg-slate-900/50 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5">Requires &apos;repo&apos; scope to create repositories and push code.</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-slate-800/30 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save API Keys
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
