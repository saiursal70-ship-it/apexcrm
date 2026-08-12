import { animate, createTimeline, stagger } from 'animejs';

/**
 * Universal 2026 Physics-Based Animation Engine for CRM
 * State-of-the-art motion designed with cubic spring deceleration,
 * staged choreography, spatial layering, and tactile micro-interactions.
 */

// Helper to safely resolve DOM targets (selectors, refs, elements)
const getTarget = (target) => {
  if (!target) return null;
  if (typeof target === 'string') return target;
  if (target.current) return target.current;
  return target;
};

/**
 * 1. Staged Choreography Bloom (Page Open)
 * Sequentially introduces: Header (0ms) -> Metric KPI cards with counters (80ms) -> Data tables/charts (160ms)
 */
export const animateStagedBloom = (container) => {
  const el = getTarget(container);
  if (!el) return;

  try {
    // Stage 1: Page Header & Title
    animate(el.querySelectorAll('.content-page-header, .apex-dash-header, .report-page-toolbar'), {
      opacity: [0, 1],
      translateY: [-10, 0],
      duration: 380,
      ease: 'cubicBezier(0.16, 1, 0.3, 1)'
    });

    // Stage 2: Top KPI Metric Cards
    animate(el.querySelectorAll('.apex-kpi-card, .report-kpi-card'), {
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.96, 1],
      delay: stagger(50, { start: 70 }),
      duration: 550,
      ease: 'outBack(1.4)'
    });

    // Stage 3: Mid & Bottom Grids / Data Tables / Charts
    animate(el.querySelectorAll('.apex-mid-grid, .apex-bottom-grid, .table-wrapper, .kanban-wrapper, .settings-content-pane'), {
      opacity: [0, 1],
      translateY: [18, 0],
      delay: stagger(60, { start: 150 }),
      duration: 600,
      ease: 'cubicBezier(0.16, 1, 0.3, 1)'
    });
  } catch (err) {
    console.warn('Anime.js staged bloom error:', err);
  }
};

/**
 * 2. High-Velocity Micro-Dissolve (Page Close / Route Exit - 120ms Rule)
 */
export const animatePageDissolve = (container, onComplete) => {
  const el = getTarget(container);
  if (!el) {
    if (onComplete) onComplete();
    return;
  }

  try {
    animate(el, {
      opacity: [1, 0],
      scale: [1, 0.988],
      translateY: [0, -6],
      duration: 130,
      ease: 'inQuad',
      onComplete
    });
  } catch (err) {
    if (onComplete) onComplete();
  }
};

/**
 * 3. Page Entrance (Standard Stagger Fallback)
 */
export const animatePageEnter = (container) => {
  const el = getTarget(container);
  if (!el) return;

  try {
    const children = el.querySelectorAll ? el.querySelectorAll('.apex-kpi-card, .apex-card, .dashboard-toolbar, .table-wrapper, .report-kpi-card, .settings-card, .kanban-column, .auth-form, .wizard-modal-content') : null;
    if (children && children.length > 0) {
      animate(children, {
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.97, 1],
        duration: 550,
        delay: stagger(45, { start: 40 }),
        ease: 'cubicBezier(0.16, 1, 0.3, 1)'
      });
    } else {
      animate(el, {
        opacity: [0, 1],
        translateY: [14, 0],
        duration: 400,
        ease: 'outCubic'
      });
    }
  } catch (err) {
    console.warn('Anime.js page enter animation error:', err);
  }
};

/**
 * 4. Stagger Entrance for Cards, Grid Items, or List Items
 */
export const animateStagger = (targets, options = {}) => {
  const el = getTarget(targets);
  if (!el) return;

  const {
    translateY = [18, 0],
    translateX = [0, 0],
    scale = [0.96, 1],
    opacity = [0, 1],
    duration = 500,
    delay = stagger(40, { start: 20 }),
    ease = 'cubicBezier(0.16, 1, 0.3, 1)'
  } = options;

  try {
    animate(el, {
      opacity,
      translateY,
      translateX,
      scale,
      duration,
      delay,
      ease
    });
  } catch (err) {
    console.warn('Anime.js stagger error:', err);
  }
};

