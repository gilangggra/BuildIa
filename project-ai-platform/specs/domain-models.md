# 🏛️ Domain Models (Supabase + Gemini)

## Core Entities

### User (extends Supabase auth.users)
```typescript
// Supabase Auth User
interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role: 'admin' | 'developer' | 'viewer'
  preferences: UserPreferences
  created_at: Date
  updated_at: Date
}

interface UserPreferences {
  theme: 'light' | 'dark'
  language: 'id' | 'en'
  defaultTemplate: string
  notifications: NotificationSettings
}

interface Project {
  id: string
  name: string
  description: string
  template: 'web-app' | 'api' | 'mobile' | 'fullstack'
  status: 'draft' | 'active' | 'archived' | 'deployed'
  ownerId: string // references profiles.id
  teamMembers: TeamMember[]
  artefacts: Artefact[]
  createdAt: Date
  updatedAt: Date
}

interface Artefact {
  id: string
  projectId: string
  type: 'srs' | 'diagram' | 'code' | 'deployment' | 'test'
  name: string
  content: string // Stored as text in Supabase
  format: 'markdown' | 'json' | 'yaml' | 'code' | 'mermaid'
  version: string
  status: 'draft' | 'review' | 'approved' | 'final'
  dependencies: string[]
  generatedBy: string // Agent ID
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// For large files, store in Supabase Storage with reference
interface ArtefactWithStorage extends Artefact {
  storagePath?: string // Path in Supabase Storage bucket
}

interface AISession {
  id: string
  userId: string
  projectId: string
  agentType: 'ideator' | 'documenter' | 'diagrammer' | 'coder' | 'reviewer' | 'deployer'
  model: 'gemini-1.5-pro' | 'gemini-2.0-flash'
  prompt: string
  response: string
  tokensUsed?: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  createdAt: Date
  completedAt?: Date
}

interface Deployment {
  id: string
  projectId: string
  environment: 'staging' | 'production'
  config: DeploymentConfig
  status: 'pending' | 'running' | 'success' | 'failed'
  url?: string
  logs: string[]
  createdAt: Date
  updatedAt: Date
}

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Usage examples:
// - Database: supabase.from('projects').select('*')
// - Auth: supabase.auth.signUp({ email, password })
// - Storage: supabase.storage.from('artefacts').upload(path, file)
// - Realtime: supabase.channel('projects').on(...)

-- RLS ensures users only access their own data
-- See database-schema.sql for full RLS policies

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

// Usage examples:
// - Text generation: model.generateContent(prompt)
// - Chat: model.startChat({ history: [...] })
// - JSON mode: model.generateContent({ ... }, { responseMimeType: 'application/json' })