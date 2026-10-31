/* ==========================================================================
   src/js/ripple.js — MOTOR UNIVERSAL DE RIPPLE
   ==========================================================================
   Delegación en document para superficies interactivas M3. Cinética
   canónica @material/web con WAAPI. Sin alterar marcado semántico.
   ========================================================================== */

const SELECTOR = [
  '.md-button',
  '.md-icon-button',
  '.md-fab',
  '.md-chip',
  '.md-chip-close',
  '.md-segmented-button-item',
  'button.md-list-item',
  'a.md-list-item',
  '.md-list-item[tabindex]',
  'button.md-card',
  'a.md-card',
  '.md-card[tabindex]',
  '.md-tab',
  '[data-ripple]'
].join(', ');

const OPACITY_MAX = 'var(--md-sys-state-pressed-state-layer-opacity, 0.12)';
const DURATION_IN = 200;
const DURATION_OUT = 150;
const EASING = 'cubic-bezier(0.2, 0, 0, 1)';

let iniciado = false;
const active = new WeakMap();

function isDisabled(el) {
  if (!el) return true;
  if (el.hasAttribute('disabled')) return true;
  if (el.getAttribute('aria-disabled') === 'true') return true;
  return false;
}

function getTargetFromEvent(e) {
  const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
  for (let i = 0; i < path.length; i++) {
    const node = path[i];
    if (node && node.nodeType === 1) {
      const el = node;
      if (el.matches && el.matches(SELECTOR)) {
        return el;
      }
    }
  }
  const t = e.target;
  if (t && t.nodeType === 1 && t.closest) {
    return t.closest(SELECTOR);
  }
  return null;
}

function getMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    return false;
  }
}

function createWave(el, x, y, fromKeyboard) {
  const rect = el.getBoundingClientRect();
  let cx = x;
  let cy = y;
  if (fromKeyboard) {
    cx = rect.width / 2;
    cy = rect.height / 2;
  }
  if (typeof cx !== 'number' || isNaN(cx)) cx = rect.width / 2;
  if (typeof cy !== 'number' || isNaN(cy)) cy = rect.height / 2;
  const maxDist = Math.hypot(Math.max(cx, rect.width - cx), Math.max(cy, rect.height - cy));
  const radius = maxDist;
  const diameter = radius * 2;
  const wave = document.createElement('span');
  wave.className = 'md-ripple-wave';
  wave.setAttribute('aria-hidden', 'true');
  wave.style.width = diameter + 'px';
  wave.style.height = diameter + 'px';
  wave.style.left = (cx - radius) + 'px';
  wave.style.top = (cy - radius) + 'px';
  el.appendChild(wave);
  return wave;
}

function pressIn(wave, reduce) {
  if (reduce) {
    try {
      const anim = wave.animate(
        [
          { opacity: '0' },
          { opacity: OPACITY_MAX }
        ],
        { duration: DURATION_IN, easing: EASING, fill: 'forwards' }
      );
      return anim;
    } catch (e) {
      wave.style.opacity = OPACITY_MAX;
      return null;
    }
  }
  try {
    const anim = wave.animate(
      [
        { transform: 'scale(0)', opacity: OPACITY_MAX },
        { transform: 'scale(1)', opacity: OPACITY_MAX }
      ],
      { duration: DURATION_IN, easing: EASING, fill: 'forwards' }
    );
    return anim;
  } catch (e) {
    wave.style.transform = 'scale(1)';
    wave.style.opacity = OPACITY_MAX;
    return null;
  }
}

function triggerFadeOut(wave, reduce) {
  try {
    const animOut = wave.animate(
      reduce
        ? [
            { opacity: OPACITY_MAX },
            { opacity: '0' }
          ]
        : [
            { transform: 'scale(1)', opacity: OPACITY_MAX },
            { opacity: '0' }
          ],
      { duration: DURATION_OUT, easing: EASING, fill: 'forwards' }
    );
    animOut.finished.then(() => {
      try { wave.remove(); } catch (e) {}
    }).catch(() => {
      try { wave.remove(); } catch (e) {}
    });
    return animOut;
  } catch (e) {
    try { wave.remove(); } catch (e2) {}
    return null;
  }
}

function onRelease(el, state, reduce) {
  if (!state || !state.wave || state.released) return;
  state.released = true;
  if (state.animOut) return;
  const animIn = state.animIn;
  if (animIn && typeof animIn.finished !== 'undefined') {
    Promise.resolve(animIn.finished)
      .then(() => {
        const cur = active.get(el);
        if (!cur || cur !== state || cur.animOut) return;
        cur.animOut = triggerFadeOut(cur.wave, reduce);
      })
      .catch(() => {
        const cur = active.get(el);
        if (!cur || cur !== state || cur.animOut) return;
        cur.animOut = triggerFadeOut(cur.wave, reduce);
      });
    return;
  }
  state.animOut = triggerFadeOut(state.wave, reduce);
}

function onPointerDown(e) {
  if (e.button !== 0) return;
  const el = getTargetFromEvent(e);
  if (!el) return;
  if (isDisabled(el)) return;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const reduce = getMotion();
  const wave = createWave(el, x, y, false);
  const animIn = pressIn(wave, reduce);
  const state = { wave, animIn, animOut: null, released: false };
  active.set(el, state);

  const up = (ev) => {
    if (ev.pointerId !== undefined && ev.pointerId !== e.pointerId) return;
    onRelease(el, state, reduce);
    cleanup();
  };
  const leave = (ev) => {
    if (ev.pointerId !== undefined && ev.pointerId !== e.pointerId) return;
    onRelease(el, state, reduce);
    cleanup();
  };
  const cancel = (ev) => {
    if (ev.pointerId !== undefined && ev.pointerId !== e.pointerId) return;
    onRelease(el, state, reduce);
    cleanup();
  };
  function cleanup() {
    document.removeEventListener('pointerup', up);
    document.removeEventListener('pointerleave', leave);
    document.removeEventListener('pointercancel', cancel);
  }
  document.addEventListener('pointerup', up);
  document.addEventListener('pointerleave', leave);
  document.addEventListener('pointercancel', cancel);
}

function onKeyDown(e) {
  const key = e.key;
  if (key !== ' ' && key !== 'Spacebar' && key !== 'Enter') return;
  const el = getTargetFromEvent(e);
  if (!el) return;
  if (isDisabled(el)) return;
  if (key === ' ' || key === 'Spacebar') {
    try { e.preventDefault(); } catch (err) {}
  }
  const reduce = getMotion();
  const wave = createWave(el, 0, 0, true);
  const animIn = pressIn(wave, reduce);
  const state = { wave, animIn, animOut: null, released: false };
  active.set(el, state);

  const up = (ev) => {
    const k = ev.key;
    if (k !== ' ' && k !== 'Spacebar' && k !== 'Enter') return;
    onRelease(el, state, reduce);
    document.removeEventListener('keyup', up);
  };
  document.addEventListener('keyup', up);
}

export function registrar() {
  if (iniciado) return;
  iniciado = true;
  try {
    document.addEventListener('pointerdown', onPointerDown, { passive: true });
  } catch (e) {
    document.addEventListener('pointerdown', onPointerDown);
  }
  document.addEventListener('keydown', onKeyDown);
}
