module.exports = function handler(req, res) {
  // Só permite requisições GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return res.status(500).json({ error: 'Supabase não configurado no servidor (Vercel).' });
  }

  // Define um cache leve para responder rápido (1 hora)
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.status(200).json({ url, key });
};
