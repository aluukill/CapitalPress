export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server API key is not configured' });
  }

  const query = req.query || {};
  const hasQuery = !!query.q;
  const hasTopic = !!query.topic;

  // NewsAPI valid categories for top-headlines
  const validCategories = [
    'business',
    'entertainment',
    'general',
    'health',
    'science',
    'sports',
    'technology',
  ];
  const canUseTopHeadlines =
    (hasTopic && validCategories.includes(query.topic) && !hasQuery) || (!hasTopic && !hasQuery);

  // Decide which endpoint to call
  const endpoint = canUseTopHeadlines ? 'top-headlines' : 'everything';
  const upstreamUrl = new URL(`https://newsapi.org/v2/${endpoint}`);

  // Language
  if (query.language) {
    upstreamUrl.searchParams.set('language', query.language);
  }

  // Page size
  const pageSize = Number(query.per_page) || 10;
  upstreamUrl.searchParams.set('pageSize', String(pageSize));

  if (endpoint === 'top-headlines') {
    if (hasTopic) {
      upstreamUrl.searchParams.set('category', query.topic);
    }
  } else {
    if (hasQuery) {
      upstreamUrl.searchParams.set('q', query.q);
    } else if (hasTopic) {
      upstreamUrl.searchParams.set('q', query.topic);
    }

    if (query.sort_by === 'date') {
      upstreamUrl.searchParams.set('sortBy', 'publishedAt');
    } else if (query.sort_by === 'relevance') {
      upstreamUrl.searchParams.set('sortBy', 'relevancy');
    }
  }

  // Pagination: cursor maps to page number
  const currentPage = Number(query.cursor) || 1;
  upstreamUrl.searchParams.set('page', String(currentPage));

  // Auth
  upstreamUrl.searchParams.set('apiKey', apiKey);

  try {
    const upstreamRes = await fetch(upstreamUrl.toString(), {
      headers: {
        'User-Agent': 'CapitalPress/1.0',
        Accept: 'application/json',
      },
    });

    const bodyText = await upstreamRes.text();
    let body = null;

    try {
      body = JSON.parse(bodyText);
    } catch {
      body = { error: bodyText || 'Upstream returned a non-JSON response' };
    }

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json(body);
    }

    const totalResults = body.totalResults || 0;
    const hasMore = currentPage * pageSize < totalResults;

    const transformed = {
      data: (body.articles || []).map((article) => {
        const url = article.url || '';
        return {
          article_id: url
            ? Buffer.from(url).toString('base64').replace(/=/g, '')
            : Math.random().toString(36).substr(2, 9),
          title: article.title || '',
          description: article.description || '',
          content: article.content || article.description || '',
          media_url: article.urlToImage || '',
          pub_date: article.publishedAt || '',
          source_title: article.source?.name || '',
          source: null,
          topics: hasTopic ? [query.topic] : [],
          keywords: [],
          creator: article.author || '',
          article_link: url,
        };
      }),
      next_cursor: hasMore ? String(currentPage + 1) : null,
      total_results: totalResults,
      per_page: pageSize,
    };

    return res.status(200).json(transformed);
  } catch (error) {
    return res.status(502).json({
      error: 'Failed to reach upstream news service',
      details: error?.message || String(error),
    });
  }
}