/**
 * 5. Table Rows Cascading Wave Animation
 */
export const animateTableRows = (tableOrTbody) => {
  const el = getTarget(tableOrTbody);
  if (!el) return;

  try {
    const rows = el.querySelectorAll ? el.querySelectorAll('tbody tr') : el;
    if (!rows || rows.length === 0) return;

    animate(rows, {
      opacity: [0, 1],
      translateX: [-12, 0],
      duration: 380,
      delay: stagger(25, { start: 15 }),
      ease: 'outQuad'
    });
  } catch (err) {
    console.warn('Anime.js table row animation error:', err);
  }
};

/**
 * 6. Live Number Counter for KPIs and Metrics
 */
export const animateCounter = (targetElement, finalValue, options = {}) => {
  const el = getTarget(targetElement);
  if (!el) return;

  const {
    prefix = '',
    suffix = '',
    duration = 1100,
    isCurrency = false,
    decimals = 0
  } = options;

  const numericValue = typeof finalValue === 'number'
    ? finalValue
    : parseFloat(String(finalValue).replace(/[^0-9.-]+/g, '')) || 0;

  const counterObj = { val: 0 };

  try {
    animate(counterObj, {
      val: numericValue,
      duration,
      ease: 'cubicBezier(0.16, 1, 0.3, 1)',
      onUpdate: () => {
        if (!el) return;
        const currentVal = counterObj.val;
        let formatted = '';
        if (isCurrency) {
          formatted = `${prefix}₹${Math.round(currentVal).toLocaleString('en-IN')}${suffix}`;
        } else if (decimals > 0) {
          formatted = `${prefix}${currentVal.toFixed(decimals)}${suffix}`;
        } else {
          formatted = `${prefix}${Math.round(currentVal).toLocaleString()}${suffix}`;
        }
        el.textContent = formatted;
      }
    });
  } catch (err) {
    console.warn('Anime.js counter error:', err);
    if (el) el.textContent = `${prefix}${finalValue}${suffix}`;
  }
};

/**
 * 7. Apple-Style Spatial Drawer Open (with Main Content Scale & Blur)
 */
export const animateDrawerSpatialOpen = (drawerContainer, overlay) => {
  const drawerEl = getTarget(drawerContainer);
  const overlayEl = getTarget(overlay);

  try {
    if (overlayEl) {
      animate(overlayEl, {
        opacity: [0, 1],
        duration: 280,
        ease: 'outQuad'
      });
    }

    if (drawerEl) {
      animate(drawerEl, {
        translateX: ['100%', '0%'],
        duration: 380,
        ease: 'cubicBezier(0.16, 1, 0.3, 1)'
      });

      // Stagger inside drawer
      const drawerFields = drawerEl.querySelectorAll('.drawer-field-card, .timeline-item, .drawer-subtabs button');
      if (drawerFields && drawerFields.length > 0) {
        animate(drawerFields, {
          translateX: [14, 0],
          opacity: [0, 1],
          delay: stagger(20, { start: 100 }),
          duration: 320,
          ease: 'outCubic'
        });
      }
    }
  } catch (err) {
    console.warn('Anime.js spatial drawer error:', err);
  }
};

/**
 * 8. Spatial Drawer Close
 */
export const animateDrawerSpatialClose = (drawerContainer, overlay, mainContent, onComplete) => {
  const drawerEl = getTarget(drawerContainer);
  const overlayEl = getTarget(overlay);

  try {
    if (drawerEl) {
      animate(drawerEl, {
        translateX: ['0%', '100%'],
        duration: 280,
        ease: 'inCubic',
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });
    }
    if (overlayEl) {
      animate(overlayEl, {
        opacity: [1, 0],
        duration: 220,
        ease: 'inQuad'
      });
    }
    if (!drawerEl && onComplete) {
      onComplete();
    }
  } catch (err) {
    if (onComplete) onComplete();
  }
};

