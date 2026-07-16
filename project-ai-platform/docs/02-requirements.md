# 📋 Requirements

## 🎯 Functional Requirements

### Project Management
| ID | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-01 | User dapat membuat project | High |
| FR-02 | User dapat mengelola project | High |
| FR-03 | User dapat mengundang collaborator | Medium |

### Document Generation
| ID | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-04 | Generate SKPL/SRS dari ide | High |
| FR-05 | Edit dokumen real-time | High |
| FR-06 | Export ke .docx, .pdf, .md | High |

### Diagram Generation
| ID | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-07 | Generate Use Case Diagram | High |
| FR-08 | Generate Class Diagram | High |
| FR-09 | Generate Sequence Diagram | High |
| FR-10 | Generate ERD | High |

### Code Generation
| ID | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-11 | Generate kode dari spesifikasi | High |
| FR-12 | Support multiple languages | High |
| FR-13 | Generate test cases | High |

### Integration & Sync
| ID | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-14 | Sinkronisasi otomatis antar artefak | High |
| FR-15 | Impact analysis | High |

## ⚙️ Non-Functional Requirements
| Kategori | Target |
|----------|--------|
| Response time | < 5 detik |
| Uptime | 99.9% |
| Concurrent users | 1000+ |
| Code coverage | > 80% |

## 🔑 API & Database Requirements

### Google Gemini AI
| Item | Deskripsi |
|------|-----------|
| API | Google Gemini API (gemini-1.5-pro atau gemini-2.0-flash) |
| Base URL | https://generativelanguage.googleapis.com/v1beta |
| Auth | API Key (dari Google AI Studio) |
| Features | Text generation, JSON mode, Multi-turn chat |

### Supabase
| Item | Deskripsi |
|------|-----------|
| Service | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Auth | Email/Password, OAuth (Google, GitHub) |
| Database | PostgreSQL dengan Row Level Security (RLS) |
| Storage | Upload dokumen, diagram, code |
| Realtime | Live sync untuk kolaborasi |