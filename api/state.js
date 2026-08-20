import { neon } from '@neondatabase/serverless';

// Test-only demo: hardcoded connection string (no gitignored .env) per
// explicit instruction — this DB holds nothing but throwaway demo content.
const sql = neon(
  'postgresql://neondb_owner:npg_Ql5eH4iBqhcw@ep-steep-fire-azv6r3b0-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
);

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS mini_app_state (
      id INT PRIMARY KEY DEFAULT 1,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      accent_color TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    INSERT INTO mini_app_state (id, title, subtitle, accent_color)
    VALUES (1, 'SP Mini App', 'Sửa ở trang web, reload mini app là thấy ngay', '#006af5')
    ON CONFLICT (id) DO NOTHING
  `;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  await ensureTable();

  if (req.method === 'GET') {
    const [row] = await sql`SELECT title, subtitle, accent_color AS "accentColor" FROM mini_app_state WHERE id = 1`;
    return res.status(200).json(row);
  }

  if (req.method === 'PUT') {
    const { title, subtitle, accentColor } = req.body ?? {};
    if (!title || !subtitle || !accentColor) {
      return res.status(400).json({ error: 'title, subtitle, accentColor are required' });
    }
    await sql`
      UPDATE mini_app_state
      SET title = ${title}, subtitle = ${subtitle}, accent_color = ${accentColor}, updated_at = now()
      WHERE id = 1
    `;
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
