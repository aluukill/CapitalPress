/* ================================================================
   home.js — Homepage logic
   ================================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  // Show skeletons while loading
  const latestGrid = document.getElementById("latest-grid");
  const latestSpinner = document.getElementById("latest-spinner");
  const carouselTrack = document.getElementById("carousel-track");

  // Show skeletons for category previews
  const categoryRows = {
    technology: document.getElementById("tech-row"),
    sports: document.getElementById("sports-row"),
    world: document.getElementById("world-row"),
    politics: document.getElementById("politics-row"),
  };

  // Show skeleton loading states
  if (latestGrid) Components.showSkeletons(latestGrid, 6);
  Object.values(categoryRows).forEach((row) => {
    if (row) Components.showSkeletons(row, 4);
  });

  // --- Load Carousel (Top Headlines) ---
  try {
    const carouselResult = await API.fetchLatest(CONFIG.CAROUSEL_COUNT);
    if (carouselResult.data.length > 0) {
      carouselTrack.innerHTML = carouselResult.data
        .map((a) => Components.createCarouselSlide(a))
        .join("");
      Components.initCarousel();
    } else {
      document.getElementById("hero-section").style.display = "none";
    }
  } catch (err) {
    console.error("Carousel error:", err);
    document.getElementById("hero-section").style.display = "none";
  }

  // --- Load Latest News ---
  try {
    const latestResult = await API.fetchLatest(6);
    if (latestSpinner) latestSpinner.style.display = "none";
    if (latestResult.data.length > 0) {
      Components.renderCards(latestGrid, latestResult.data);
    } else {
      latestGrid.innerHTML =
        '<p style="color:var(--color-text-muted);">No articles available at the moment.</p>';
    }
  } catch (err) {
    console.error("Latest news error:", err);
    if (latestSpinner) latestSpinner.style.display = "none";
    latestGrid.innerHTML = "";
    Utils.showError(
      latestGrid.parentElement,
      Utils.getErrorMessage(
        err,
        "Failed to load latest news. Please try again.",
      ),
    );
  }

  // --- Load Category Previews ---
  const categories = ["technology", "sports", "world", "politics"];

  // Load category previews sequentially to stay within API rate limits
  for (const topic of categories) {
    const row = categoryRows[topic];
    if (!row) continue;

    try {
      const result = await API.fetchByTopic(
        topic,
        CONFIG.CATEGORY_PREVIEW_COUNT,
      );
      if (result.data.length > 0) {
        Components.renderCards(row, result.data, { animate: true });
      } else {
        row.innerHTML =
          '<p style="color:var(--color-text-muted);padding:20px 0;">No articles available.</p>';
      }
    } catch (err) {
      console.error(`Category ${topic} error:`, err);
      row.innerHTML =
        '<p style="color:var(--color-text-muted);padding:20px 0;">Could not load articles.</p>';
    }
  }
});
