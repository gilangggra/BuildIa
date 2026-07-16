
---

### 7. `docs/06-testing-strategy.md`
```markdown
# 🧪 Testing Strategy

## 🎯 Testing Philosophy
"Setiap artefak harus diuji. Tidak hanya kode, tapi juga dokumen dan diagram."

## 📊 Testing Pyramid

┌─────────────┐
│ E2E Tests │ ← Few, High-level
├─────────────┤
│ Integration │
│ Tests │ ← Some, Medium-level
├─────────────┤
│ Unit Tests │ ← Many, Low-level
└─────────────┘
┌─────────────┐
│ AI Tests │ ← Quality validation
└─────────────┘


## 🧪 Test Types

### 1. Unit Tests
```typescript
// Test individual components
describe('ProjectService', () => {
  it('should create project', async () => {
    const project = await projectService.create({
      name: 'Test Project',
      template: 'web-app'
    })
    expect(project.id).toBeDefined()
    expect(project.status).toBe('draft')
  })
})

// Test service interactions
describe('AI Service Integration', () => {
  it('should generate document from spec', async () => {
    const spec = await ideatorAgent.interpret('Create e-commerce')
    const doc = await documenterAgent.generate(spec)
    expect(doc).toHaveProperty('requirements')
    expect(doc.requirements).toHaveLength.greaterThan(0)
  })
})

// Test full user flows
describe('Project Generation Flow', () => {
  it('should create project from idea to deploy', async () => {
    // 1. User enters idea
    await page.fill('#idea', 'Create social media app')
    await page.click('#generate')
    
    // 2. AI generates spec
    await expect(page.locator('.spec-draft')).toBeVisible()
    
    // 3. User approves
    await page.click('#approve')
    
    // 4. Code is generated
    await expect(page.locator('.code-output')).toBeVisible()
    
    // 5. Deploy
    await page.click('#deploy')
    await expect(page.locator('.deploy-status')).toHaveText('Ready')
  })
})

def test_document_quality(srs_document):
    # Check requirements coverage
    assert len(srs_document.requirements) >= 10
    
    # Check format compliance
    assert srs_document.has_section('Introduction')
    assert srs_document.has_section('Requirements')
    assert srs_document.has_section('Use Cases')
    
    # Check consistency
    assert srs_document.use_cases == list(srs_document.requirements.use_cases)

    def test_diagram_validation(diagram):
    # Check syntax
    assert mermaid.validate(diagram.code)
    
    # Check completeness
    assert len(diagram.actors) >= 1
    assert len(diagram.use_cases) >= 3
    
    # Check consistency with SRS
    assert diagram.use_cases == srs_document.use_cases

    def test_code_quality(generated_code):
    # Lint check
    assert pylint.score(generated_code) >= 8.0
    
    # Security scan
    assert bandit.scan(generated_code).no_critical
    
    # Test coverage
    assert coverage.report() >= 80

    describe('Performance Tests', () => {
  it('should generate document in under 5s', async () => {
    const start = Date.now()
    await documenterAgent.generate(spec)
    const duration = Date.now() - start
    expect(duration).toBeLessThan(5000)
  })
  
  it('should handle 100 concurrent requests', async () => {
    const requests = Array(100).fill().map(() => 
      aiService.generate(spec)
    )
    const results = await Promise.all(requests)
    expect(results).toHaveLength(100)
  })
})

┌──────────────────────────────────────────────┐
│              Testing Workflow                 │
├──────────────────────────────────────────────┤
│ 1. Developer writes code                     │
│    ↓                                         │
│ 2. Pre-commit hooks run                      │
│    - Lint check                              │
│    - Unit tests                              │
│    - AI quality check                        │
│    ↓                                         │
│ 3. CI runs on PR                            │
│    - All unit tests                          │
│    - Integration tests                       │
│    - Security scan                           │
│    - AI validation                           │
│    ↓                                         │
│ 4. Manual QA Review                         │
│    ↓                                         │
│ 5. Staging deployment                        │
│    - E2E tests                               │
│    - Performance tests                       │
│    - User acceptance                         │
│    ↓                                         │
│ 6. Production deployment                     │
│    - Smoke tests                             │
│    - Monitoring                              │
└──────────────────────────────────────────────┘

 Test Coverage Targets
Component	Unit	Integration	E2E	AI
Frontend	80%	70%	60%	N/A
Backend	    85%	75%	60%	N/A
AI Agents	90%	80%	70%	95%
Generation	80%	75%	65%	90%
Deployment	70%	80%	60%	N/A

 Bug Tracking
Severity Levels
Critical: System crash, data loss

High: Feature broken, major issue

Medium: Feature partially working

Low: Minor UX issue, typo

New → Assigned → In Progress → Fixed → Verified → Closed

Continuous Improvement
Weekly review of test results

Monthly update of test coverage targets

Quarterly review of testing strategy

Continuous feedback loop from production

Regular updates to AI validation models