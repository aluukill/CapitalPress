/* ================================================================
   config.js — API configuration
   ================================================================ */

const CONFIG = {
  // Backend proxy endpoint (real API key stays server-side)
  API_BASE: '/api',

  // Default params
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_PER_PAGE: 10,
  CAROUSEL_COUNT: 5,
  CATEGORY_PREVIEW_COUNT: 4,

  // Available topics for navigation
  TOPICS: [
    'politics',
    'business',
    'technology',
    'sports',
    'world',
    'health',
    'science',
    'entertainment',
  ],

  // Placeholder image when article has no media
  PLACEHOLDER_IMAGE:
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">' +
        '<rect fill="#e8e8e8" width="600" height="400"/>' +
        '<text fill="#aaa" font-family="sans-serif" font-size="18" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No Image Available</text>' +
        '</svg>'
    ),
};
