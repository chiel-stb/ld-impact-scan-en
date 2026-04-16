# L&D Impact Scan EN — Deployment Guide for Casper

**Project:** L&D Impact Scan — English Version
**Domain:** scan.studytube.com
**Status:** Ready for Deployment
**Owner:** Casper (Marketing Ops) + Oleksii (DNS)

---

## 🎯 Overview

We're launching the **English version** of the L&D Impact Scan following the same pattern as the German (DE) version from March 2026.

**What's ready:**
- ✅ All code translated (11 files, ~9,375 lines)
- ✅ API endpoints with English phase labels
- ✅ Survey flow functional
- ✅ Results page functional
- ✅ PDF templates ready
- ✅ Smoke tested and verified

**What you need to set up:**
- DNS record for scan.studytube.com
- Google Sheet for EN submissions
- n8n webhook for EN flow
- Vercel project and deployment
- Environment variables

**Timeline:** ~2-3 hours active work + 24-48h DNS propagation

---

## 📋 Step-by-Step Checklist

### STEP 1: DNS Configuration (Oleksii) — 5-30 minutes

**Action:** Create DNS record for scan.studytube.com

**Details:**
```
Type: CNAME
Name: scan
Value: cname.vercel-dns.com
Domain: studytube.com
TTL: 3600 (or automatic)
```

**How to request:**
1. Go to Slack channel: `#devops-input-and-questions`
2. Post message:
   ```
   Hi @Oleksii,

   We need a DNS record for the EN L&D Impact Scan:

   Type: CNAME
   Name: scan
   Value: cname.vercel-dns.com
   Domain: studytube.com

   This is for scan.studytube.com (English version of the scan)

   Same setup as we did for scan.studytube.de

   Thanks!
   ```

**Verification:**
```bash
# After 24-48h, check DNS propagation
nslookup scan.studytube.com

# Should return: cname.vercel-dns.com
```

**Status:** [ ] Requested [ ] Confirmed [ ] Propagated

---

### STEP 2: Google Sheet Setup (Casper) — 15 minutes

**Action:** Create new Google Sheet for EN scan submissions

#### 2.1 Create New Sheet

1. Go to Google Drive
2. Create new Google Sheet
3. Name it: **"L&D Impact Scan — EN Submissions"**
4. Create 2 tabs:
   - **"Completed"** (main data)
   - **"Started"** (early email captures)

#### 2.2 Set Up "Completed" Tab

**Headers (Row 1) — 31 columns exactly:**

Copy this row into A1:

```
Result ID	Email	First Name	Last Name	Organisation	Phone	Completed At	Org Goals 2026	Strategic Goal	LD Challenge	Onboarding A	Onboarding B	Kennisdeling A	Kennisdeling B	Kwalificatie A	Kwalificatie B	Training A	Training B	Regie A	Regie B	Reskilling A	Reskilling B	Strategie A	Strategie B	Mobiliteit A	Mobiliteit B	Score	Prio 1	Prio 2	Prio 3	Delivery Instant	Delivery Email	Consultation	Meeting Booked	Phase	Payload
```

**Column Details:**
- **A:** Result ID (e.g., EN-2026-04-15-ABC123)
- **B:** Email
- **C:** First Name
- **D:** Last Name
- **E:** Organisation
- **F:** Phone
- **G:** Completed At (date)
- **H:** Org Goals 2026 (text)
- **I:** Strategic Goal (dropdown)
- **J:** LD Challenge (dropdown)
- **K-Z:** Use case scores (A and B ratings for 8 use cases)
- **AA:** Score (0-100)
- **AB-AD:** Prio 1, Prio 2, Prio 3 (use case IDs)
- **AE-AH:** Delivery options (booleans)
- **AI:** Phase (Development/Structured/Strategic/Innovative)
- **AJ:** Payload (full JSON)

#### 2.3 Set Up "Started" Tab

**Headers (Row 1) — 3 columns:**

```
Result ID	Email	Started At
```

#### 2.4 Format Sheet

1. **Freeze header row:** View → Freeze → 1 row
2. **Auto-resize columns:** Select all → Format → Resize columns → Fit to data
3. **Set text wrapping:** Select all → Format → Text wrapping → Clip
4. **Bold headers:** Select row 1 → Bold

