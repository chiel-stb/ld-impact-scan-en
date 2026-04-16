// POST /api/started — Logs that a user started the scan (early email capture)
// Writes to "Started" sheet in Google Sheets

import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Started';

let sheetsClient = null;

function getSheets() {
  if (sheetsClient) return sheetsClient;
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { result_id, email } = req.body;

    if (!result_id || !email) {
      return res.status(400).json({ error: 'Missing required fields: result_id, email' });
    }

    const startedAt = new Date().toISOString();

    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:C`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[result_id, email, startedAt]],
      },
    });

    // Fire-and-forget n8n webhook for "started" event
    if (process.env.N8N_WEBHOOK_URL_STARTED || process.env.N8N_WEBHOOK_URL) {
      const webhookUrl = process.env.N8N_WEBHOOK_URL_STARTED || process.env.N8N_WEBHOOK_URL;
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'started',
          result_id,
          email,
          started_at: startedAt,
        }),
      }).catch(err => console.error('n8n started webhook error (non-blocking):', err.message));
    }

    console.log('Started logged - ID:', result_id, 'Email:', email);

    return res.status(200).json({ success: true, result_id });
  } catch (error) {
    console.error('Started error:', error);
    return res.status(500).json({ error: 'Failed to log started', details: error.message });
  }
}
