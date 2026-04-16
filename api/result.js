// Google Sheets version - GET /api/result?id=xxx
// Fetches scan results by Result ID from Google Sheets

import { findRowByResultId } from './sheets.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing result ID' });
    }

    const row = await findRowByResultId(id);

    if (!row) {
      return res.status(404).json({ error: 'Result not found' });
    }

    // If the row has a Payload column (new submissions), parse and return it directly
    if (row['Payload']) {
      try {
        const payload = JSON.parse(row['Payload']);
        return res.status(200).json({
          success: true,
          payload,
          score: parseInt(row['Score'], 10) || 0,
          phase: row['Phase'] || null,
        });
      } catch (e) {
        console.error('Failed to parse Payload JSON:', e);
      }
    }

    // Fallback for old rows without Payload column: reconstruct from flat columns
    const payload = {
      contact: {
        voornaam: row['First Name'] || '',
        achternaam: row['Last Name'] || '',
        naam: [row['First Name'], row['Last Name']].filter(Boolean).join(' '),
        email: row['Email'] || '',
        organisatie: row['Organisation'] || '',
      },
      context: {
        org_goals_2026: row['Org Goals 2026'] || '',
        strategic_goal: row['Strategic Goal'] || '',
        ld_challenge: row['LD Challenge'] || '',
      },
      useCases: {
        onboarding: { A: num(row['Onboarding A']), B: num(row['Onboarding B']) },
        kennisdeling: { A: num(row['Kennisdeling A']), B: num(row['Kennisdeling B']) },
        kwalificatie: { A: num(row['Kwalificatie A']), B: num(row['Kwalificatie B']) },
        training: { A: num(row['Training A']), B: num(row['Training B']) },
        regie: { A: num(row['Regie A']), B: num(row['Regie B']) },
        reskilling: { A: num(row['Reskilling A']), B: num(row['Reskilling B']) },
        strategie: { A: num(row['Strategie A']), B: num(row['Strategie B']) },
        mobiliteit: { A: num(row['Mobiliteit A']), B: num(row['Mobiliteit B']) },
      },
      delivery: {
        instant: row['Delivery Instant'] === 'TRUE',
        email: row['Delivery Email'] === 'TRUE',
        consultation: row['Consultation'] || null,
        meeting_booked: row['Meeting Booked'] === 'TRUE',
      },
    };

    // Recalculate score/phase for old rows without Phase column (EN labels)
    const score = parseInt(row['Score'], 10) || 0;
    let phase = row['Phase'];
    if (!phase) {
      if (score < 30) phase = 'Ad-hoc';
      else if (score < 50) phase = 'Development';
      else if (score < 70) phase = 'Structured';
      else if (score < 85) phase = 'Strategic';
      else phase = 'Innovative';
    }

    return res.status(200).json({
      success: true,
      payload,
      score,
      phase,
    });

  } catch (error) {
    console.error('Fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch results' });
  }
}

function num(val) {
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}
