// Google Sheets version - POST /api/submit
// Saves scan results to Google Sheets and returns the result ID

import { appendRow, COLUMNS } from './sheets.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { result_id, email, organisation, payload } = req.body;

    if (!result_id || !email || !payload) {
      return res.status(400).json({ error: 'Missing required fields: result_id, email, and payload' });
    }

    // Extract data from payload
    const contact = payload.contact || {};
    const context = payload.context || {};
    const useCases = payload.useCases || {};
    const delivery = payload.delivery || {};
    const meta = payload.meta || {};

    // Calculate priority scores
    const results = [];
    Object.keys(useCases).forEach(ucId => {
      const uc = useCases[ucId];
      if (uc && typeof uc.A === 'number' && typeof uc.B === 'number') {
        const priority = uc.B >= 4 && uc.A <= 3 ? uc.B * (6 - uc.A) : 0;
        results.push({ id: ucId, aanpak: uc.A, belang: uc.B, priority });
      }
    });

    results.sort((a, b) => b.priority - a.priority);
    const top3 = results.filter(r => r.priority > 0).slice(0, 3).map(r => r.id);

    // Calculate average score (0-100)
    const avgScore = results.length > 0
      ? Math.round((results.reduce((sum, r) => sum + r.aanpak, 0) / results.length / 5) * 100)
      : 0;

    // Determine maturity phase (EN labels)
    let phase;
    if (avgScore < 30) phase = 'Ad-hoc';
    else if (avgScore < 50) phase = 'Development';
    else if (avgScore < 70) phase = 'Structured';
    else if (avgScore < 85) phase = 'Strategic';
    else phase = 'Innovative';

    const completedAt = meta.completed_at
      ? new Date(meta.completed_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    // Build row values in exact column order (see COLUMNS in sheets.js)
    const row = [
      result_id,
      email,
      contact.voornaam || '',
      contact.achternaam || '',
      organisation || contact.organisatie || '',
      contact.telefoon || '',
      completedAt,
      context.org_goals_2026 || '',
      context.strategic_goals_ranked?.[0] || context.strategic_goal || '',
      context.ld_challenge || '',
      useCases.onboarding?.A ?? '', useCases.onboarding?.B ?? '',
      useCases.kennisdeling?.A ?? '', useCases.kennisdeling?.B ?? '',
      useCases.kwalificatie?.A ?? '', useCases.kwalificatie?.B ?? '',
      useCases.training?.A ?? '', useCases.training?.B ?? '',
      useCases.regie?.A ?? '', useCases.regie?.B ?? '',
      useCases.reskilling?.A ?? '', useCases.reskilling?.B ?? '',
      useCases.strategie?.A ?? '', useCases.strategie?.B ?? '',
      useCases.mobiliteit?.A ?? '', useCases.mobiliteit?.B ?? '',
      avgScore,
      top3[0] || '', top3[1] || '', top3[2] || '',
      delivery.instant ?? '', delivery.email ?? '',
      delivery.consultation || '', delivery.meeting_booked ?? '',
      phase,
      JSON.stringify(payload),
    ];

    await appendRow(row);

    console.log('Saved to Google Sheets - ID:', result_id, 'Score:', avgScore, 'Phase:', phase);

    // Fire-and-forget n8n webhook (don't block user response)
    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'completed',
          result_id,
          email,
          first_name: contact.voornaam || '',
          last_name: contact.achternaam || '',
          organisation: organisation || contact.organisatie || '',
          phone: contact.telefoon || '',
          score: avgScore,
          phase,
          priorities: top3,
          strategic_goal: context.strategic_goals_ranked?.[0] || context.strategic_goal || '',
          ld_challenge: context.ld_challenge || '',
          consultation: delivery.consultation || '',
          meeting_booked: delivery.meeting_booked ?? false,
          completed_at: completedAt,
          payload,
        }),
      }).catch(err => console.error('n8n webhook error (non-blocking):', err.message));
    }

    return res.status(200).json({
      success: true,
      result_id,
      score: avgScore,
      phase,
    });

  } catch (error) {
    console.error('Submit error:', error);
    return res.status(500).json({ error: 'Failed to save results', details: error.message });
  }
}