/**
 * 9. Modal Pop & Scale Entrance
 */
export const animateModalEnter = (modalContent, overlay) => {
  const modalEl = getTarget(modalContent);
  const overlayEl = getTarget(overlay);

  try {
    if (overlayEl) {
      animate(overlayEl, {
        opacity: [0, 1],
        duration: 260,
        ease: 'outQuad'
      });
    }

    if (modalEl) {
      animate(modalEl, {
        opacity: [0, 1],
        scale: [0.86, 1],
        translateY: [18, 0],
        duration: 420,
        ease: 'outBack(1.5)'
      });
    }
  } catch (err) {
    console.warn('Anime.js modal animation error:', err);
  }
};

/**
 * 10. Kanban 3D Drag Lift Physics
 */
export const animateKanbanLift = (cardElement) => {
  const el = getTarget(cardElement);
  if (!el) return;

  try {
    animate(el, {
      scale: 1.045,
      rotate: -2.5,
      duration: 180,
      ease: 'outQuad'
    });
  } catch (err) {}
};

/**
 * 11. Kanban Elastic Magnetic Drop Snap Physics
 */
export const animateKanbanSnap = (cardElement) => {
  const el = getTarget(cardElement);
  if (!el) return;

  try {
    animate(el, {
      scale: [0.93, 1.04, 1],
      rotate: [0, 0],
      duration: 380,
      ease: 'outBack(2.2)'
    });
  } catch (err) {}
};

/**
 * 12. Tactile Button Elastic Pulse
 */
export const animateButtonPulse = (target) => {
  const el = getTarget(target);
  if (!el) return;

  try {
    animate(el, {
      scale: [1, 0.88, 1.08, 1],
      duration: 340,
      ease: 'outElastic(1, 0.6)'
    });
  } catch (err) {
    console.warn('Anime.js pulse error:', err);
  }
};

/**
 * 13. Magnetic Icon Hover
 */
export const animateIconHover = (iconElement) => {
  const el = getTarget(iconElement);
  if (!el) return;

  try {
    animate(el, {
      scale: [1, 1.15],
      rotate: [-5, 5],
      duration: 240,
      ease: 'outBack(1.8)'
    });
  } catch (err) {}
};

/**
 * 14. Attention Shake (for errors, badges, or alerts)
 */
export const animateShake = (target) => {
  const el = getTarget(target);
  if (!el) return;

  try {
    animate(el, {
      translateX: [0, -10, 10, -8, 8, -4, 4, 0],
      duration: 500,
      ease: 'inOutQuad'
    });
  } catch (err) {
    console.warn('Anime.js shake error:', err);
  }
};

/**
 * 15. Dropdown Menu Pop-Down Animation
 */
export const animateDropdownEnter = (target) => {
  const el = getTarget(target);
  if (!el) return;

  try {
    animate(el, {
      opacity: [0, 1],
      translateY: [-10, 0],
      scale: [0.94, 1],
      duration: 260,
      ease: 'cubicBezier(0.16, 1, 0.3, 1)'
    });
  } catch (err) {
    console.warn('Anime.js dropdown animation error:', err);
  }
};

/**
 * 16. Kanban Drop Animation for Dragged Cards (Compatibility alias)
 */
export const animateCardDrop = (target) => {
  animateKanbanSnap(target);
};

export { animate, createTimeline, stagger };

const animationUtils = {
  animateStagedBloom,
  animatePageDissolve,
  animatePageEnter,
  animateStagger,
  animateTableRows,
  animateCounter,
  animateDrawerSpatialOpen,
  animateDrawerSpatialClose,
  animateModalEnter,
  animateKanbanLift,
  animateKanbanSnap,
  animateButtonPulse,
  animateIconHover,
  animateShake,
  animateDropdownEnter,
  animateCardDrop,
  animate,
  createTimeline,
  stagger
};

export default animationUtils;