#### 2.5 Share with Service Account

**Service Account Email:** (use same as NL/DE)
```
[YOUR_SERVICE_ACCOUNT_EMAIL]@[PROJECT_ID].iam.gserviceaccount.com
```

**How to share:**
1. Click "Share" button (top right)
2. Add service account email
3. Set permission: **Editor**
4. Uncheck "Notify people"
5. Click "Share"

#### 2.6 Copy Sheet ID

1. Look at the URL of your Google Sheet:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```
2. Copy the `[SHEET_ID]` part
3. Save it — you'll need this for Vercel env vars

**Example Sheet ID:** `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t`

**Sheet ID:** `________________________________` ← Write it here

**Status:** [ ] Created [ ] Shared [ ] ID copied

---

### STEP 3: n8n Webhook Setup (Casper) — 30 minutes

**Action:** Create new n8n workflow for EN scan submissions

#### 3.1 Create New Workflow

1. Go to n8n instance
2. Create new workflow
3. Name it: **"L&D Impact Scan — EN"**

#### 3.2 Add Webhook Node

**Webhook Configuration:**
```
Method: POST
Path: /webhook/ld-scan-en
Authentication: None
Response Mode: Last Node
```

**Webhook URL will be:**
```
https://[YOUR_N8N_INSTANCE]/webhook/ld-scan-en
```

Save this URL — you'll need it for Vercel env vars.

**Webhook URL:** `________________________________` ← Write it here

#### 3.3 Add Google Sheets Node

**Action:** Append Row

**Configuration:**
- **Spreadsheet:** L&D Impact Scan — EN Submissions
- **Sheet:** Completed
- **Data Mode:** Auto-Map
- **Mapping:**
  ```
  Result ID: {{ $json.result_id }}
  Email: {{ $json.email }}
  First Name: {{ $json.first_name }}
  Last Name: {{ $json.last_name }}
  Organisation: {{ $json.organisation }}
  Phone: {{ $json.phone }}
  Completed At: {{ $json.completed_at }}
  Org Goals 2026: {{ $json.org_goals }}
  Strategic Goal: {{ $json.strategic_goal }}
  LD Challenge: {{ $json.ld_challenge }}
  Score: {{ $json.score }}
  Prio 1: {{ $json.priorities[0] }}
  Prio 2: {{ $json.priorities[1] }}
  Prio 3: {{ $json.priorities[2] }}
  Phase: {{ $json.phase }}
  Payload: {{ JSON.stringify($json.payload) }}
  ```

#### 3.4 Add Slack Notification Node

**Configuration:**
- **Channel:** #scan-submissions (or create #scan-submissions-en)
- **Message Template:**
  ```
  🎯 *New EN Impact Scan Completion*

  *Email:* {{ $json.email }}
  *Organisation:* {{ $json.organisation }}
  *Score:* {{ $json.score }}/100
  *Phase:* {{ $json.phase }}

  *Top 3 Priorities:*
  1. {{ $json.priorities[0] }}
  2. {{ $json.priorities[1] }}
  3. {{ $json.priorities[2] }}

  *Consultation:* {{ $json.consultation ? 'Yes ✅' : 'No' }}
  *Meeting Booked:* {{ $json.meeting_booked ? 'Yes ✅' : 'No' }}
  ```

#### 3.5 Add HubSpot Node (Contact Create/Update)

**Configuration:**
- **Operation:** Upsert (Create or Update)
- **Match By:** Email
- **Properties:**
  ```
  Email: {{ $json.email }}
  First Name: {{ $json.first_name }}
  Last Name: {{ $json.last_name }}
  Company: {{ $json.organisation }}
  Phone: {{ $json.phone }}

  Custom Properties:
  - ld_scan_market: "EN"
  - scan_completed: true
  - scan_score: {{ $json.score }}
  - scan_phase: {{ $json.phase }}
  - scan_prio_1: {{ $json.priorities[0] }}
  - scan_prio_2: {{ $json.priorities[1] }}
  - scan_prio_3: {{ $json.priorities[2] }}
  - scan_completed_date: {{ $json.completed_at }}
  - scan_consultation_requested: {{ $json.consultation ? true : false }}
  ```

**Note:** Confirm these custom properties exist in HubSpot with Anne Mein. They should already exist from NL/DE setup.

#### 3.6 Add Deal Creation (Optional)

**If consultation requested:**
- Create deal in HubSpot
- Deal name: "L&D Impact Scan — {{ $json.organisation }}"
- Pipeline: [Your pipeline]
- Stage: "Demo Requested"
- Amount: 0
- Owner: Assign to Twan's team

#### 3.7 Test Webhook

```bash
# Test with curl
curl -X POST https://[YOUR_N8N_INSTANCE]/webhook/ld-scan-en \
  -H "Content-Type: application/json" \
  -d '{
    "event": "completed",
    "result_id": "TEST-EN-001",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "organisation": "Test Company Ltd",
    "phone": "+44 20 1234 5678",
    "score": 65,
    "phase": "Structured",
    "priorities": ["onboarding", "kennisdeling", "reskilling"],
    "strategic_goal": "Growth",
    "ld_challenge": "Limited budget",
    "consultation": "Yes, I want a demo",
    "meeting_booked": false,
    "completed_at": "2026-04-15",
    "payload": {}
  }'
