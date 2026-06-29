/* ================================================================
   article.js — Article detail page logic
   ================================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const articleId = Utils.getParam('id');

  const titleEl = document.getElementById('article-title');
  const topicsEl = document.getElementById('article-topics');
  const sourceEl = document.getElementById('article-source');
  const dateEl = document.getElementById('article-date');
  const authorEl = document.getElementById('article-author');
  const imageWrap = document.getElementById('article-image-wrap');
  const imageEl = document.getElementById('article-image');
  const bodyEl = document.getElementById('article-body');
  const keywordsSection = document.getElementById('article-keywords');
  const keywordsList = document.getElementById('keywords-list');
  const sourceInfoSection = document.getElementById('article-source-info');
  const sourceDetails = document.getElementById('source-details');
  const bookmarkBtn = document.getElementById('article-bookmark-btn');
  const sourceLinkEl = document.getElementById('article-source-link');
  const breadcrumbTopic = document.getElementById('article-topic-breadcrumb');

  if (!articleId) {
    bodyEl.innerHTML = '<p>Article not found. <a href="index.html">Go back to homepage</a>.</p>';
    return;
  }

  // Try to get article from sessionStorage first
  let article = Utils.getStoredArticle(articleId);

  // Fallback: load from saved bookmarks (localStorage) if session expired
  if (!article && typeof Bookmarks !== 'undefined') {
    article = Bookmarks.getAll().find((b) => String(b.id) === String(articleId)) || null;
  }

  // If not in sessionStorage/bookmarks, show unavailable state
  if (!article) {
    bodyEl.innerHTML = `
            <div class="no-results">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <h3>Article Unavailable</h3>
                <p>This article preview has expired from your session. Please return to the homepage to browse current headlines.</p>
                <div style="margin-top: 20px;">
                    <a href="index.html" class="btn-load-more">Return to Home</a>
                </div>
            </div>
        `;
    if (titleEl) titleEl.textContent = 'Article Unavailable';
    return;
  }

  // --- Populate article page ---

  // Title
  document.title = `${article.title} — Capital Press`;
  if (titleEl) titleEl.textContent = article.title || 'Untitled';

  // Topics
  if (topicsEl && article.topics && article.topics.length > 0) {
    topicsEl.innerHTML = article.topics
      .map(
        (t) =>
          `<a href="category.html?topic=${encodeURIComponent(t)}" class="article-topic-tag">${Utils.escapeHtml(Utils.capitalize(t))}</a>`
      )
      .join('');

    // Update breadcrumb
    if (breadcrumbTopic) {
      const mainTopic = article.topics[0];
      breadcrumbTopic.innerHTML = `<a href="category.html?topic=${encodeURIComponent(mainTopic)}">${Utils.escapeHtml(Utils.capitalize(mainTopic))}</a>`;
    }
  }

  // Source
  if (sourceEl) sourceEl.textContent = article.source_title || '';

  // Date
  if (dateEl) {
    const pubDate = article.pub_date ? new Date(article.pub_date) : null;
    dateEl.textContent = pubDate
      ? pubDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';
  }

  // Author
  if (authorEl) {
    authorEl.textContent = article.creator || 'Staff Reporter';
  }

  // Original source link
  if (sourceLinkEl && article.article_link) {
    sourceLinkEl.href = article.article_link;
  }

  // Image
  if (imageWrap && imageEl) {
    const imgUrl = Utils.getImageUrl(article);
    if (article.media_url) {
      imageEl.src = imgUrl;
      imageEl.alt = article.title || '';
      imageEl.onerror = function () {
        imageWrap.style.display = 'none';
      };
      imageWrap.style.display = 'block';
    } else {
      imageWrap.style.display = 'none';
    }
  }

  // Body content
  if (bodyEl) {
    let content = article.content || article.description || '';
    // Clean up truncation messages
    content = content.replace(/\[Truncated.*?\]/gi, '').trim();

    if (content) {
      // Convert plain text to paragraphs
      const paragraphs = content.split(/\n\n|\n/).filter((p) => p.trim());
      bodyEl.innerHTML = paragraphs.map((p) => `<p>${Utils.escapeHtml(p.trim())}</p>`).join('');

      // If content is truncated (free tier), add a note
      if (article.content && article.content.length <= 320) {
        bodyEl.innerHTML += `
                    <div class="error-banner" style="margin-top: 24px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>This is a preview. <a href="${Utils.escapeHtml(article.article_link || '#')}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">Read the full article at ${Utils.escapeHtml(article.source_title || 'the source')}</a>.</span>
                    </div>
                `;
      }
    } else {
      bodyEl.innerHTML = `
                <p>No content available for this article.</p>
                <p><a href="${Utils.escapeHtml(article.article_link || '#')}" target="_blank" rel="noopener noreferrer">Read the full article at the source →</a></p>
            `;
    }
  }

  // Keywords
  if (keywordsSection && keywordsList && article.keywords && article.keywords.length > 0) {
    keywordsSection.style.display = 'block';
    keywordsList.innerHTML = article.keywords
      .map((k) => `<span class="keyword-tag">${Utils.escapeHtml(k)}</span>`)
      .join('');
  }

  // Source info
  if (sourceInfoSection && sourceDetails && article.source) {
    sourceInfoSection.style.display = 'block';
    const src = article.source;
    let detailsHtml = '';

    if (src.type) {
      detailsHtml += `
                <div class="source-detail-item">
                    <div class="source-detail-label">Type</div>
                    <div class="source-detail-value">${Utils.escapeHtml(Utils.capitalize(src.type.replace(/_/g, ' ')))}</div>
                </div>
            `;
    }
    if (src.country) {
      detailsHtml += `
                <div class="source-detail-item">
                    <div class="source-detail-label">Country</div>
                    <div class="source-detail-value">${Utils.escapeHtml(src.country)}</div>
                </div>
            `;
    }
    if (src.political_leaning) {
      detailsHtml += `
                <div class="source-detail-item">
                    <div class="source-detail-label">Political Leaning</div>
                    <div class="source-detail-value">${Utils.escapeHtml(Utils.capitalize(src.political_leaning.replace(/_/g, ' ')))}</div>
                </div>
            `;
    }
    if (src.reliability_score !== undefined && src.reliability_score !== null) {
      detailsHtml += `
                <div class="source-detail-item">
                    <div class="source-detail-label">Reliability</div>
                    <div class="source-detail-value">${src.reliability_score}/10</div>
                </div>
            `;
    }

    sourceDetails.innerHTML = detailsHtml;
  }

  // Bookmark button
  if (bookmarkBtn && article) {
    const updateBookmarkBtn = () => {
      const isBookmarked = Bookmarks.isBookmarked(article.id);
      bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
      const svg = bookmarkBtn.querySelector('svg');
      if (isBookmarked) {
        svg.setAttribute('fill', 'currentColor');
        bookmarkBtn.querySelector('span').textContent = 'Bookmarked';
      } else {
        svg.setAttribute('fill', 'none');
        bookmarkBtn.querySelector('span').textContent = 'Bookmark';
      }
    };

    updateBookmarkBtn();

    bookmarkBtn.addEventListener('click', () => {
      Bookmarks.toggle(article);
      updateBookmarkBtn();
    });
  }
});

// Refresh page when hash changes (e.g., clicking a bookmark while on the article page)
window.addEventListener('hashchange', () => {
  window.location.reload();
});
