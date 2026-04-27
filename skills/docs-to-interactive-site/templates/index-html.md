# Template: index.html (SPA Shell)

Generalized from the iGoal2 interactive documentation site.
Produces a single-page application shell that loads JSON data and renders
module documentation with interactive visualizations.

## Parameters

| Placeholder | Description | Default |
|---|---|---|
| `{{PROJECT_NAME}}` | Display name shown in topbar and `<title>` | (required) |
| `{{LANG}}` | HTML `lang` attribute | `zh-CN` |
| `{{SIDEBAR_GROUPS}}` | One or more sidebar group blocks (see below) | two groups: structural + features |

### Sidebar group format

Each group is a block like:

```html
<div class="sidebar-group">
  <div class="sidebar-group-title">Group Label</div>
  <ul id="sidebar-{groupKey}" class="sidebar-tree"></ul>
</div>
```

The `id` on the `<ul>` must match what `app.js` uses to populate the tree.

---

## Template

```html
<!DOCTYPE html>
<html lang="{{LANG}}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PROJECT_NAME}} Documentation</title>
  <link rel="stylesheet" href="css/style.css">
  <!-- Preconnect for faster font loading -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
</head>
<body>

  <!-- ==================== Top Bar ==================== -->
  <header id="topbar">
    <div class="topbar-left">
      <button id="sidebar-toggle" class="mobile-only" aria-label="Toggle sidebar">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
      <a href="#/" class="topbar-brand">
        <svg class="brand-icon" width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="12" stroke="currentColor" stroke-width="2"/>
          <circle cx="14" cy="14" r="4" fill="currentColor"/>
          <path d="M14 2v6M14 20v6M2 14h6M20 14h6"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <h1>{{PROJECT_NAME}}</h1>
      </a>
    </div>
    <div class="topbar-right">
      <div id="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M11 11l3.5 3.5" stroke="currentColor"
                stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input id="search-input" type="text"
               placeholder="Search docs..." autocomplete="off" />
        <kbd class="search-shortcut">Ctrl+K</kbd>
      </div>
      <button id="dark-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">
        <span class="icon-light">&#127769;</span>
        <span class="icon-dark">&#9728;&#65039;</span>
      </button>
    </div>
  </header>

  <!-- ==================== Sidebar Overlay (mobile) ==================== -->
  <div id="sidebar-overlay" class="sidebar-overlay"></div>

  <!-- ==================== Main Layout ==================== -->
  <div id="layout">

    <!-- Left Sidebar: Module Tree Navigation -->
    <aside id="sidebar">
      <nav id="sidebar-nav" aria-label="Module navigation">
        {{SIDEBAR_GROUPS}}
        <!--
          Default (two-group) example:

          <div class="sidebar-group">
            <div class="sidebar-group-title">Structural Modules</div>
            <ul id="sidebar-structure" class="sidebar-tree"></ul>
          </div>
          <div class="sidebar-group">
            <div class="sidebar-group-title">Features</div>
            <ul id="sidebar-features" class="sidebar-tree"></ul>
          </div>
        -->
      </nav>
    </aside>

    <!-- Main Content Area -->
    <main id="content">
      <!-- Breadcrumb -->
      <nav id="breadcrumb" aria-label="Breadcrumb"></nav>
      <!-- Dynamic content injected here by app.js -->
      <div id="content-body">
        <div class="loading-placeholder">
          <div class="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    </main>

    <!-- Right-side Table of Contents -->
    <aside id="toc-panel">
      <div class="toc-header">Contents</div>
      <nav id="toc-nav" aria-label="Page table of contents">
        <ul id="toc-list"></ul>
      </nav>
    </aside>

  </div>

  <!-- ==================== Reading Path Navigation (floating) ==================== -->
  <div id="reading-path" style="display:none">
    <div class="reading-path-inner">
      <button id="prev-doc" aria-label="Previous" disabled>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Prev</span>
      </button>
      <span id="reading-progress" class="reading-progress">1 / 8</span>
      <button id="next-doc" aria-label="Next">
        <span>Next</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- ==================== Search Results Overlay ==================== -->
  <div id="search-results" style="display:none">
    <div class="search-results-header">
      <span class="search-results-title">Search Results</span>
      <button id="search-close" aria-label="Close search">&times;</button>
    </div>
    <div id="search-results-list"></div>
    <div id="search-empty" style="display:none">
      <p>No matching documents found</p>
    </div>
  </div>

  <!-- ==================== Tooltip Container ==================== -->
  <div id="diagram-tooltip" class="diagram-tooltip" style="display:none"></div>

  <!-- ==================== Scripts ==================== -->

  <!-- Vendor libraries (loaded with fallback handling) -->
  <script>
    // Track which vendor libs loaded successfully.
    // Visualizations should check these flags before using a library.
    window.__vendorStatus = { rough: false, mermaid: false, fuse: false };
  </script>

  <!-- rough.js  - hand-drawn SVG rendering (optional, diagrams degrade to static) -->
  <script src="js/vendor/rough.min.js"
    onload="window.__vendorStatus.rough=true"
    onerror="console.warn('[{{PROJECT_NAME}}] rough.js not loaded - diagrams will use static fallback')">
  </script>
  <!-- mermaid.js - renders ```mermaid code blocks (optional, falls back to <pre>) -->
  <script src="js/vendor/mermaid.min.js"
    onload="window.__vendorStatus.mermaid=true"
    onerror="console.warn('[{{PROJECT_NAME}}] mermaid.js not loaded - mermaid diagrams will show as code blocks')">
  </script>
  <!-- fuse.js - fuzzy search (optional, falls back to basic string matching) -->
  <script src="js/vendor/fuse.min.js"
    onload="window.__vendorStatus.fuse=true"
    onerror="console.warn('[{{PROJECT_NAME}}] fuse.js not loaded - search will use basic string matching')">
  </script>

  <!-- Inline doc data for file:// mode (generated by build_site.py) -->
  <!-- Sets window.MODULES_DATA, window.SEARCH_INDEX_DATA, window.DOCS_DATA -->
  <script src="data/all-docs.js"
    onerror="console.warn('[{{PROJECT_NAME}}] all-docs.js not found - will try fetch mode')">
  </script>

  <!-- Application scripts (order matters) -->
  <script src="js/diagram.js"></script>       <!-- Mermaid init + diagram helpers -->
  <script src="js/vis-shared.js"></script>     <!-- VisShared: SVG, layout, color utilities -->

  <!-- ADAPT: Add vis-{id}.js scripts here.
       One <script> per module that has a custom visualization.
       Each file defines a global renderVis{ID}(container, mod) function.
       Example:
         <script src="js/modules/vis-010.js"></script>
         <script src="js/modules/vis-020.js"></script>
         <script src="js/modules/vis-F01.js"></script>
  -->

  <!-- Main app (must be last - reads the vis registry, boots the SPA router) -->
  <script src="js/app.js"></script>

</body>
</html>
```

## Checklist after instantiation

- [ ] Replace all `{{PROJECT_NAME}}` occurrences (title, topbar, error messages)
- [ ] Set `{{LANG}}` to the correct BCP-47 tag (e.g. `en`, `zh-CN`, `ja`)
- [ ] Fill in `{{SIDEBAR_GROUPS}}` with the correct group `<ul>` IDs that `app.js` references
- [ ] Add one `<script src="js/modules/vis-{id}.js">` tag per module visualization
- [ ] Verify vendor JS files exist under `js/vendor/` or remove unused script tags
- [ ] Adjust `data/all-docs.js` path if the build script outputs elsewhere
