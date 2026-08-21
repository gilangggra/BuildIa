// Shared domain types — used across frontend components and API layer

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  status: 'active' | 'deployed' | 'building' | 'error';
  created_at: string;
  updated_at?: string;
}

export type ArtefactType = 'srs' | 'diagram' | 'code' | 'test' | 'deployment';
export type ArtefactStatus = 'draft' | 'approved' | 'final' | 'rejected';

export interface ArtefactMetadata {
  tokens?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  prompt?: string;
  ragCitations?: { id: string; name: string; type: string }[];
  is_auto_generated?: boolean;
}

export interface Artefact {
  id: string;
  project_id: string;
  type: ArtefactType;
  name: string;
  content: string;
  format: 'markdown' | 'json' | 'txt';
  status: ArtefactStatus;
  generated_by: string;
  embedding?: string;
  metadata?: ArtefactMetadata;
  created_at: string;
  updated_at?: string;
}

export interface Agent {
  id: string;
  label: string;
  description?: string;
  type: string;
  icon_name: string;
  system_prompt?: string;
  is_system?: boolean;
  created_at?: string;
}

export interface DiffProposal {
  originalId: string;
  proposedContent: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface MagicBuildProgress {
  status: 'running' | 'done' | 'error';
  currentPhase: number;
  message: string;
}
