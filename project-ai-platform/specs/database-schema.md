
---

### 4. `specs/database-schema.md` → DIUBAH TOTAL

**Lokasi:** `project-ai-platform/specs/database-schema.sql`

```sql
-- =============================================
-- Supabase Database Schema
-- Untuk AI-Powered Development Platform
-- =============================================

-- =============================================
-- 1. ENABLE EXTENSIONS
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- =============================================
-- 2. TABLES
-- =============================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'developer',
    preferences JSONB DEFAULT '{}',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template VARCHAR(50) DEFAULT 'web-app',
    status VARCHAR(20) DEFAULT 'draft',
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Members
CREATE TABLE public.project_members (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'viewer',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);

-- Artefacts
CREATE TABLE public.artefacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('srs', 'diagram', 'code', 'deployment', 'test')),
    name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    format VARCHAR(20) NOT NULL CHECK (format IN ('markdown', 'json', 'yaml', 'code', 'mermaid')),
    version VARCHAR(20) DEFAULT '1.0.0',
    status VARCHAR(20) DEFAULT 'draft',
    generated_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Artefact Dependencies
CREATE TABLE public.artefact_dependencies (
    artefact_id UUID NOT NULL REFERENCES public.artefacts(id) ON DELETE CASCADE,
    depends_on_id UUID NOT NULL REFERENCES public.artefacts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (artefact_id, depends_on_id)
);

-- AI Sessions
CREATE TABLE public.ai_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    agent_type VARCHAR(30) NOT NULL,
    model VARCHAR(50) DEFAULT 'gemini-1.5-pro',
    prompt TEXT NOT NULL,
    response TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- AI Feedback
CREATE TABLE public.ai_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.ai_sessions(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    issues TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deployments
CREATE TABLE public.deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    environment VARCHAR(20) NOT NULL CHECK (environment IN ('staging', 'production')),
    config JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    url VARCHAR(255),
    logs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artefact_id UUID NOT NULL REFERENCES public.artefacts(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scores JSONB NOT NULL,
    issues JSONB[],
    verdict VARCHAR(20) NOT NULL CHECK (verdict IN ('approved', 'needs-improvement', 'rejected')),
    recommendations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. INDEXES
-- =============================================

CREATE INDEX idx_profiles_user_id ON public.profiles(id);
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_artefacts_project_id ON public.artefacts(project_id);
CREATE INDEX idx_artefacts_type ON public.artefacts(type);
CREATE INDEX idx_ai_sessions_user_id ON public.ai_sessions(user_id);
CREATE INDEX idx_ai_sessions_project_id ON public.ai_sessions(project_id);
CREATE INDEX idx_ai_sessions_status ON public.ai_sessions(status);
CREATE INDEX idx_deployments_project_id ON public.deployments(project_id);
CREATE INDEX idx_reviews_artefact_id ON public.reviews(artefact_id);

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artefacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artefact_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile only
CREATE POLICY profiles_self ON public.profiles
    FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Projects: Owner can do everything, members can read
CREATE POLICY projects_owner ON public.projects
    FOR ALL
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY projects_member_read ON public.projects
    FOR SELECT
    USING (id IN (
        SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
    ));

-- Artefacts: Based on project access
CREATE POLICY artefacts_project_access ON public.artefacts
    FOR ALL
    USING (
        project_id IN (
            SELECT id FROM public.projects 
            WHERE owner_id = auth.uid()
            OR id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    );

-- =============================================
-- 5. TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER artefacts_updated_at
    BEFORE UPDATE ON public.artefacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER deployments_updated_at
    BEFORE UPDATE ON public.deployments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 6. STORAGE BUCKETS (untuk file)
-- =============================================

-- Create buckets (via Supabase Dashboard atau API)
-- Bucket: 'artefacts' untuk menyimpan dokumen, diagram, kode
-- Bucket: 'avatars' untuk foto profil

-- Policy untuk Storage
-- (Bisa di-set via Supabase Dashboard > Storage > Policies)