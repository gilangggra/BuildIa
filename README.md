# 🚀 AI-Powered Development Platform

Platform terintegrasi untuk membuat project software dari ide sampai deploy dengan AI Agents yang saling terhubung.

## 🎯 Visi
Menjadi "Sistem Operasi untuk Pembuatan Software" di mana semua artefak (dokumen, diagram, kode) terhubung dan sinkron.

## 🏗️ Core Concepts
1. Single Source of Truth - Semua artefak saling terhubung
2. Agentic Development - AI Agents bekerja sebagai tim
3. Spec-Driven Development - Spesifikasi adalah sumber kebenaran
4. Zero-Trust Security - Keamanan di setiap lapisan

## 🤖 AI Agents
| Agent | Fungsi |
|-------|--------|
| Ideator | Ubah ide jadi spesifikasi |
| Documenter | Buat SRS/SKPL |
| Diagrammer | Buat diagram UML |
| Coder | Generate kode |
| Reviewer | Validasi semua artefak |
| Deployer | Generate config deployment |

## 🔧 Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + TailwindCSS |
| Backend | Node.js/NestJS atau Python/FastAPI |
| AI | **Google Gemini AI API** |
| Database | **Supabase (PostgreSQL + Auth + Storage)** |
| Diagrams | Mermaid.js |
| Deployment | Docker + Vercel/Railway |

## 🚀 Quick Start
1. Daftar [Google AI Studio](https://aistudio.google.com/) dapat API Key
2. Daftar [Supabase](https://supabase.com/) dapat Project URL dan Anon Key
3. Copy `.env.example` ke `.env` dan isi key
4. Baca [Project Vision](./docs/01-project-vision.md)
5. Baca [AI Agents Guide](./docs/05-ai-agents-guide.md)
6. Mulai kerjakan tugas sesuai peran agent

## 🔑 Environment Variables
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
JWT_SECRET=your_jwt_secret_here