# 🏗️ System Architecture

## 📐 High-Level Architecture
┌─────────────────────────────────────────────────────────────┐
│ Frontend Layer │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │
│ │ Editor │ │ Canvas │ │ Chat │ │ Dashboard │ │
│ │ (Code) │ │ (Diag.) │ │ (AI) │ │ (Project) │ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
│
┌─────────────────────────▼───────────────────────────────────┐
│ API Gateway Layer │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │
│ │ Auth │ │ Rate │ │ Cache │ │ Logging │ │
│ │ │ │ Limiter │ │ │ │ │ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
│
┌─────────────────────────▼───────────────────────────────────┐
│ Orchestration Layer │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Agent Orchestrator ││
│ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ││
│ │ │ Ide │ │ Doc │ │ Dia │ │Code │ │Rev │ │Dep │ ││
│ │ │ tor │ │ │ │ │ │ │ │ │ │ │ ││
│ │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────┬───────────────────────────────────┘
│
┌─────────────────────────▼───────────────────────────────────┐
│ Service Layer │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │
│ │ Auth │ │ Project │ │ Spec │ │ Generation │ │
│ │ Service │ │ Service │ │Service │ │ Service │ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │
│ │ AI │ │ Export │ │ Deploy │ │ Analytics │ │
│ │ Service │ │ Service │ │ Service │ │ Service │ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
│
┌─────────────────────────▼───────────────────────────────────┐
│ Data Layer │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │
│ │ DB │ │ Cache │ │ File │ │ Vector │ │
│ │ (PG) │ │ (Redis) │ │ Storage │ │ DB (Pinecone) │ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘


## 🧩 Component Details

### Frontend Components
```typescript
// Tech Stack
- React 18 + TypeScript
- TailwindCSS + shadcn/ui
- Zustand (State Management)
- React Flow (Diagram Canvas)
- Monaco Editor (Code Editor)
- TipTap (Rich Text Editor)
- Socket.io (Real-time sync)

// Service Architecture
- API Gateway: FastAPI / NestJS
- Auth Service: JWT + OAuth2
- Project Service: CRUD + Version Control
- Spec Service: Document Management
- AI Service: Multi-model orchestration
- Generation Service: Code/Diagram generation
- Export Service: PDF, DOCX, Markdown
- Deploy Service: Docker/K8s config
- Analytics Service: Usage metrics

interface AIAgent {
  name: string
  role: 'ideator' | 'documenter' | 'diagrammer' | 'coder' | 'reviewer' | 'deployer'
  context: string[]  // files to read
  prompt: string     // system prompt
  models: string[]   // allowed models
  temperature: number
  maxTokens: number
}

interface AIOrchestrator {
  plan(goal: string): Task[]
  execute(task: Task): Promise<Output>
  validate(output: Output): ValidationResult
  iterate(feedback: Feedback): Output
}

User Input (Idea) 
  → Ideator Agent (Interpret)
  → Documenter Agent (Generate SRS)
  → Diagrammer Agent (Generate Diagrams)
  → Reviewer Agent (Validate)
  → User (Review & Edit)

  Document Update 
  → Impact Analysis 
  → Related Artefacts Identified
  → AI Agents Update Affected Files
  → Validation
  → User Approval

  ┌──────────────────────────────────────────────────┐
│                  Security Layers                  │
├──────────────────────────────────────────────────┤
│ 🛡️ API Gateway (Rate Limiting, Auth)            │
├──────────────────────────────────────────────────┤
│ 🔑 Service-to-Service (mTLS, Service Mesh)      │
├──────────────────────────────────────────────────┤
│ 📦 Data Layer (Encryption at Rest & Transit)    │
├──────────────────────────────────────────────────┤
│ 📝 Audit Log (All Actions Logged)               │
├──────────────────────────────────────────────────┤
│ 🔍 Security Scanning (DAST, SAST)               │
└──────────────────────────────────────────────────┘

-- Core Tables
projects: id, name, description, template, status, owner_id, created_at
users: id, email, name, role, preferences
artifacts: id, project_id, type (srs, diagram, code), content, version
ai_sessions: id, user_id, agent_type, prompt, response, feedback
deployments: id, project_id, config, status, url
audit_logs: id, user_id, action, details, timestamp

-- Relationships
artifacts → projects (many-to-one)
artifacts → artifacts (many-to-many via links)
artifacts → ai_sessions (many-to-one)

┌─────────────────────────────────────────────────┐
│              Production Environment              │
├─────────────────────────────────────────────────┤
│  Cloud Provider: AWS / GCP / Azure              │
├─────────────────────────────────────────────────┤
│  Kubernetes Cluster                             │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────┐ │
│  │  Web     │ │  API     │ │  Worker         │ │
│  │  Pods    │ │  Pods    │ │  Pods (AI)      │ │
│  └──────────┘ └──────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────┤
│  Managed Services                               │
│  - RDS (PostgreSQL)                            │
│  - ElastiCache (Redis)                         │
│  - S3 (File Storage)                           │
│  - CloudFront (CDN)                            │
└─────────────────────────────────────────────────┘