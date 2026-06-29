/* ================================================================
   theme.js — Dark / Light mode toggle
   ================================================================ */

const Theme = {
  STORAGE_KEY: 'cp_theme',

  init() {
    // Check saved preference or system preference
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Bind toggle button
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggle());
    }
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(this.STORAGE_KEY, next);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
});
