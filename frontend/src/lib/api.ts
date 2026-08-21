import { supabase } from './supabase';
import type { Project, Artefact, Agent, DiffProposal } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  if (!token) {
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
    // Try to extract structured error from NestJS (which returns { message, statusCode, error })
    let message = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      // NestJS ValidationPipe returns { message: string[] } for validation errors
      if (Array.isArray(body.message)) {
        message = body.message.join('; ');
      } else if (typeof body.message === 'string') {
        message = body.message;
      }
    } catch {
      // response body was not JSON — keep the default statusText message
    }
    throw new Error(message);
  }
  return res.json();
}

// ---------- Projects ----------
export const api = {
  projects: {
    list: () => request<Project[]>('/v1/projects'),
    get: (id: string) => request<Project>(`/v1/projects/${id}`),
    create: (data: { name: string; description?: string }) =>
      request<Project>('/v1/projects', { method: 'POST', body: JSON.stringify(data) }),
    deployToGithub: (id: string) =>
      request<{ success: boolean; repoUrl: string; commitSha: string }>(
        `/v1/projects/${id}/deploy/github`,
        { method: 'POST' },
      ),
  },

  artefacts: {
    list: (projectId: string) => request<Artefact[]>(`/v1/projects/${projectId}/artefacts`),
    get: (projectId: string, id: string) =>
      request<Artefact>(`/v1/projects/${projectId}/artefacts/${id}`),
    generate: (
      projectId: string,
      data: { type: string; agentType: string; prompt: string },
    ) =>
      request<Artefact>(`/v1/projects/${projectId}/artefacts`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (projectId: string, id: string, data: Partial<Pick<Artefact, 'content' | 'status' | 'name'>>) =>
      request<Artefact>(`/v1/projects/${projectId}/artefacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    refactor: (projectId: string, id: string, prompt: string) =>
      request<DiffProposal>(`/v1/projects/${projectId}/artefacts/${id}/refactor`, {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      }),
    magicBuild: (projectId: string, prompt: string) =>
      request<{ status: string; message: string }>(
        `/v1/projects/${projectId}/artefacts/magic-build`,
        { method: 'POST', body: JSON.stringify({ prompt }) },
      ),
    delete: (projectId: string, id: string) =>
      request<{ success: boolean; id: string }>(
        `/v1/projects/${projectId}/artefacts/${id}`,
        { method: 'DELETE' },
      ),
  },

  agents: {
    list: () => request<Agent[]>('/v1/agents'),
    create: (data: { label: string; description?: string; type?: string; system_prompt: string; icon_name?: string }) =>
      request<Agent>('/v1/agents', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
