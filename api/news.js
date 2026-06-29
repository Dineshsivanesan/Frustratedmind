// Vercel Serverless Function — acts as proxy for NewsData.io
// Sits at: /api/news?tab=mindset

export default async function handler(req, res) {
  // Allow browser to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const tab = req.query.tab || 'mindset';

  const QUERIES = {
    mindset: 'mental health OR mindset OR resilience OR burnout OR wellbeing',
    work:    'workplace burnout OR quiet quitting OR toxic workplace OR remote work',
    jobs:    'job market OR layoffs OR hiring OR unemployment OR career',
  };

  const q = QUERIES[tab] || QUERIES.mindset;
  const API_KEY = 'pub_5b298c2e88ee4a5b988156cea3e20610';

  try {
    const url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&q=${encodeURIComponent(q)}&language=english&size=10`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    const articles = (data.results || [])
      .filter(a => a.title && a.link)
      .map(a => ({
        title:       a.title,
        description: a.description || a.content || '',
        url:         a.link,
        source:      a.source_id || 'News',
        publishedAt: a.pubDate,
        country:     a.country || [],
      }));

    res.setHeader('Cache-Control', 's-maxage=3600'); // cache 1 hour on Vercel
    return res.status(200).json({ articles });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
