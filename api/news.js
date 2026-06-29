export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const tab = searchParams.get('tab') || 'mindset';

  const QUERIES = {
    mindset: 'mental health mindset resilience burnout wellbeing',
    work: 'workplace burnout quiet quitting toxic work remote work',
    jobs: 'job market layoffs hiring unemployment career',
  };

  const q = QUERIES[tab] || QUERIES.mindset;
  const API_KEY = 'pub_5b298c2e88ee4a5b988156cea3e20610';
  const url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&q=${encodeURIComponent(q)}&language=english&size=10`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const articles = (data.results || [])
      .filter(a => a.title && a.link)
      .map(a => ({
        title: a.title,
        description: a.description || '',
        url: a.link,
        source: a.source_id || 'News',
        publishedAt: a.pubDate,
      }));

    return new Response(JSON.stringify({ articles }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=3600',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, articles: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
