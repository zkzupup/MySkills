# vis-shared.js — Shared Visualization Utilities

This file is the **project-agnostic** visualization toolkit. Copy it to `js/vis-shared.js` with minimal or no modifications.

## Adaptation Points

- **Font family** (line with `"Microsoft YaHei"`): change for non-CJK projects
- Everything else is generic and reusable as-is

## Full Code

```javascript
/* ===== Visualization Shared Utilities ===== */
var VisShared = (function () {
  'use strict';

  /* ---- SVG Helpers ---- */
  var NS = 'http://www.w3.org/2000/svg';

  function createSVG(container, w, h) {
    var wrapper = document.createElement('div');
    wrapper.className = 'vis-svg-wrapper';
    wrapper.style.position = 'relative';

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('data-vw', w);
    svg.setAttribute('data-vh', h);
    svg.style.width = '100%';
    svg.style.maxWidth = w + 'px';
    svg.style.display = 'block';
    svg.style.margin = '0 auto';

    /* Zoom button */
    var zoomBtn = document.createElement('button');
    zoomBtn.className = 'vis-zoom-btn';
    zoomBtn.title = 'Click to zoom';
    zoomBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none">' +
      '<circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" stroke-width="1.5"/>' +
      '<path d="M12 12l4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M5.5 7.5h4M7.5 5.5v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    zoomBtn.addEventListener('click', function () { openSvgLightbox(svg); });

    wrapper.appendChild(svg);
    wrapper.appendChild(zoomBtn);
    container.appendChild(wrapper);
    return svg;
  }

  /* SVG Lightbox — fullscreen zoom viewer */
  function openSvgLightbox(origSvg) {
    var overlay = document.createElement('div');
    overlay.className = 'vis-svg-lightbox';

    var toolbar = document.createElement('div');
    toolbar.className = 'vis-lightbox-toolbar';
    toolbar.innerHTML =
      '<button class="vis-lb-btn" data-action="zoomIn" title="Zoom in">+</button>' +
      '<button class="vis-lb-btn" data-action="zoomOut" title="Zoom out">-</button>' +
      '<button class="vis-lb-btn" data-action="reset" title="Reset">1:1</button>' +
      '<span class="vis-lb-scale">100%</span>' +
      '<button class="vis-lb-btn vis-lb-close" data-action="close" title="Close">&times;</button>';
    overlay.appendChild(toolbar);

    var viewport = document.createElement('div');
    viewport.className = 'vis-lightbox-viewport';
    overlay.appendChild(viewport);

    var clone = origSvg.cloneNode(true);
    var vw = parseInt(origSvg.getAttribute('data-vw')) || 860;
    var vh = parseInt(origSvg.getAttribute('data-vh')) || 400;
    clone.style.width = vw + 'px';
    clone.style.maxWidth = 'none';
    clone.style.cursor = 'grab';
    viewport.appendChild(clone);

    var scale = 1, translateX = 0, translateY = 0;
    var isDragging = false, startX = 0, startY = 0;
    var scaleLabel = toolbar.querySelector('.vis-lb-scale');

    function updateTransform() {
      clone.style.transform = 'translate(' + translateX + 'px,' + translateY + 'px) scale(' + scale + ')';
      scaleLabel.textContent = Math.round(scale * 100) + '%';
    }

    requestAnimationFrame(function () {
      var vRect = viewport.getBoundingClientRect();
      var scaleX = (vRect.width - 40) / vw;
      var scaleY = (vRect.height - 40) / vh;
      scale = Math.min(scaleX, scaleY, 1.5);
      updateTransform();
    });

    toolbar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      if (action === 'close') return;
      if (action === 'zoomIn') scale = Math.min(scale * 1.25, 4);
      if (action === 'zoomOut') scale = Math.max(scale / 1.25, 0.3);
      if (action === 'reset') { scale = 1; translateX = 0; translateY = 0; }
      updateTransform();
    });

    function closeLightbox() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keydown', onKey);
    }

    clone.addEventListener('mousedown', function (e) {
      isDragging = true; startX = e.clientX - translateX; startY = e.clientY - translateY;
      clone.style.cursor = 'grabbing';
      e.preventDefault();
    });
    function onMouseMove(e) {
      if (!isDragging) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    }
    function onMouseUp() {
      isDragging = false;
      if (clone.parentNode) clone.style.cursor = 'grab';
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    viewport.addEventListener('wheel', function (e) {
      e.preventDefault();
      var factor = e.deltaY < 0 ? 1.1 : 0.9;
      scale = Math.min(Math.max(scale * factor, 0.3), 4);
      updateTransform();
    }, { passive: false });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target === viewport) closeLightbox();
    });

    function onKey(e) { if (e.key === 'Escape') closeLightbox(); }
    document.addEventListener('keydown', onKey);
    toolbar.querySelector('[data-action="close"]').addEventListener('click', closeLightbox);

    document.body.appendChild(overlay);
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function svgText(text, x, y, size, opts) {
    opts = opts || {};
    var el = svgEl('text', {
      x: x, y: y,
      'text-anchor': opts.anchor || 'middle',
      'dominant-baseline': opts.baseline || 'central',
      'font-size': size,
      'font-weight': opts.weight || '400',
      /* ADAPT: change font family for non-CJK projects */
      'font-family': '"Microsoft YaHei","PingFang SC",sans-serif',
      fill: opts.fill || 'var(--text, #1a1a2e)',
    });
    el.textContent = text;
    return el;
  }

  function svgGroup(className) {
    var g = svgEl('g');
    if (className) g.setAttribute('class', className);
    return g;
  }

  /* ---- Rough.js Wrappers (with plain SVG fallbacks) ---- */
  function getRc(svg) {
    if (typeof rough !== 'undefined') return rough.svg(svg);
    return null;
  }

  function drawBox(rc, x, y, w, h, color, opts) {
    if (!rc) return svgEl('rect', { x: x, y: y, width: w, height: h, fill: color, stroke: '#444', 'stroke-width': 1.5, rx: 4 });
    return rc.rectangle(x, y, w, h, Object.assign({
      fill: color, fillStyle: 'solid', roughness: 0.8, strokeWidth: 1.5, stroke: '#444'
    }, opts || {}));
  }

  function drawLine(rc, x1, y1, x2, y2, opts) {
    if (!rc) return svgEl('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: opts && opts.stroke || '#999', 'stroke-width': 1.5 });
    return rc.line(x1, y1, x2, y2, Object.assign({
      roughness: 0.5, strokeWidth: 1.5, stroke: '#999'
    }, opts || {}));
  }

  function drawArrow(rc, x1, y1, x2, y2, opts) {
    var g = svgGroup();
    g.appendChild(drawLine(rc, x1, y1, x2, y2, opts));
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return g;
    var ux = dx / len, uy = dy / len;
    var sz = 7;
    var px = -uy, py = ux;
    var tri = [
      [x2, y2],
      [x2 - ux * sz + px * sz * 0.5, y2 - uy * sz + py * sz * 0.5],
      [x2 - ux * sz - px * sz * 0.5, y2 - uy * sz - py * sz * 0.5],
    ];
    if (rc) {
      g.appendChild(rc.polygon(tri, { fill: (opts && opts.stroke) || '#999', fillStyle: 'solid', roughness: 0.3, strokeWidth: 0.5, stroke: (opts && opts.stroke) || '#999' }));
    } else {
      g.appendChild(svgEl('polygon', { points: tri.map(function (t) { return t.join(','); }).join(' '), fill: (opts && opts.stroke) || '#999' }));
    }
    return g;
  }

  /* ---- Animation Helpers ---- */
  function fadeIn(el, delay) {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.5s ease ' + (delay || 0) + 'ms';
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.opacity = '1'; }); });
  }

  function animateSequence(elements, delayMs) {
    elements.forEach(function (el, i) { fadeIn(el, i * (delayMs || 300)); });
  }

  function pulseNode(el, color, duration) {
    el.style.transition = 'filter ' + (duration || 300) + 'ms';
    el.style.filter = 'drop-shadow(0 0 8px ' + (color || '#3b82f6') + ')';
    setTimeout(function () { el.style.filter = ''; }, duration || 300);
  }

  function animateDot(svg, x1, y1, x2, y2, color, duration, onDone) {
    var dot = svgEl('circle', { cx: x1, cy: y1, r: 5, fill: color || '#3b82f6' });
    svg.appendChild(dot);
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / (duration || 1000), 1);
      var ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      dot.setAttribute('cx', x1 + (x2 - x1) * ease);
      dot.setAttribute('cy', y1 + (y2 - y1) * ease);
      if (t < 1) requestAnimationFrame(step);
      else { dot.remove(); if (onDone) onDone(); }
    }
    requestAnimationFrame(step);
  }

  /* ---- Interactive Detail Panel ---- */
  function createDetailPanel(parentContainer) {
    var panel = document.createElement('div');
    panel.className = 'vis-detail-panel';
    panel.style.display = 'none';
    panel.innerHTML = '<div class="vis-detail-header"><span class="vis-detail-title"></span>' +
      '<button class="vis-detail-close">&times;</button></div><div class="vis-detail-body"></div>';
    parentContainer.appendChild(panel);
    panel.querySelector('.vis-detail-close').addEventListener('click', function () { panel.style.display = 'none'; });
    return {
      show: function (title, html) {
        panel.querySelector('.vis-detail-title').textContent = title;
        panel.querySelector('.vis-detail-body').innerHTML = html;
        panel.style.display = '';
      },
      hide: function () { panel.style.display = 'none'; },
      el: panel,
    };
  }

  /* ---- Module Page Header ---- */
  function renderModuleHeader(container, mod, subtitle) {
    var layerClass = mod.layer ? 'badge-layer-' + mod.layer : '';
    container.innerHTML = '<div class="module-header">' +
      '<h2>' + mod.name + '</h2>' +
      (subtitle ? '<p style="color:var(--text-secondary);margin:-8px 0 12px">' + subtitle + '</p>' : '') +
      '<div class="module-meta">' +
      '<span class="badge badge-' + (mod.priority || 'p2').toLowerCase() + '">' + (mod.priority || 'P2') + '</span>' +
      (mod.layer ? '<span class="badge badge-layer ' + layerClass + '">' + mod.layer + '</span>' : '') +
      (mod.fileCount ? '<span class="badge" style="background:var(--bg-tertiary);color:var(--text-secondary)">' + mod.fileCount + ' files</span>' : '') +
      '</div></div>';
  }

  /* ---- Doc Links Footer ---- */
  function renderDocFooter(container, moduleId, docs) {
    if (!docs || !docs.length) return;
    var html = '<div class="vis-doc-footer"><h3>Related Documents</h3>';
    docs.forEach(function (d) {
      html += '<a class="doc-list-item" href="#/doc/' + moduleId + '/' + d.id + '">' +
        '<span class="doc-id">' + d.id + '</span>' + d.title + '</a>';
    });
    html += '</div>';
    container.insertAdjacentHTML('beforeend', html);
  }

  /* ---- Viz Legend ---- */
  function renderVizLegend(container, items) {
    var wrap = document.createElement('div');
    wrap.className = 'viz-legend';
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', 'Legend');
    items.forEach(function (it) {
      var row = document.createElement('span');
      row.className = 'viz-legend-item';
      var sw = document.createElement('span');
      sw.className = 'viz-legend-swatch';
      sw.style.background = it.color || 'var(--border)';
      row.appendChild(sw);
      row.appendChild(document.createTextNode(it.label || ''));
      wrap.appendChild(row);
    });
    container.appendChild(wrap);
    return wrap;
  }

  /* ---- Interactive Sequence View ---- */
  function createSequenceView(container, steps, options) {
    options = options || {};
    var wrap = document.createElement('div');
    wrap.className = 'viz-sequence';
    if (options.title) {
      var h = document.createElement('h4');
      h.className = 'viz-sequence-title';
      h.textContent = options.title;
      wrap.appendChild(h);
    }
    var nav = document.createElement('div');
    nav.className = 'viz-sequence-nav';
    nav.innerHTML =
      '<button type="button" class="vis-btn viz-seq-prev">Prev</button>' +
      '<button type="button" class="vis-btn vis-btn-primary viz-seq-play">Play</button>' +
      '<button type="button" class="vis-btn viz-seq-next">Next</button>' +
      '<span class="viz-seq-progress"></span>';
    wrap.appendChild(nav);
    var list = document.createElement('div');
    list.className = 'viz-sequence-list';
    steps.forEach(function (s, i) {
      var step = document.createElement('div');
      step.className = 'viz-sequence-step' + (i === 0 ? ' active' : '');
      step.dataset.index = String(i);
      step.innerHTML =
        '<div class="viz-seq-num">' + (i + 1) + '</div>' +
        '<div class="viz-seq-body">' +
        '<div class="viz-seq-step-title">' + (s.title || '') + '</div>' +
        (s.desc ? '<p class="viz-seq-desc">' + s.desc + '</p>' : '') +
        (s.file ? '<p class="viz-seq-file"><code>' + s.file + '</code></p>' : '') +
        '</div>';
      list.appendChild(step);
    });
    wrap.appendChild(list);
    container.appendChild(wrap);

    var idx = 0;
    var progressEl = nav.querySelector('.viz-seq-progress');
    var playTimer = null;
    function setProgress() {
      progressEl.textContent = (idx + 1) + ' / ' + steps.length;
      list.querySelectorAll('.viz-sequence-step').forEach(function (el, j) {
        el.classList.toggle('active', j === idx);
      });
    }
    function go(delta) { idx = (idx + delta + steps.length) % steps.length; setProgress(); }
    nav.querySelector('.viz-seq-prev').addEventListener('click', function () { go(-1); });
    nav.querySelector('.viz-seq-next').addEventListener('click', function () { go(1); });
    nav.querySelector('.viz-seq-play').addEventListener('click', function () {
      if (playTimer) { clearInterval(playTimer); playTimer = null; return; }
      playTimer = setInterval(function () {
        if (idx >= steps.length - 1) { clearInterval(playTimer); playTimer = null; idx = 0; }
        else idx++;
        setProgress();
      }, options.intervalMs || 2200);
    });
    setProgress();
    return { el: wrap, setStep: function (i) { idx = Math.max(0, Math.min(steps.length - 1, i)); setProgress(); } };
  }

  /* ---- Toolbar (play/pause/scenario buttons) ---- */
  function createToolbar(container) {
    var bar = document.createElement('div');
    bar.className = 'vis-toolbar';
    container.appendChild(bar);
    var scenarioBtns = [];
    return {
      el: bar,
      addButton: function (label, onClick, opts) {
        var btn = document.createElement('button');
        var isPrimary = opts && opts.primary;
        btn.className = 'vis-btn' + (isPrimary ? ' vis-btn-primary' : '');
        btn.textContent = label;
        if (!isPrimary) {
          scenarioBtns.push(btn);
          btn.addEventListener('click', function () {
            scenarioBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            onClick();
            setTimeout(function () { btn.classList.remove('active'); }, 3000);
          });
        } else {
          btn.addEventListener('click', onClick);
        }
        bar.appendChild(btn);
        return btn;
      },
      addSeparator: function () {
        var sep = document.createElement('span');
        sep.className = 'vis-toolbar-sep';
        bar.appendChild(sep);
      },
    };
  }

  /* ---- FSM Explorer (ring layout, click state for note) ---- */
  function createFsmExplorer(container, states, transitions, options) {
    options = options || {};
    var wrap = document.createElement('div');
    wrap.className = 'viz-fsm';
    if (options.title) {
      var h = document.createElement('h4');
      h.className = 'viz-fsm-title';
      h.textContent = options.title;
      wrap.appendChild(h);
    }
    var svgW = options.width || 520, svgH = options.height || 280;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + svgW + ' ' + svgH);
    svg.style.width = '100%'; svg.style.maxWidth = svgW + 'px';
    svg.style.display = 'block'; svg.style.margin = '0 auto';
    var cx = svgW / 2, cy = svgH / 2 - 10, r = Math.min(svgW, svgH) * 0.28;
    var n = states.length, stateEls = [];
    states.forEach(function (st, i) {
      var ang = -Math.PI / 2 + (2 * Math.PI * i) / n;
      var x = cx + r * Math.cos(ang), y = cy + r * Math.sin(ang);
      var g = svgGroup();
      g.appendChild(drawBox(null, x - 52, y - 18, 104, 36, 'var(--bg-secondary)', { roughness: 0.3, stroke: 'var(--accent)' }));
      g.appendChild(svgText(st.label || st.id, x, y, 10, { weight: '600' }));
      g.style.cursor = 'pointer';
      (function (st) { g.addEventListener('click', function () {
        detailEl.innerHTML = '<strong>' + (st.label || st.id) + '</strong><p>' + (st.note || '') + '</p>';
      }); })(st);
      svg.appendChild(g);
      stateEls.push({ id: st.id, x: x, y: y });
    });
    function findPos(id) { for (var si = 0; si < stateEls.length; si++) { if (stateEls[si].id === id) return stateEls[si]; } return null; }
    transitions.forEach(function (tr) {
      var a = findPos(tr.from), b = findPos(tr.to);
      if (!a || !b) return;
      svg.appendChild(drawArrow(null, a.x, a.y, b.x, b.y, { stroke: 'var(--text-muted)', strokeWidth: 1.2 }));
      if (tr.label) svg.appendChild(svgText(tr.label, (a.x + b.x) / 2, (a.y + b.y) / 2 - 8, 7, { fill: 'var(--text-muted)' }));
    });
    var detailEl = document.createElement('div');
    detailEl.className = 'viz-fsm-detail';
    detailEl.innerHTML = '<p class="viz-fsm-hint">Click a state for details</p>';
    wrap.appendChild(svg); wrap.appendChild(detailEl);
    container.appendChild(wrap);
    return { el: wrap };
  }

  /* ---- Dual Column Bridge (Lua | Bridge | C#) ---- */
  function createDualColumnBridge(container, spec) {
    var wrap = document.createElement('div');
    wrap.className = 'viz-dual-bridge';
    wrap.innerHTML =
      '<div class="viz-dual-col viz-dual-left"><div class="viz-dual-h">' + (spec.leftTitle || 'Left') + '</div>' +
      '<ul class="viz-dual-ul">' + (spec.leftItems || []).map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>' +
      '<div class="viz-dual-col viz-dual-mid"><div class="viz-dual-h">' + (spec.bridgeTitle || 'Bridge') + '</div>' +
      '<ul class="viz-dual-ul">' + (spec.bridgeItems || []).map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>' +
      '<div class="viz-dual-col viz-dual-right"><div class="viz-dual-h">' + (spec.rightTitle || 'Right') + '</div>' +
      '<ul class="viz-dual-ul">' + (spec.rightItems || []).map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>';
    container.appendChild(wrap);
    return wrap;
  }

  /* ---- Mini Dependency Graph ---- */
  function createMiniGraph(container, nodes, edges, options) {
    options = options || {};
    var w = options.width || 480, h = options.height || 220;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.style.width = '100%'; svg.style.maxWidth = w + 'px'; svg.style.display = 'block'; svg.style.margin = '0 auto';
    var pos = {};
    nodes.forEach(function (n, i) { pos[n.id] = { x: 60 + (i % 4) * 110, y: 40 + Math.floor(i / 4) * 70 }; });
    edges.forEach(function (e) {
      var a = pos[e.from], b = pos[e.to]; if (!a || !b) return;
      svg.appendChild(drawArrow(null, a.x + 40, a.y, b.x - 40, b.y, { stroke: 'var(--text-muted)', strokeWidth: 1.2 }));
      if (e.label) svg.appendChild(svgText(e.label, (a.x + b.x) / 2, (a.y + b.y) / 2 - 6, 7, { fill: 'var(--accent)' }));
    });
    nodes.forEach(function (n) {
      var p = pos[n.id]; if (!p) return;
      svg.appendChild(drawBox(null, p.x - 45, p.y - 16, 90, 32, 'var(--bg-secondary)', { roughness: 0.4, stroke: 'var(--border)' }));
      svg.appendChild(svgText(n.label || n.id, p.x, p.y, 9, { weight: '600' }));
    });
    container.appendChild(svg);
    return svg;
  }

  /* ---- Story Cards ---- */
  function createStoryCards(container, cards) {
    var wrap = document.createElement('div');
    wrap.className = 'viz-story-cards';
    cards.forEach(function (c) {
      var card = document.createElement('div');
      card.className = 'viz-story-card';
      card.innerHTML = '<div class="viz-story-k">' + (c.kicker || '') + '</div>' +
        '<h3 class="viz-story-t">' + (c.title || '') + '</h3>' +
        (c.body ? '<p class="viz-story-b">' + c.body + '</p>' : '') +
        (c.repo ? '<p class="viz-story-repo"><code>' + c.repo + '</code></p>' : '');
      wrap.appendChild(card);
    });
    container.appendChild(wrap);
    return wrap;
  }

  /* ---- Metrics Strip ---- */
  function createMetricsStrip(container, metrics) {
    var wrap = document.createElement('div');
    wrap.className = 'viz-metrics-strip';
    metrics.forEach(function (m) {
      var pct = Math.min(100, Math.round((m.value / (m.max || 100)) * 100));
      var row = document.createElement('div');
      row.className = 'viz-metric-row';
      row.innerHTML = '<span class="viz-metric-label">' + (m.label || '') + '</span>' +
        '<div class="viz-metric-bar"><div class="viz-metric-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="viz-metric-val">' + (m.display != null ? m.display : m.value) + '</span>';
      wrap.appendChild(row);
    });
    container.appendChild(wrap);
    return wrap;
  }

  /* ---- Animated Stats Grid (count-up on viewport entry) ---- */
  function createAnimatedStats(container, stats) {
    var wrap = document.createElement('div');
    wrap.className = 'stats-grid stats-animated';
    stats.forEach(function (s) {
      var card = document.createElement('div');
      card.className = 'stat-card stat-card-anim';
      card.innerHTML = '<div class="stat-value" data-count="' + (s.countTo || '') + '">' + (s.value || '') + '</div>' +
        '<div class="stat-label">' + (s.label || '') + '</div>';
      wrap.appendChild(card);
    });
    container.appendChild(wrap);
    var observed = false;
    function triggerAnim() {
      if (observed) return; observed = true;
      wrap.querySelectorAll('.stat-value[data-count]').forEach(function (el) {
        var raw = el.getAttribute('data-count'); if (!raw) return;
        var target = parseInt(raw, 10); if (isNaN(target)) return;
        var display = el.textContent, start = 0, dur = 1000, t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(start + (target - start) * ease).toLocaleString();
          if (p < 1) requestAnimationFrame(step); else el.textContent = display;
        }
        requestAnimationFrame(step);
      });
    }
    if (typeof IntersectionObserver !== 'undefined') {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { triggerAnim(); io.disconnect(); } });
      }, { threshold: 0.3 });
      io.observe(wrap);
    } else { setTimeout(triggerAnim, 300); }
    return wrap;
  }

  /* ---- Collapsible Key Points ---- */
  function createKeyPoints(container, points, options) {
    options = options || {};
    var wrap = document.createElement('div');
    wrap.className = 'vis-keypoints';
    if (options.title) { var h = document.createElement('h3'); h.textContent = options.title; wrap.appendChild(h); }
    var list = document.createElement('ul');
    list.className = 'vis-keypoints-list';
    points.forEach(function (pt, i) {
      var li = document.createElement('li');
      li.className = 'vis-kp-item' + (i >= 3 ? ' vis-kp-hidden' : '');
      li.innerHTML = '<span class="vis-kp-icon">' + (pt.icon || '&#9679;') + '</span><span class="vis-kp-text">' + pt.text + '</span>';
      list.appendChild(li);
    });
    wrap.appendChild(list);
    if (points.length > 3) {
      var toggle = document.createElement('button');
      toggle.className = 'vis-kp-toggle';
      toggle.textContent = 'Show all (' + points.length + ')';
      toggle.addEventListener('click', function () {
        var hidden = list.querySelectorAll('.vis-kp-hidden');
        if (hidden.length) { hidden.forEach(function (el) { el.classList.remove('vis-kp-hidden'); }); toggle.textContent = 'Collapse'; }
        else { list.querySelectorAll('.vis-kp-item').forEach(function (el, i) { if (i >= 3) el.classList.add('vis-kp-hidden'); }); toggle.textContent = 'Show all (' + points.length + ')'; }
      });
      wrap.appendChild(toggle);
    }
    container.appendChild(wrap);
    return wrap;
  }

  /* ---- Story Walkthrough (expandable scenario cards) ---- */
  function createStoryWalkthrough(container, scenarios) {
    var wrap = document.createElement('div');
    wrap.className = 'story-walkthroughs';
    scenarios.forEach(function (sc) {
      var card = document.createElement('div');
      card.className = 'story-wt-card';
      var header = document.createElement('div');
      header.className = 'story-wt-header';
      header.innerHTML = '<span class="story-wt-icon">' + (sc.icon || '') + '</span>' +
        '<span class="story-wt-q">' + sc.question + '</span><span class="story-wt-arrow">&#9662;</span>';
      card.appendChild(header);
      var body = document.createElement('div');
      body.className = 'story-wt-body';
      var timeline = document.createElement('div');
      timeline.className = 'story-wt-timeline';
      sc.steps.forEach(function (step, i) {
        var stepEl = document.createElement('div');
        stepEl.className = 'story-wt-step';
        stepEl.innerHTML = '<div class="story-wt-num">' + (i + 1) + '</div>' +
          '<div class="story-wt-content"><div class="story-wt-title">' + step.title + '</div>' +
          '<div class="story-wt-desc">' + step.desc + '</div>' +
          (step.link ? '<a class="story-wt-link" href="' + step.link + '">Details &rarr;</a>' : '') + '</div>';
        timeline.appendChild(stepEl);
      });
      body.appendChild(timeline);
      card.appendChild(body);
      header.addEventListener('click', function () {
        var isOpen = card.classList.contains('open');
        wrap.querySelectorAll('.story-wt-card.open').forEach(function (c) { c.classList.remove('open'); });
        if (!isOpen) card.classList.add('open');
      });
      wrap.appendChild(card);
    });
    container.appendChild(wrap);
    return wrap;
  }

  /* ---- Comparison Matrix ---- */
  function createComparisonMatrix(container, spec) {
    var wrap = document.createElement('div');
    wrap.className = 'vis-cmp-matrix';
    if (spec.title) { var h = document.createElement('h4'); h.className = 'vis-cmp-title'; h.textContent = spec.title; wrap.appendChild(h); }
    var table = document.createElement('table');
    table.className = 'vis-cmp-table';
    var thead = '<tr><th></th>';
    spec.columns.forEach(function (c) { thead += '<th>' + c + '</th>'; });
    table.innerHTML = '<thead>' + thead + '</tr></thead>';
    var tbody = document.createElement('tbody');
    spec.rows.forEach(function (row) {
      var cells = '<td class="vis-cmp-dim">' + row.dimension + '</td>';
      row.values.forEach(function (v) {
        var cls = 'vis-cmp-cell', sym = '';
        if (v === true || v === 'yes') { cls += ' vis-cmp-yes'; sym = '&#10003;'; }
        else if (v === false || v === 'no') { cls += ' vis-cmp-no'; sym = '&#10007;'; }
        else if (v === 'partial') { cls += ' vis-cmp-partial'; sym = '&#9679;'; }
        else { sym = String(v); }
        cells += '<td class="' + cls + '">' + sym + '</td>';
      });
      var tr = document.createElement('tr'); tr.innerHTML = cells; tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    container.appendChild(wrap);
    return wrap;
  }

  /* ---- Module Card ---- */
  function createModuleCard(container, mod) {
    var card = document.createElement('div');
    card.className = 'vis-mod-card';
    var layerColors = { Foundation: '#eebefa', Core: '#ffec99', Feature: '#b2f2bb', Peripheral: '#ffc9c9', Bridge: '#a5d8ff', Unknown: '#e5e7eb' };
    var color = layerColors[mod.layer] || layerColors.Unknown;
    card.innerHTML =
      '<div class="vis-mod-card-bar" style="background:' + color + '"></div>' +
      '<div class="vis-mod-card-body">' +
      '<div class="vis-mod-card-header">' +
      '<span class="badge badge-' + (mod.priority || 'p2').toLowerCase() + '">' + (mod.priority || 'P2') + '</span>' +
      (mod.layer ? '<span class="badge badge-layer badge-layer-' + mod.layer + '">' + mod.layer + '</span>' : '') +
      '</div><h3 class="vis-mod-card-name">' + mod.name + '</h3>' +
      '<div class="vis-mod-card-stats">' +
      (mod.fileCount ? '<span>' + mod.fileCount + ' files</span>' : '') +
      (mod.docs ? '<span>' + mod.docs.length + ' docs</span>' : '') +
      '</div></div>';
    container.appendChild(card);
    return card;
  }

  /* ---- Public API ---- */
  return {
    NS: NS,
    createSVG: createSVG,
    svgEl: svgEl,
    svgText: svgText,
    svgGroup: svgGroup,
    getRc: getRc,
    drawBox: drawBox,
    drawLine: drawLine,
    drawArrow: drawArrow,
    fadeIn: fadeIn,
    animateSequence: animateSequence,
    pulseNode: pulseNode,
    animateDot: animateDot,
    createDetailPanel: createDetailPanel,
    renderModuleHeader: renderModuleHeader,
    renderDocFooter: renderDocFooter,
    createToolbar: createToolbar,
    renderVizLegend: renderVizLegend,
    createSequenceView: createSequenceView,
    createFsmExplorer: createFsmExplorer,
    createDualColumnBridge: createDualColumnBridge,
    createMiniGraph: createMiniGraph,
    createStoryCards: createStoryCards,
    createMetricsStrip: createMetricsStrip,
    createAnimatedStats: createAnimatedStats,
    createKeyPoints: createKeyPoints,
    createStoryWalkthrough: createStoryWalkthrough,
    createComparisonMatrix: createComparisonMatrix,
    createModuleCard: createModuleCard,
  };
})();
```

