/* ================================================================
   search.js — Search page logic
   ================================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("search-grid");
  const spinner = document.getElementById("search-spinner");
  const loadMoreWrap = document.getElementById("search-load-more");
  const loadMoreBtn = document.getElementById("search-load-more-btn");
  const noResults = document.getElementById("search-no-results");
  const resultsInfo = document.getElementById("search-results-info");
  const queryDisplay = document.getElementById("search-query-display");
  const countEl = document.getElementById("search-count");
  const pageInput = document.getElementById("search-page-input");
  const headerInput = document.getElementById("search-input");

  // Get query from URL
  const query = Utils.getParam("q");

  // State
  let nextCursor = null;
  let totalResults = 0;
  let isLoading = false;

  // Pre-fill search inputs with query
  if (query) {
    if (pageInput) pageInput.value = query;
    if (headerInput) headerInput.value = query;
    document.title = `"${query}" — Search — Capital Press`;
    await performSearch(false);
  }

  // Handle search form submission on the page
  const pageForm = document.getElementById("search-page-form");
  if (pageForm) {
    pageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newQuery = pageInput.value.trim();
      if (newQuery) {
        window.location.href = `search.html?q=${encodeURIComponent(newQuery)}`;
      }
    });
  }

  async function performSearch(append = false) {
    if (!query || isLoading) return;
    isLoading = true;

    if (!append) {
      if (spinner) spinner.style.display = "flex";
      grid.innerHTML = "";
    }

    if (loadMoreBtn) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = "Loading...";
    }

    try {
      const result = await API.searchNews(
        query,
        CONFIG.DEFAULT_PER_PAGE,
        nextCursor,
      );

      if (spinner) spinner.style.display = "none";

      nextCursor = result.next_cursor;
      totalResults = result.total_results;

      // Show results info
      if (resultsInfo) resultsInfo.style.display = "block";
      if (queryDisplay) queryDisplay.textContent = query;
      if (countEl) {
        countEl.textContent = `${totalResults.toLocaleString()} results`;
      }

      if (result.data.length > 0) {
        Components.renderCards(grid, result.data, { append, animate: true });

        if (noResults) noResults.style.display = "none";

        // Show/hide load more
        if (nextCursor) {
          loadMoreWrap.style.display = "block";
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = "Load More Results";
        } else {
          loadMoreWrap.style.display = "none";
        }
      } else if (!append) {
        if (noResults) noResults.style.display = "block";
        loadMoreWrap.style.display = "none";
      }
    } catch (err) {
      console.error("Search error:", err);
      if (spinner) spinner.style.display = "none";
      if (!append) {
        Utils.showError(
          grid.parentElement,
          Utils.getErrorMessage(err, "Search failed. Please try again."),
        );
      }
      if (loadMoreBtn) {
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = "Try Again";
      }
    }

    isLoading = false;
  }

  // Load more button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      performSearch(true);
    });
  }
});
