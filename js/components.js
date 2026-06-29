/* ================================================================
   components.js — Reusable UI components (cards, skeletons, etc.)
   ================================================================ */

const Components = {
  /**
   * Create a news card HTML string.
   */
  createCard(article, options = {}) {
    const { animate = true } = options;
    const imageUrl = Utils.getImageUrl(article);
    const topic = (article.topics && article.topics[0]) || '';
    const isBookmarked = Bookmarks.isBookmarked(article.id);

    // Store article in sessionStorage for article page
    Utils.storeArticle(article);

    return `
            <div class="news-card ${animate ? 'fade-in' : ''}" data-id="${Utils.escapeHtml(article.id)}">
                <div class="news-card-image-wrap">
                    <a href="${Utils.getArticleUrl(article)}">
                        <img src="${imageUrl}" alt="${Utils.escapeHtml(article.title)}"
                             class="news-card-image" loading="lazy"
                             onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                    </a>
                    ${topic ? `<span class="news-card-topic">${Utils.escapeHtml(Utils.capitalize(topic))}</span>` : ''}
                    <button class="news-card-bookmark ${isBookmarked ? 'bookmarked' : ''}"
                            data-id="${Utils.escapeHtml(article.id)}"
                            title="${isBookmarked ? 'Remove bookmark' : 'Bookmark this article'}"
                            aria-label="${isBookmarked ? 'Remove bookmark' : 'Bookmark this article'}">
                        <svg width="16" height="16" viewBox="0 0 24 24" ${isBookmarked ? 'fill="currentColor"' : 'fill="none"'} stroke="currentColor" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                    </button>
                </div>
                <div class="news-card-body">
                    <div class="news-card-source">${Utils.escapeHtml(article.source_title || '')}</div>
                    <h3 class="news-card-title">
                        <a href="${Utils.getArticleUrl(article)}">${Utils.escapeHtml(article.title || 'Untitled')}</a>
                    </h3>
                    <p class="news-card-desc">${Utils.escapeHtml(Utils.truncate(article.description, 140))}</p>
                    <div class="news-card-footer">
                        <span class="news-card-date">${Utils.formatDate(article.pub_date)}</span>
                        ${article.creator ? `<span class="news-card-sep">·</span><span class="news-card-author">${Utils.escapeHtml(article.creator)}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
  },

  /**
   * Create carousel slide HTML.
   */
  createCarouselSlide(article) {
    const imageUrl = Utils.getImageUrl(article);
    const topic = (article.topics && article.topics[0]) || '';

    Utils.storeArticle(article);

    return `
            <div class="carousel-slide">
                <img src="${imageUrl}" alt="${Utils.escapeHtml(article.title)}"
                     class="carousel-slide-img" loading="lazy"
                     onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                <div class="carousel-slide-overlay">
                    ${topic ? `<span class="carousel-slide-topic">${Utils.escapeHtml(Utils.capitalize(topic))}</span>` : ''}
                    <h2 class="carousel-slide-title">
                        <a href="${Utils.getArticleUrl(article)}">${Utils.escapeHtml(article.title || 'Untitled')}</a>
                    </h2>
                    <p class="carousel-slide-desc">${Utils.escapeHtml(Utils.truncate(article.description, 180))}</p>
                    <div class="carousel-slide-meta">
                        ${Utils.escapeHtml(article.source_title || '')} · ${Utils.formatDate(article.pub_date)}
                    </div>
                </div>
            </div>
        `;
  },

  /**
   * Create skeleton loading card.
   */
  createSkeletonCard() {
    return `
            <div class="skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-body">
                    <div class="skeleton-line w-40"></div>
                    <div class="skeleton-line w-100 h-16"></div>
                    <div class="skeleton-line w-80"></div>
                    <div class="skeleton-line w-60"></div>
                </div>
            </div>
        `;
  },

  /**
   * Render skeleton cards into a container.
   */
  showSkeletons(container, count = 4) {
    container.innerHTML = Array(count).fill(Components.createSkeletonCard()).join('');
  },

  /**
   * Render news cards into a container.
   */
  renderCards(container, articles, options = {}) {
    const { append = false, animate = true } = options;
    const html = articles.map((a) => Components.createCard(a, { animate })).join('');
    if (append) {
      container.insertAdjacentHTML('beforeend', html);
    } else {
      container.innerHTML = html;
    }
    // Bind bookmark buttons
    Components.bindBookmarkButtons(container);
  },

  /**
   * Bind bookmark click handlers in a container.
   */
  bindBookmarkButtons(container) {
    container.querySelectorAll('.news-card-bookmark').forEach((btn) => {
      // Remove old listeners by cloning
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = newBtn.getAttribute('data-id');
        const articleData = sessionStorage.getItem(`article_${id}`);
        if (articleData) {
          const article = JSON.parse(articleData);
          const added = Bookmarks.toggle(article);
          newBtn.classList.toggle('bookmarked', added);
          const svg = newBtn.querySelector('svg');
          if (added) {
            svg.setAttribute('fill', 'currentColor');
          } else {
            svg.setAttribute('fill', 'none');
          }
        }
      });
    });
  },

  /**
   * Init carousel auto-play and controls.
   */
  initCarousel() {
    const track = document.getElementById('carousel-track');
    const dotsContainer = document.getElementById('carousel-dots');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (!track || !track.children.length) return;

    const slides = track.children;
    const total = slides.length;
    let current = 0;
    let autoPlayTimer = null;

    // Create dots
    dotsContainer.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }

    function goTo(index) {
      current = ((index % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;

      // Update dots
      dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function next() {
      goTo(current + 1);
    }
    function prev() {
      goTo(current - 1);
    }

    if (prevBtn)
      prevBtn.addEventListener('click', () => {
        prev();
        resetAutoPlay();
      });
    if (nextBtn)
      nextBtn.addEventListener('click', () => {
        next();
        resetAutoPlay();
      });

    function startAutoPlay() {
      autoPlayTimer = setInterval(next, 6000);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    }

    startAutoPlay();

    // Pause on hover
    const carousel = document.getElementById('hero-carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
      carousel.addEventListener('mouseleave', startAutoPlay);
    }

    // Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    track.addEventListener(
      'touchend',
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) next();
          else prev();
          resetAutoPlay();
        }
      },
      { passive: true }
    );
  },
};