## API Reference

| Method | Description |
|--------|-------------|
| `createSVG(container, w, h)` | Create SVG with zoom button; returns SVG element |
| `svgEl(tag, attrs)` | Create SVG element with attributes |
| `svgText(text, x, y, size, opts)` | Create positioned text element |
| `svgGroup(className?)` | Create `<g>` group element |
| `getRc(svg)` | Get rough.js canvas (or null if not loaded) |
| `drawBox(rc, x, y, w, h, color, opts)` | Draw rectangle (rough or plain fallback) |
| `drawLine(rc, x1, y1, x2, y2, opts)` | Draw line |
| `drawArrow(rc, x1, y1, x2, y2, opts)` | Draw line with arrowhead |
| `fadeIn(el, delay)` | Fade-in animation with optional delay |
| `animateSequence(elements, delayMs)` | Staggered fade-in for array of elements |
| `pulseNode(el, color, duration)` | Drop-shadow pulse effect |
| `animateDot(svg, x1, y1, x2, y2, color, dur)` | Animate a dot along a path |
| `createDetailPanel(container)` | Returns `{show(title,html), hide(), el}` |
| `renderModuleHeader(container, mod, subtitle)` | Render module page header with badges |
| `renderDocFooter(container, moduleId, docs)` | Render doc links at bottom of module page |
| `renderVizLegend(container, items)` | Render color legend strip |
| `createSequenceView(container, steps, opts)` | Interactive step-through view |
| `createToolbar(container)` | Returns `{addButton(label, fn, opts), addSeparator()}` |
| `createFsmExplorer(container, states, transitions, opts)` | Ring-layout FSM with click-to-inspect states |
| `createDualColumnBridge(container, spec)` | Three-panel Lua/Bridge/C# layout |
| `createMiniGraph(container, nodes, edges, opts)` | Small dependency graph (auto-layout grid) |
| `createStoryCards(container, cards)` | Grid of kicker+title+body cards |
| `createMetricsStrip(container, metrics)` | Horizontal bar chart metrics |
| `createAnimatedStats(container, stats)` | Count-up animated stat cards (IntersectionObserver) |
| `createKeyPoints(container, points, opts)` | Collapsible bullet list (shows 3, expand for all) |
| `createStoryWalkthrough(container, scenarios)` | Accordion scenario cards with step timelines |
| `createComparisonMatrix(container, spec)` | Yes/No/Partial comparison table |
| `createModuleCard(container, mod)` | Module info card with layer color bar |
