// Shared Google Sheets client for submit and result endpoints

import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Completed';

// Column headers in the exact order they appear in the sheet
export const COLUMNS = [
  'Result ID', 'Email', 'First Name', 'Last Name', 'Organisation', 'Phone', 'Completed At',
  'Org Goals 2026', 'Strategic Goal', 'LD Challenge',
  'Onboarding A', 'Onboarding B',
  'Kennisdeling A', 'Kennisdeling B',
  'Kwalificatie A', 'Kwalificatie B',
  'Training A', 'Training B',
  'Regie A', 'Regie B',
  'Reskilling A', 'Reskilling B',
  'Strategie A', 'Strategie B',
  'Mobiliteit A', 'Mobiliteit B',
  'Score', 'Prio 1', 'Prio 2', 'Prio 3',
  'Delivery Instant', 'Delivery Email', 'Consultation', 'Meeting Booked',
  'Phase', 'Payload'
];

function colLetter(n) {
  let s = '';
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

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

export async function appendRow(values) {
  const sheets = getSheets();
  const range = `${SHEET_NAME}!A:${colLetter(COLUMNS.length)}`;

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [values],
    },
  });

  return response.data;
}

export async function findRowByResultId(resultId) {
  const sheets = getSheets();
  const range = `${SHEET_NAME}!A:${colLetter(COLUMNS.length)}`;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return null;

  // First row is headers, find the Result ID column index
  const headers = rows[0];
  const idIndex = headers.indexOf('Result ID');
  if (idIndex === -1) return null;

  // Search for the matching row
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] === resultId) {
      // Build an object from headers + row values
      const row = {};
      headers.forEach((header, j) => {
        row[header] = rows[i][j] || null;
      });
      return row;
    }
  }

  return null;
}
