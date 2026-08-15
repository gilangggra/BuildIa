/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  if (!token) {
    // Redirect to auth if no session
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
    return {};
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Request failed');
  }
  return res.json();
}

// ---------- Projects ----------
export const api = {
  projects: {
    list: () => request<any[]>('/v1/projects'),
    get: (id: string) => request<any>(`/v1/projects/${id}`),
    create: (data: { name: string; description?: string; template?: string }) =>
      request<any>('/v1/projects', { method: 'POST', body: JSON.stringify(data) }),
    deployToGithub: (id: string) =>
      request<any>(`/v1/projects/${id}/deploy/github`, { method: 'POST' }),
  },
  artefacts: {
    list: (projectId: string) => request<any[]>(`/v1/projects/${projectId}/artefacts`),
    get: (projectId: string, id: string) =>
      request<any>(`/v1/projects/${projectId}/artefacts/${id}`),
    generate: (
      projectId: string,
      data: { type: string; agentType: string; prompt: string }
    ) =>
      request<any>(`/v1/projects/${projectId}/artefacts`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (projectId: string, id: string, data: any) =>
      request<any>(`/v1/projects/${projectId}/artefacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
};
