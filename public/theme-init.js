/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

/* Applies the saved or system colour theme before first paint to avoid a flash. */
(function () {
  try {
    var saved = localStorage.getItem('photowizard-theme');
    var dark = saved === 'dark' || (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    if (dark) root.classList.add('dark');
    root.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {
    /* storage or matchMedia unavailable: fall back to the light theme */
  }
})();
