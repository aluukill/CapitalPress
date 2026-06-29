/* ================================================================
   bookmarks.js — Bookmark management with localStorage
   ================================================================ */

const Bookmarks = {
  STORAGE_KEY: 'cp_bookmarks',

  /**
   * Get all bookmarks.
   */
  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Save bookmarks array.
   */
  save(bookmarks) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Could not save bookmarks:', e);
    }
    this.updateCount();
    this.renderDrawer();
  },

  /**
   * Check if an article is bookmarked.
   */
  isBookmarked(articleId) {
    return this.getAll().some((b) => b.id === articleId);
  },

  /**
   * Toggle bookmark for an article.
   */
  toggle(article) {
    const bookmarks = this.getAll();
    const idx = bookmarks.findIndex((b) => b.id === article.id);
    if (idx >= 0) {
      bookmarks.splice(idx, 1);
    } else {
      bookmarks.unshift({
        id: article.id,
        title: article.title,
        source_title: article.source_title,
        media_url: article.media_url,
        article_link: article.article_link,
        pub_date: article.pub_date,
      });
    }
    this.save(bookmarks);
    return idx < 0; // returns true if added
  },

  /**
   * Remove a bookmark by ID.
   */
  remove(articleId) {
    const bookmarks = this.getAll().filter((b) => b.id !== articleId);
    this.save(bookmarks);
  },

  /**
   * Update bookmark count badge.
   */
  updateCount() {
    const count = this.getAll().length;
    const badge = document.getElementById('bookmark-count');
    if (badge) {
      badge.textContent = count;
      badge.setAttribute('data-count', count);
    }
  },

  /**
   * Render bookmarks drawer content.
   */
  renderDrawer() {
    const list = document.getElementById('bookmarks-list');
    if (!list) return;

    const bookmarks = this.getAll();

    if (bookmarks.length === 0) {
      list.innerHTML =
        '<p class="drawer-empty">No bookmarks yet. Click the bookmark icon on any article to save it.</p>';
      return;
    }

    list.innerHTML = bookmarks
      .map(
        (b) => `
            <div class="bookmark-item" data-id="${Utils.escapeHtml(b.id)}">
                <img src="${Utils.getImageUrl(b)}" alt="" class="bookmark-item-img" loading="lazy"
                     onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                <div class="bookmark-item-info">
                    <div class="bookmark-item-title">
                        <a href="article.html?id=${encodeURIComponent(b.id)}">${Utils.escapeHtml(b.title)}</a>
                    </div>
                    <div class="bookmark-item-source">${Utils.escapeHtml(b.source_title || '')}</div>
                </div>
                <button class="bookmark-item-remove" data-id="${Utils.escapeHtml(b.id)}" title="Remove bookmark" aria-label="Remove bookmark">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        `
      )
      .join('');

    // Bind remove buttons
    list.querySelectorAll('.bookmark-item-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        Bookmarks.remove(id);
        // Update any visible bookmark buttons
        document.querySelectorAll(`.news-card-bookmark[data-id="${id}"]`).forEach((el) => {
          el.classList.remove('bookmarked');
          el.querySelector('svg').removeAttribute('fill');
        });
      });
    });
  },

  /**
   * Init bookmark drawer toggle.
   */
  init() {
    this.updateCount();
    this.renderDrawer();

    const toggle = document.getElementById('bookmark-toggle');
    const drawer = document.getElementById('bookmarks-drawer');
    const overlay = document.getElementById('drawer-overlay');
    const close = document.getElementById('drawer-close');

    const openDrawer = () => {
      drawer.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (toggle) toggle.addEventListener('click', openDrawer);
    if (close) close.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  Bookmarks.init();
});
