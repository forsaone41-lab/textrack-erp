export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  // These must be set in Vercel Environment Variables
  // VERCEL_PROJECT_ID is often set automatically by Vercel if "System Environment Variables" is checked
  // VERCEL_API_TOKEN needs to be generated in Vercel Account Settings -> Tokens
  const projectId = process.env.VERCEL_PROJECT_ID;
  const token = process.env.VERCEL_API_TOKEN;

  if (!projectId || !token) {
    return res.status(500).json({ 
      error: 'Erreur Serveur: VERCEL_PROJECT_ID ou VERCEL_API_TOKEN manquant.' 
    });
  }

  try {
    const response = await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Failed to add domain to Vercel' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
