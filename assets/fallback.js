/**
 * FlexHaus "The Comeback" — WebGL Detection & Fallback
 * Detects WebGL availability, routes to fallback if unavailable.
 */
(function () {
  'use strict';

  function detectWebGL() {
    try {
      var canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }

  function hasReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  var webglOk = detectWebGL();
  var reducedMotion = hasReducedMotion();

  // Set classes on document element early (before paint)
  if (!webglOk) {
    document.documentElement.classList.add('no-webgl');
  }
  if (reducedMotion) {
    document.documentElement.classList.add('reduced-motion');
  }

  // Expose for main.js
  window.__flexhaus = window.__flexhaus || {};
  window.__flexhaus.webglOk = webglOk;
  window.__flexhaus.reducedMotion = reducedMotion;

  // Listen for changes to reduced-motion preference
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', function (e) {
    var rm = e.matches;
    window.__flexhaus.reducedMotion = rm;
    document.documentElement.classList.toggle('reduced-motion', rm);
  });
})();
