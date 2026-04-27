# app.js — SPA Router & Renderer Skeleton

This is the main application script. It handles routing, data loading, sidebar, search, and page rendering.

## Adaptation Points (marked with `/* ADAPT */`)

1. `READING_PATHS` — guided reading routes through your docs
2. `getModuleVis(id)` — visualization registry mapping module IDs to render functions
3. `renderHomepage()` — project-specific intro content, architecture overview, scenario cards
4. Sidebar group names and IDs
5. Data file paths (if different from default `data/` directory)

## Full Skeleton

```javascript
/* ===== {{PROJECT_NAME}} Interactive Documentation — Main App ===== */
(function () {
  'use strict';

  /* ---------- Module data (loaded from JSON or inline) ---------- */
  var MODULES = null;       // { structural: [...], features: [...] }
  var SEARCH_INDEX = null;  // array for Fuse.js
  var fuseInstance = null;

  /* ADAPT: Define guided reading paths through docs */
  var READING_PATHS = {
    overview: {
      label: 'Overview',
      icon: '\u{1F4DA}',
      steps: [
        { route: '#/', label: 'Home' },
        /* { route: '#/module/010', label: 'Module Name' }, */
      ],
    },
  };
  var activePathKey = localStorage.getItem('docsite-path') || 'overview';
  function getActiveReadingPath() { return READING_PATHS[activePathKey] || READING_PATHS.overview; }

  /* ---------- DOM refs ---------- */
  var dom = {};
  function cacheDom() {
    dom.contentBody = document.querySelector('#content-body');
    dom.breadcrumb = document.querySelector('#breadcrumb');
    dom.sidebar = document.querySelector('#sidebar');
    dom.sidebarStructure = document.querySelector('#sidebar-structure');
    dom.sidebarFeatures = document.querySelector('#sidebar-features');
    dom.tocList = document.querySelector('#toc-list');
    dom.tocPanel = document.querySelector('#toc-panel');
    dom.searchInput = document.querySelector('#search-input');
    dom.searchResults = document.querySelector('#search-results');
    dom.searchResultsList = document.querySelector('#search-results-list');
    dom.searchEmpty = document.querySelector('#search-empty');
    dom.searchClose = document.querySelector('#search-close');
    dom.readingPath = document.querySelector('#reading-path');
    dom.readingProgress = document.querySelector('#reading-progress');
    dom.prevDoc = document.querySelector('#prev-doc');
    dom.nextDoc = document.querySelector('#next-doc');
    dom.darkToggle = document.querySelector('#dark-toggle');
    dom.sidebarToggle = document.querySelector('#sidebar-toggle');
    dom.sidebarOverlay = document.querySelector('#sidebar-overlay');
  }

  /* ==================== Data Loading ==================== */

  function loadJSON(path) {
    /* Try inline data first (file:// mode) */
    if (path === 'data/modules.json' && window.MODULES_DATA) return Promise.resolve(window.MODULES_DATA);
    if (path === 'data/search-index.json' && window.SEARCH_INDEX_DATA) return Promise.resolve(window.SEARCH_INDEX_DATA);
    return fetch(path).then(function (resp) {
      if (!resp.ok) throw new Error(resp.status);
      return resp.json();
    }).catch(function (e) {
      console.warn('[DocSite] Failed to load ' + path, e);
      return null;
    });
  }

  function loadDocHTML(moduleId, docId) {
    /* Inline mode */
    if (window.DOCS_DATA && window.DOCS_DATA[moduleId] && window.DOCS_DATA[moduleId][docId]) {
      return Promise.resolve(window.DOCS_DATA[moduleId][docId]);
    }
    /* Fetch mode */
    return fetch('data/docs/' + moduleId + '/' + docId + '.html').then(function (resp) {
      if (!resp.ok) throw new Error(resp.status);
      return resp.text();
    }).catch(function (e) {
      console.warn('[DocSite] Failed to load doc', e);
      return '<p>Document not found.</p>';
    });
  }

  /* ==================== Routing ==================== */

  function parseRoute() {
    var hash = location.hash || '#/';
    var parts = hash.replace('#/', '').split('/');
    if (parts[0] === 'module' && parts[1]) return { type: 'module', moduleId: parts[1] };
    if (parts[0] === 'doc' && parts[1] && parts[2]) return { type: 'doc', moduleId: parts[1], docId: parts[2] };
    return { type: 'home' };
  }

  function navigate() {
    hideTooltip();
    var route = parseRoute();
    if (route.type === 'home') renderHomepage();
    else if (route.type === 'module') renderModule(route.moduleId);
    else if (route.type === 'doc') renderDoc(route.moduleId, route.docId);
    updateSidebarActive(route);
    updateReadingPath(route);
    window.scrollTo(0, 0);
  }

  /* ==================== Sidebar ==================== */

  function buildSidebar() {
    if (!MODULES) return;
    /* ADAPT: sidebar group names and which module list goes where */
    buildSidebarGroup(dom.sidebarStructure, MODULES.structural || []);
    buildSidebarGroup(dom.sidebarFeatures, MODULES.features || []);
  }

  function buildSidebarGroup(ul, modules) {
    ul.innerHTML = '';
    modules.forEach(function (mod) {
      var li = document.createElement('li');
      var item = document.createElement('div');
      item.className = 'module-item';
      item.innerHTML =
        '<span class="expand-icon">&#9654;</span>' +
        '<span class="module-name">' + mod.name + '</span>' +
        '<span class="badge badge-' + (mod.priority || 'p2').toLowerCase() + '">' + (mod.priority || 'P2') + '</span>';
      item.addEventListener('click', function () {
        location.hash = '#/module/' + mod.id;
      });
      li.appendChild(item);

      /* Doc sub-list */
      if (mod.docs && mod.docs.length) {
        var docList = document.createElement('div');
        docList.className = 'sidebar-doc-list';
        mod.docs.forEach(function (d) {
          var a = document.createElement('a');
          a.href = '#/doc/' + mod.id + '/' + d.id;
          a.textContent = d.title;
          docList.appendChild(a);
        });
        li.appendChild(docList);
        item.addEventListener('click', function (e) {
          e.stopPropagation();
          item.classList.toggle('expanded');
          docList.classList.toggle('open');
        });
      }
      ul.appendChild(li);
    });
  }

  function updateSidebarActive(route) {
    document.querySelectorAll('.module-item').forEach(function (el) { el.classList.remove('active'); });
    document.querySelectorAll('.sidebar-doc-list a').forEach(function (el) { el.classList.remove('active'); });
    /* Highlight active item based on route */
  }

  /* ==================== Visualization Registry ==================== */

  /* ADAPT: Map module IDs to their render functions */
  function getModuleVis(id) {
    /* Each vis-{id}.js defines a global renderVis{ID} function */
    var fnName = 'renderVis' + id;
    if (typeof window[fnName] === 'function') return window[fnName];
    return null;
  }

  /* ==================== Page Renderers ==================== */

  function renderHomepage() {
    dom.breadcrumb.innerHTML = '';
    dom.tocList.innerHTML = '';
    /* ADAPT: Replace with project-specific homepage content */
    dom.contentBody.innerHTML =
      '<div class="home-hero">' +
      '<h2>{{PROJECT_NAME}} Documentation</h2>' +
      '<p>Interactive architecture visualization</p>' +
      '</div>' +
      '<div class="home-intro-card">' +
      '<p>Select a module from the sidebar to explore.</p>' +
      '</div>';
  }

  function renderModule(moduleId) {
    var mod = findModule(moduleId);
    if (!mod) { dom.contentBody.innerHTML = '<p>Module not found.</p>'; return; }

    dom.breadcrumb.innerHTML = '<a href="#/">Home</a><span class="sep"> / </span><span>' + mod.name + '</span>';

    /* Try custom visualization first */
    var visFn = getModuleVis(moduleId);
    if (visFn) {
      dom.contentBody.innerHTML = '';
      visFn(dom.contentBody, mod);
    } else {
      /* Fallback: show module info + doc list */
      var html = '<div class="module-header"><h2>' + mod.name + '</h2></div>';
      if (mod.docs && mod.docs.length) {
        html += '<div class="vis-doc-footer"><h3>Documents</h3>';
        mod.docs.forEach(function (d) {
          html += '<a class="doc-list-item" href="#/doc/' + moduleId + '/' + d.id + '">' +
            '<span class="doc-id">' + d.id + '</span>' + d.title + '</a>';
        });
        html += '</div>';
      }
      dom.contentBody.innerHTML = html;
    }
    buildTOC();
  }

  function renderDoc(moduleId, docId) {
    var mod = findModule(moduleId);
    dom.breadcrumb.innerHTML =
      '<a href="#/">Home</a><span class="sep"> / </span>' +
      '<a href="#/module/' + moduleId + '">' + (mod ? mod.name : moduleId) + '</a>' +
      '<span class="sep"> / </span><span>' + docId + '</span>';

    loadDocHTML(moduleId, docId).then(function (html) {
      dom.contentBody.innerHTML = html;
      renderMermaid();
      addMermaidZoom();
      buildTOC();
      markAsRead(moduleId, docId);
    });
  }

  /* ==================== Helpers ==================== */

  function findModule(id) {
    if (!MODULES) return null;
    var all = (MODULES.structural || []).concat(MODULES.features || []);
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return all[i];
    }
    return null;
  }

  function buildTOC() {
    var headings = dom.contentBody.querySelectorAll('h2, h3');
    dom.tocList.innerHTML = '';
    headings.forEach(function (h) {
      if (!h.id) h.id = h.textContent.replace(/\s+/g, '-').toLowerCase();
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      if (h.tagName === 'H3') a.className = 'toc-h3';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        h.scrollIntoView({ behavior: 'smooth' });
      });
      var li = document.createElement('li');
      li.appendChild(a);
      dom.tocList.appendChild(li);
    });
  }

  /* ==================== Mermaid Rendering ==================== */

  function renderMermaid() {
    if (!window.__vendorStatus || !window.__vendorStatus.mermaid) return;
    var blocks = dom.contentBody.querySelectorAll('pre.mermaid');
    if (!blocks.length) return;
    mermaid.initialize({ startOnLoad: false, theme: document.body.classList.contains('dark') ? 'dark' : 'default' });
    blocks.forEach(function (block, i) {
      var code = block.textContent;
      var id = 'mermaid-' + Date.now() + '-' + i;
      try {
        mermaid.render(id, code).then(function (result) {
          block.innerHTML = result.svg;
        });
      } catch (e) { /* keep code block as-is */ }
    });
  }

  function addMermaidZoom() {
    var svgs = dom.contentBody.querySelectorAll('pre.mermaid svg, .mermaid svg');
    svgs.forEach(function (svg) {
      if (svg.parentNode.classList.contains('mermaid-zoom-wrapper')) return;
      var wrapper = document.createElement('div');
      wrapper.className = 'mermaid-zoom-wrapper';
      wrapper.style.position = 'relative';
      svg.parentNode.insertBefore(wrapper, svg);
      wrapper.appendChild(svg);
      var btn = document.createElement('button');
      btn.className = 'vis-zoom-btn';
      btn.style.opacity = '0';
      btn.title = 'Zoom';
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" stroke-width="1.5"/><path d="M12 12l4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M5.5 7.5h4M7.5 5.5v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
      wrapper.addEventListener('mouseenter', function () { btn.style.opacity = '1'; });
      wrapper.addEventListener('mouseleave', function () { btn.style.opacity = '0'; });
      btn.addEventListener('click', function () { VisShared.openSvgLightbox && VisShared.openSvgLightbox(svg); });
      wrapper.appendChild(btn);
    });
  }

  /* ==================== Search ==================== */

  function initSearch() {
    if (!dom.searchInput) return;
    dom.searchInput.addEventListener('input', function () {
      var q = dom.searchInput.value.trim();
      if (q.length < 2) { dom.searchResults.style.display = 'none'; return; }
      var results = searchDocs(q);
      renderSearchResults(results);
      dom.searchResults.style.display = '';
    });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        dom.searchInput.focus();
      }
      if (e.key === 'Escape') {
        dom.searchResults.style.display = 'none';
        dom.searchInput.blur();
      }
    });
    if (dom.searchClose) {
      dom.searchClose.addEventListener('click', function () { dom.searchResults.style.display = 'none'; });
    }
  }

  function searchDocs(query) {
    if (fuseInstance) return fuseInstance.search(query).slice(0, 20).map(function (r) { return r.item; });
    /* Fallback: basic string match */
    if (!SEARCH_INDEX) return [];
    var q = query.toLowerCase();
    return SEARCH_INDEX.filter(function (doc) {
      return (doc.title && doc.title.toLowerCase().indexOf(q) >= 0) ||
             (doc.body && doc.body.toLowerCase().indexOf(q) >= 0);
    }).slice(0, 20);
  }

  function renderSearchResults(results) {
    if (!results.length) {
      dom.searchResultsList.innerHTML = '';
      dom.searchEmpty.style.display = '';
      return;
    }
    dom.searchEmpty.style.display = 'none';
    dom.searchResultsList.innerHTML = results.map(function (r) {
      return '<a class="search-result-item" href="#/doc/' + r.moduleId + '/' + r.id + '">' +
        '<div class="search-result-title">' + r.title + '</div>' +
        '<div class="search-result-module">' + (r.moduleName || r.moduleId) + '</div>' +
        '</a>';
    }).join('');
  }

  /* ==================== Dark Mode ==================== */

  function initDarkMode() {
    var isDark = localStorage.getItem('docsite-dark') === '1';
    if (isDark) document.body.classList.add('dark');
    if (dom.darkToggle) {
      dom.darkToggle.addEventListener('click', function () {
        document.body.classList.toggle('dark');
        localStorage.setItem('docsite-dark', document.body.classList.contains('dark') ? '1' : '0');
      });
    }
  }

  /* ==================== Reading Path ==================== */

  function updateReadingPath(route) {
    var path = getActiveReadingPath();
    var hash = location.hash || '#/';
    var idx = -1;
    path.steps.forEach(function (s, i) { if (s.route === hash) idx = i; });
    if (idx < 0) { dom.readingPath.style.display = 'none'; return; }
    dom.readingPath.style.display = '';
    dom.readingProgress.textContent = (idx + 1) + ' / ' + path.steps.length;
    dom.prevDoc.disabled = (idx === 0);
    dom.nextDoc.disabled = (idx === path.steps.length - 1);
  }

  function initReadingPath() {
    if (dom.prevDoc) {
      dom.prevDoc.addEventListener('click', function () { stepReadingPath(-1); });
    }
    if (dom.nextDoc) {
      dom.nextDoc.addEventListener('click', function () { stepReadingPath(1); });
    }
  }

  function stepReadingPath(delta) {
    var path = getActiveReadingPath();
    var hash = location.hash || '#/';
    var idx = -1;
    path.steps.forEach(function (s, i) { if (s.route === hash) idx = i; });
    var next = idx + delta;
    if (next >= 0 && next < path.steps.length) {
      location.hash = path.steps[next].route;
    }
  }

  /* ==================== Tooltip ==================== */

  function hideTooltip() {
    var tip = document.querySelector('#diagram-tooltip');
    if (tip) tip.style.display = 'none';
  }

  /* ==================== Read Marks ==================== */

  function markAsRead(moduleId, docId) {
    try {
      var key = 'docsite-read';
      var read = JSON.parse(localStorage.getItem(key) || '{}');
      if (!read[moduleId]) read[moduleId] = [];
      if (read[moduleId].indexOf(docId) < 0) read[moduleId].push(docId);
      localStorage.setItem(key, JSON.stringify(read));
    } catch (e) { /* ignore */ }
  }

  /* ==================== Mobile Sidebar ==================== */

  function initMobileSidebar() {
    if (dom.sidebarToggle) {
      dom.sidebarToggle.addEventListener('click', function () {
        dom.sidebar.classList.toggle('open');
        dom.sidebarOverlay.classList.toggle('active');
      });
    }
    if (dom.sidebarOverlay) {
      dom.sidebarOverlay.addEventListener('click', function () {
        dom.sidebar.classList.remove('open');
        dom.sidebarOverlay.classList.remove('active');
      });
    }
  }

  /* ==================== Init ==================== */

  function init() {
    cacheDom();
    initDarkMode();
    initMobileSidebar();

    Promise.all([
      loadJSON('data/modules.json'),
      loadJSON('data/search-index.json'),
    ]).then(function (results) {
      MODULES = results[0];
      SEARCH_INDEX = results[1];

      if (SEARCH_INDEX && window.__vendorStatus && window.__vendorStatus.fuse && typeof Fuse !== 'undefined') {
        fuseInstance = new Fuse(SEARCH_INDEX, {
          keys: ['title', 'body', 'keywords'],
          threshold: 0.4,
          includeScore: true,
        });
      }

      buildSidebar();
      initSearch();
      initReadingPath();
      navigate();
      window.addEventListener('hashchange', navigate);
    });
  }

  /* Boot */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

## Key Patterns

### Visualization Registry
Modules with custom vis define a global `renderVis{ID}` function in their `vis-{id}.js` file. The registry uses `typeof` check:
```javascript
function getModuleVis(id) {
  var fnName = 'renderVis' + id;
  if (typeof window[fnName] === 'function') return window[fnName];
  return null;
}
```

### Dual-Mode Data Loading
- **file:// mode**: Build script generates `data/all-docs.js` which sets `window.DOCS_DATA`, `window.MODULES_DATA`, `window.SEARCH_INDEX_DATA`
- **HTTP mode**: Falls back to `fetch()` for JSON files and HTML fragments

### Navigation Cleanup
Always call `hideTooltip()` at the start of `navigate()` to prevent stale popovers.