```

**Expected:**
- ✅ New row in Google Sheet
- ✅ Slack notification posted
- ✅ HubSpot contact created/updated
- ✅ n8n returns 200 OK

**Status:** [ ] Created [ ] Tested [ ] Working

---

### STEP 4: Vercel Project Setup (Casper) — 30 minutes

#### 4.1 Create New Vercel Project

**Via CLI (Recommended):**

```bash
# Navigate to project directory
cd "/Users/chiel.muurlings/Documents/Claude/08_projects/current/L&D Impact Scan/ld-scan-en"

# Link to Vercel (create new project)
npx vercel link --scope studytube-b857fc2d --project ld-impact-scan-en --yes

# Output will be:
# > Linked to studytube-b857fc2d/ld-impact-scan-en
```

**Via Vercel Dashboard (Alternative):**

1. Go to vercel.com
2. Click "Add New Project"
3. Select Studytube team account
4. Import from: [GitHub repo if exists, or upload folder]
5. Project name: `ld-impact-scan-en`
6. Framework: None (static + serverless)
7. Root directory: `./`
8. Build settings: Leave default

#### 4.2 Add Custom Domain

**In Vercel Dashboard:**

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter: `scan.studytube.com`
4. Click "Add"
5. Vercel will verify DNS (must wait for Step 1 DNS propagation)
6. Once verified, SSL certificate will auto-generate

**Expected result:**
```
scan.studytube.com → Production
SSL: Auto-generated (Let's Encrypt)
Status: Active
```

#### 4.3 Set Environment Variables

**CRITICAL:** Set for **ALL THREE** environments:
- Production
- Preview
- Development

**Go to:** Project Settings → Environment Variables

**Add 4 variables:**

---

**Variable 1: GOOGLE_SERVICE_ACCOUNT_EMAIL**

```
Key: GOOGLE_SERVICE_ACCOUNT_EMAIL
Value: [SAME AS NL/DE]
Environments: ✓ Production ✓ Preview ✓ Development
```

Example value:
```
studytube-scan@studytube-123456.iam.gserviceaccount.com
```

---

**Variable 2: GOOGLE_PRIVATE_KEY**

```
Key: GOOGLE_PRIVATE_KEY
Value: [SAME AS NL/DE]
Environments: ✓ Production ✓ Preview ✓ Development
```

**IMPORTANT:** Use `printf` not `echo` if adding via CLI!

```bash
# CORRECT way via CLI:
printf "GOOGLE_PRIVATE_KEY\n$(cat path/to/key.pem)" | npx vercel env add production

# WRONG way (adds newline, breaks key):
echo "$(cat path/to/key.pem)" | npx vercel env add production
```

Value format (starts with `-----BEGIN PRIVATE KEY-----`):
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
[many lines]
...xyz
-----END PRIVATE KEY-----
```

---

**Variable 3: GOOGLE_SHEET_ID**

```
Key: GOOGLE_SHEET_ID
Value: [FROM STEP 2.6 ABOVE]
Environments: ✓ Production ✓ Preview ✓ Development
```

Example value:
```
1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
```

**Use the Sheet ID you copied in Step 2.6!**

---

**Variable 4: N8N_WEBHOOK_URL**

```
Key: N8N_WEBHOOK_URL
Value: [FROM STEP 3.2 ABOVE]
Environments: ✓ Production ✓ Preview ✓ Development
```

Example value:
```
https://n8n.studytube.com/webhook/ld-scan-en
```

**Use the webhook URL you copied in Step 3.2!**

---

**Verification Checklist:**

- [ ] All 4 variables added
- [ ] Each variable set for Production
- [ ] Each variable set for Preview
- [ ] Each variable set for Development
- [ ] GOOGLE_PRIVATE_KEY has no trailing newline (if added via CLI)
- [ ] GOOGLE_SHEET_ID matches your EN sheet
- [ ] N8N_WEBHOOK_URL points to EN webhook

**Status:** [ ] All env vars set [ ] Verified

---

### STEP 5: Deploy to Production (Casper) — 15 minutes

#### 5.1 First Deployment

```bash
# Navigate to project
cd "/Users/chiel.muurlings/Documents/Claude/08_projects/current/L&D Impact Scan/ld-scan-en"

# Deploy to production
npx vercel --prod --yes

# Output will show:
# > Deploying to production...
# > https://scan.studytube.com
# > ✅ Deployed successfully
```

**Expected result:**
```
Production: https://scan.studytube.com (Ready)
```

#### 5.2 Verify Deployment

**Check 1: Root redirect**
```bash
curl -I https://scan.studytube.com
# Should return: 302 redirect to /survey
```

**Check 2: Survey page loads**
```bash
curl -I https://scan.studytube.com/survey
# Should return: 200 OK
```

**Check 3: API endpoint responds**
```bash
curl https://scan.studytube.com/api/result?id=test
# Should return: {"error":"Result not found"} (expected for test ID)
```

**Check 4: SSL certificate**
- Open https://scan.studytube.com in browser
- Check for 🔒 padlock icon
- Certificate should be valid (Let's Encrypt)

**Status:** [ ] Deployed [ ] Root works [ ] Survey loads [ ] API responds [ ] SSL active

---

### STEP 6: End-to-End Testing (Casper + Chiel) — 1 hour

#### 6.1 Complete Test Scan

1. Go to https://scan.studytube.com
2. Complete full survey (all 8 use cases)
3. Use test email: `test+en@studytube.com`
4. Fill in organisation: "Test Company"
5. Submit survey

#### 6.2 Verify Results Page

- [ ] Results page loads
- [ ] Shows overall score
- [ ] Shows phase label in English
- [ ] Top 3 priorities display
- [ ] All 8 use cases visible
- [ ] Opportunities show per use case
- [ ] Success factors show per use case
- [ ] No German text visible
- [ ] CTAs work (Book a Demo, Download PDF)

#### 6.3 Verify Backend Integration

**Check Google Sheet:**
- [ ] New row added to "Completed" tab
- [ ] All 31 columns populated
- [ ] Email correct
- [ ] Score calculated correctly
- [ ] Phase label in English (e.g., "Structured")
- [ ] Top 3 priorities listed
- [ ] Payload column has JSON

**Check n8n:**
- [ ] Webhook received POST request
- [ ] Workflow executed successfully
- [ ] No errors in execution log

**Check Slack:**
- [ ] Notification posted to channel
- [ ] Shows email, organisation, score
- [ ] Shows top 3 priorities
- [ ] Consultation status visible

**Check HubSpot:**
- [ ] Contact created or updated
- [ ] Email matches
- [ ] Custom property `ld_scan_market` = "EN"
- [ ] `scan_completed` = true
- [ ] `scan_score` matches result
- [ ] `scan_phase` in English
- [ ] Top 3 priorities stored

#### 6.4 Test PDF Generation

**Executive Summary:**
1. Go to https://scan.studytube.com/executive-summary.html?id=[RESULT_ID]
2. Check page loads
3. Verify score displays
4. Verify phase label
5. Print to PDF (Cmd+P)
6. Check A4 landscape layout
7. Verify no German text

**Full Report:**
1. Go to https://scan.studytube.com/report-pdf.html?id=[RESULT_ID]
2. Check page loads
3. Verify all 8 use cases populate
4. Print to PDF (Cmd+P)
5. Check A4 portrait, multi-page
6. Verify page breaks
7. Verify no German text

**Status:** [ ] Test scan complete [ ] Results verified [ ] Backend verified [ ] PDFs tested

---

### STEP 7: Cross-Browser Testing (Chiel) — 30 minutes

**Test in:**
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

**For each browser:**
- [ ] Survey loads correctly
- [ ] Can complete all 8 use cases
- [ ] Results page displays
- [ ] CTAs clickable
- [ ] No console errors

**Mobile:**
- [ ] iOS Safari
- [ ] Android Chrome

**Status:** [ ] Desktop tested [ ] Mobile tested

---

### STEP 8: Stakeholder Sign-Off (All) — Async

#### 8.1 Internal Testing

- [ ] Chiel: Content review (British English, tone)
- [ ] Imke: Final sign-off on EN copy
- [ ] Twan: SDR team briefed on EN leads

#### 8.2 Brief SDR Team

**Message for Twan:**

```
Hi Twan,

The EN L&D Impact Scan is now live at scan.studytube.com

Key info for your team:
• Market tag in HubSpot: ld_scan_market = "EN"
• Routing: Same as NL (your team)
• Consultation booking: [RevenueHero or HubSpot Meetings?]
• Language: British English
• Target: International/global English-speaking prospects

Any EN scan completions will show up in HubSpot with the "EN" market tag.

Let me know if you need any adjustments to the flow!
```

**Status:** [ ] SDR team briefed [ ] Consultation system configured

---

## 📊 Infrastructure Summary

### URLs
```
Production:  https://scan.studytube.com
Survey:      https://scan.studytube.com/survey
Results:     https://scan.studytube.com/survey/results-v2
Exec PDF:    https://scan.studytube.com/executive-summary.html?id=xxx
Full PDF:    https://scan.studytube.com/report-pdf.html?id=xxx
```

### Backend Services
```
Google Sheet:  L&D Impact Scan — EN Submissions
  - Tab 1:     Completed (31 columns)
  - Tab 2:     Started (3 columns)

n8n Webhook:   https://[n8n]/webhook/ld-scan-en
  - Flow:      POST → Sheet → Slack → HubSpot

HubSpot:       Same instance as NL/DE
  - Market:    ld_scan_market = "EN"
  - Routing:   Twan's team
```

### Environment Variables (Vercel)
```
GOOGLE_SERVICE_ACCOUNT_EMAIL  [same as NL/DE]
GOOGLE_PRIVATE_KEY            [same as NL/DE]
GOOGLE_SHEET_ID               [new EN sheet]
N8N_WEBHOOK_URL               [new EN webhook]
```

---

## 🚨 Troubleshooting

### Issue: DNS not resolving

**Symptom:** `scan.studytube.com` not found
**Solution:**
- Wait 24-48h for propagation
- Check with `nslookup scan.studytube.com`
- Contact Oleksii if still not working after 48h

---

### Issue: SSL certificate not generating

**Symptom:** Certificate error in browser
**Solution:**
```bash
# Manually trigger certificate
npx vercel certs issue scan.studytube.com
```

---

### Issue: API returns 500 error

**Symptom:** Survey submission fails
**Check:**
1. Vercel logs: `npx vercel logs`
2. Environment variables set correctly
3. Google Sheet permissions (service account is Editor)
4. Sheet ID is correct

**Common cause:** `GOOGLE_PRIVATE_KEY` has trailing newline

**Fix:** Re-add using `printf` method

---

### Issue: n8n webhook not firing

**Symptom:** No Slack notification, no HubSpot contact
**Check:**
1. n8n workflow is **activated** (toggle at top)
2. Webhook URL is correct in Vercel env vars
3. n8n execution log shows errors
4. CORS settings allow scan.studytube.com

**Test webhook:**
```bash
curl -X POST [N8N_WEBHOOK_URL] \
  -H "Content-Type: application/json" \
  -d '{"event":"completed","email":"test@test.com"}'
```

---

### Issue: Google Sheet not updating

**Symptom:** Submissions complete but no new rows
**Check:**
1. Sheet ID is correct in Vercel env vars
2. Service account has Editor permission
3. Sheet tab is named exactly "Completed"
4. Sheet has all 31 columns

**Debug:**
- Check Vercel function logs
- Verify API response in browser DevTools
- Test Google Sheets API directly

---

### Issue: Results page shows 404

**Symptom:** After submission, results page not found
**Check:**
1. Result ID saved to Google Sheet
2. `/api/result?id=xxx` endpoint returns data
3. Results page URL format correct
4. LocalStorage fallback working

**Fallback:**
Results page tries:
1. API first (`/api/result?id=xxx`)
2. LocalStorage second (if API fails)

---

## ✅ Final Checklist

**Before marking complete:**

- [ ] DNS record created and propagated
- [ ] Google Sheet created with 31 columns
- [ ] Google Sheet shared with service account
- [ ] n8n webhook created and tested
- [ ] Vercel project created
- [ ] Custom domain added to Vercel
- [ ] All 4 environment variables set (prod/preview/dev)
- [ ] Deployed to production
- [ ] SSL certificate active
- [ ] End-to-end test completed successfully
- [ ] Google Sheet receives data
- [ ] n8n workflow executes
- [ ] Slack notification works
- [ ] HubSpot contact created with EN tag
- [ ] PDF generation tested
- [ ] Cross-browser tested
- [ ] SDR team briefed
- [ ] Stakeholders signed off

---

## 📞 Contacts for Issues

| Issue Type | Contact | Channel |
|------------|---------|---------|
| DNS problems | Oleksii | #devops-input-and-questions |
| HubSpot config | Anne Mein | Direct |
| Code/content | Chiel | Slack DM |
| n8n workflow | Casper | - |
| SDR routing | Twan | Direct |
| Content approval | Imke | Direct |

---

## 📁 Reference Files

**Location:** `/08_projects/current/L&D Impact Scan/ld-scan-en/`

**Documentation:**
- `README.md` — Project overview
- `FINAL-STATUS.md` — Complete status
- `SMOKE-TEST-RESULTS.md` — Test results
- `CASPER-DEPLOYMENT-GUIDE.md` — This file
- `EN-backplanning-checklist.md` — Original planning

**Code Files:**
- `index.html` — Root redirect
- `executive-summary.html` — 1-page PDF
- `report-pdf.html` — Full PDF
- `api/*.js` — 4 API endpoints
- `survey/*.html` — Survey + results pages

---

## 🎯 Success Criteria

**Launch is successful when:**

✅ scan.studytube.com resolves with SSL
✅ Users can complete full survey in English
✅ Results page displays correctly
✅ PDFs generate without German text
✅ Google Sheet receives submissions
✅ Slack notifications arrive
✅ HubSpot contacts created with "EN" tag
✅ Twan's team receives EN leads
✅ No critical errors in logs
✅ British English throughout

---

## 🚀 Estimated Timeline

| Step | Time | Dependencies |
|------|------|--------------|
| DNS request | 5 min | Oleksii availability |
| DNS propagation | 24-48h | DNS servers |
| Google Sheet setup | 15 min | - |
| n8n workflow | 30 min | - |
| Vercel project | 30 min | - |
| Environment variables | 15 min | Step 2-3 complete |
| Deploy | 15 min | DNS propagated |
| Testing | 1 hour | Deployment complete |
| **Total active work** | **2-3 hours** | |
| **Total calendar time** | **1-3 days** | (DNS wait) |

---

**Ready to start?**

Begin with Step 1 (DNS) → Step 2-3 (parallel) → Step 4-5 (deploy) → Step 6-8 (test)

**Questions?** Contact Chiel

---

*Deployment guide created: 2026-04-15*
*Based on: DE deployment (March 2026)*
*Status: Ready for execution*
