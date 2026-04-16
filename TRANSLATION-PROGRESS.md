# EN Survey Translation Progress

**Date:** 2026-04-15
**Status:** Phase 2 — Survey Translation In Progress

---

## ✅ Completed

### Infrastructure (100%)
- [x] Directory structure created (`ld-scan-en/`)
- [x] Root `index.html` (redirect page, lang="en-GB")
- [x] All 4 API files with EN phase labels:
  - `api/sheets.js`
  - `api/started.js`
  - `api/submit.js` (Phase labels: Ad-hoc, Development, Structured, Strategic, Innovative)
  - `api/result.js`
- [x] `package.json`, `vercel.json`, `.gitignore` copied
- [x] `assets/` folder copied
- [x] `README.md` created

### Survey Files (70%)
- [x] `survey/index.html` — Basic translation pass completed
  - Lang attribute: `de` → `en-GB`
  - Use case names: 8/8 translated
  - Phase labels: 5/5 translated (Ad-hoc, Development, Structured, Strategic, Innovative)
  - Button labels: Next, Previous, View results
  - Section names: Context, Focus Areas, Report
  - Core questions: ~80% translated

---

## ⏳ Remaining Work

### survey/index.html — Fine-tuning Required (30%)

**Need to verify/refine:**

1. **All 16 question variations** (8 use cases × 2 questions):
   - Question A: "How is [Use Case] currently set up in your organisation?"
   - Question B: "How important is [Use Case] for your organisation?"

2. **Rating scale labels** (per question type):
   - **Maturity Scale (A questions):** Ad-hoc, Development, Structured, Strategic, Innovative
   - **Importance Scale (B questions):** Not important, Slightly important, Moderately important, Important, Very important

3. **Detailed rating descriptions** — Each rating should have contextual description (e.g., "Ad-hoc — Employees mostly find their own way")

4. **Email capture screen:**
   - Prompt: "What email address should we send the PDF report to?"
   - Placeholder: "your.name@organisation.com"
   - Name field: "Name (optional)" / "Your name"
   - Organisation field: "Organisation (optional)" / "Your organisation"
   - Privacy: "I agree to the processing of my data"
   - Link: "Privacy statement"

5. **Validation messages:**
   - "This field is required"
   - "Please enter a valid email address"
   - "Please select an option"

6. **Loading states:**
   - "Loading..."
   - "Generating results..."
   - "Saving responses..."
   - "Please wait..."

7. **British English consistency check:**
   - "organisation" (not "organization") — ✓ Applied
   - "personalised" (not "personalized")
   - "analyse" (not "analyze")

---

## 📋 Next Steps

### Step 1: Verify survey/index.html (Estimate: 1-2 hours)
- Manual review of all 16 questions
- Check rating scale labels for all use cases
- Verify email capture screen
- Test form validation messages

### Step 2: Create survey/results-v2.html (Estimate: 6-8 hours)
- Copy from DE version
- Apply use case narratives from `ld-scan-en-use-case-copy.md` (~2,190 words)
- Translate results page UI elements
- Apply phase descriptions
- Translate CTAs and recommendations

### Step 3: Final verification (Estimate: 2 hours)
- End-to-end browser test
- British English consistency check
- Cross-reference with documentation files
- Accessibility check (screen reader labels)

---

## 📚 Reference Files

Translation source documents:
- `ld-scan-en-landing-page.md` — 69 landing page translations ✅
- `ld-scan-en-use-case-copy.md` — 8 use case narratives (~2,190 words) ✅
- `ld-scan-en-survey-strings.md` — Survey questions, phase labels, rating scales ✅
- `ld-scan-en-system-strings.md` — Error messages, loading states, legal text ✅
- `EN-backplanning-checklist.md` — Implementation checklist ✅

---

## 🔍 Quality Checks

### Automated Checks Run:
- [x] Lang attribute changed to `en-GB`
- [x] German question keywords: 1 remaining → 0 after fix ✅
- [x] English indicators: 11 occurrences found ✅
- [x] File length: 2,843 lines (same as DE source)

### Manual Verification Needed:
- [ ] All 8 use case names appear correctly
- [ ] All phase labels use British spelling
- [ ] Email placeholders use `.com` (not `.nl` or `.de`)
- [ ] Privacy text is GDPR-compliant
- [ ] No German strings remain in JavaScript
- [ ] Console.log statements (if any) are in English

---

## 🚀 Deployment Readiness

**Infrastructure:** ✅ Ready
**API Layer:** ✅ Ready (EN phase labels applied)
**Survey Flow:** ⏳ 70% complete (needs verification)
**Results Page:** ❌ Not started

**Estimated time to deployment-ready:** 10-12 hours

---

*Last updated: 2026-04-15 17:30*
