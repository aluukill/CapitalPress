# Capital Press

Capital Press is a modern news web app built with vanilla HTML, CSS, and JavaScript. It brings together live headlines from NewsDataHub and presents them in a clean newspaper style experience with category browsing, search, bookmarks, and article detail pages.

Live website: https://capital-press.vercel.app

## What this project includes

1. Homepage with a featured carousel, latest stories, and topic based sections
2. Topic pages for politics, business, technology, sports, world, health, science, and entertainment
3. Search page with paginated results using API cursors
4. Article detail page with source metadata, keyword tags, and read original link
5. Bookmark drawer powered by localStorage
6. Theme switcher with saved user preference
7. About, Contact, Privacy Policy, and Terms pages

## Tech stack

1. HTML for page structure
2. CSS for styling, layout, animations, and responsive behavior
3. Vanilla JavaScript modules for API calls, UI components, and page logic
4. Vercel serverless function in `api/news.js` as a secure API proxy
5. NewsDataHub as the upstream news provider

## Project structure

1. `index.html` main landing page
2. `category.html` topic feed page
3. `search.html` keyword search page
4. `article.html` article detail page
5. `about-us.html`, `contact.html`, `privacy-policy.html`, `terms-of-service.html` informational pages
6. `js/config.js` app configuration and defaults
7. `js/api.js` client API wrapper with retry and caching logic
8. `js/components.js` reusable cards, carousel, and skeleton loaders
9. `js/home.js`, `js/category.js`, `js/search.js`, `js/article.js` page specific controllers
10. `js/bookmarks.js` bookmark state and drawer rendering
11. `js/theme.js` light and dark mode persistence
12. `js/utils.js` shared helpers for formatting, escaping, and URL state
13. `css/style.css` complete design system and responsive styles
14. `api/news.js` server proxy that injects the API key and forwards requests

## Local setup

1. Clone the repository
2. Create an environment variable named `NEWSDATAHUB_API_KEY`
3. Run the project with Vercel so the `/api/news` endpoint is available
4. Open the local URL in your browser

Example commands:

```bash
npm i -g vercel
vercel dev
```

## Notes about the data flow

1. Browser code calls `/api/news` instead of calling NewsDataHub directly
2. The serverless function adds the secret key from environment variables
3. Article cards are cached in `sessionStorage` for fast navigation to the detail page
4. Bookmarks and theme preference are stored in `localStorage`

## Why this project feels practical

Capital Press keeps the stack simple and readable while still handling real world concerns like API key protection, retry logic for rate limits, graceful loading states, and a responsive UI that works well on mobile and desktop.

## License

No license file is currently included in this repository.
