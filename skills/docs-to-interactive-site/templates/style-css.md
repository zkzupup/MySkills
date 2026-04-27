# style.css — Complete SPA Stylesheet

Copy to `css/style.css`. Replace `{{PROJECT_NAME}}` if it appears in comments.

## Adaptation Points

- `:root` font families — change for non-CJK projects
- Layer color variables — customize per project's module categories
- Priority badge colors — adjust if using different priority scheme

## Full CSS

```css
/* ===== CSS Variables (Light/Dark) ===== */
:root {
  --bg: #ffffff;
  --bg-secondary: #f6f8fa;
  --bg-tertiary: #eef1f5;
  --text: #1a1a2e;
  --text-secondary: #4a5568;
  --text-muted: #8899aa;
  --border: #e2e8f0;
  --border-light: #edf2f7;
  --accent: #3b82f6;
  --accent-hover: #2563eb;
  --accent-bg: #eff6ff;
  --shadow: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-lg: 0 4px 12px rgba(0,0,0,0.1);
  --radius: 8px;
  --sidebar-w: 270px;
  --toc-w: 220px;
  --topbar-h: 56px;
  /* ADAPT: font families */
  --font-sans: "PingFang SC","Microsoft YaHei","Noto Sans SC",system-ui,sans-serif;
  --font-mono: "JetBrains Mono","Fira Code","Cascadia Code",Consolas,monospace;
  /* ADAPT: layer colors for module categories */
  --layer-foundation: #eebefa;
  --layer-core: #ffec99;
  --layer-feature: #b2f2bb;
  --layer-peripheral: #ffc9c9;
  --layer-bridge: #a5d8ff;
  --p0: #ef4444;
  --p1: #f59e0b;
  --p2: #9ca3af;
}

body.dark {
  --bg: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #293548;
  --text: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border: #334155;
  --border-light: #1e293b;
  --accent: #60a5fa;
  --accent-hover: #93bbfc;
  --accent-bg: #1e3a5f;
  --shadow: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-lg: 0 4px 12px rgba(0,0,0,0.4);
  --layer-foundation: #7c3aed33;
  --layer-core: #ca8a0433;
  --layer-feature: #16a34a33;
  --layer-peripheral: #ef444433;
  --layer-bridge: #3b82f633;
}

/* ===== Reset ===== */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:15px;scroll-behavior:smooth}
body{font-family:var(--font-sans);color:var(--text);background:var(--bg);line-height:1.7;overflow-x:hidden}
a{color:var(--accent);text-decoration:none}
a:hover{color:var(--accent-hover);text-decoration:underline}
img{max-width:100%;height:auto;display:block}
ul,ol{list-style:none}
button{cursor:pointer;border:none;background:none;font:inherit;color:inherit}
input{font:inherit;color:inherit}
code{font-family:var(--font-mono);font-size:0.9em}

/* ===== Topbar ===== */
#topbar{
  position:fixed;top:0;left:0;right:0;z-index:100;
  height:var(--topbar-h);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 20px;
  background:var(--bg);border-bottom:1px solid var(--border);
  backdrop-filter:blur(8px);
}
.topbar-left{display:flex;align-items:center;gap:12px}
.topbar-brand{display:flex;align-items:center;gap:10px;color:var(--text);text-decoration:none}
.topbar-brand:hover{text-decoration:none;color:var(--text)}
.topbar-brand h1{font-size:1.1rem;font-weight:700;white-space:nowrap}
.brand-icon{flex-shrink:0;color:var(--accent)}
.topbar-right{display:flex;align-items:center;gap:12px}

/* Search Box */
#search-box{
  position:relative;display:flex;align-items:center;
  background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius);
  padding:6px 12px;width:280px;transition:border-color .2s;
}
#search-box:focus-within{border-color:var(--accent)}
.search-icon{flex-shrink:0;color:var(--text-muted);margin-right:8px}
#search-input{border:none;background:none;outline:none;width:100%;font-size:0.9rem}
.search-shortcut{
  font-family:var(--font-mono);font-size:0.7rem;
  padding:2px 6px;border-radius:4px;
  background:var(--bg-tertiary);color:var(--text-muted);border:1px solid var(--border);
  flex-shrink:0;
}

/* Dark Mode Toggle */
#dark-toggle{
  width:36px;height:36px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:1.1rem;transition:background .2s;
}
#dark-toggle:hover{background:var(--bg-secondary)}
.icon-dark{display:none}
body.dark .icon-light{display:none}
body.dark .icon-dark{display:inline}
.mobile-only{display:none}

/* ===== Layout ===== */
#layout{
  display:grid;
  grid-template-columns:var(--sidebar-w) 1fr var(--toc-w);
  margin-top:var(--topbar-h);
  min-height:calc(100vh - var(--topbar-h));
}

/* ===== Sidebar ===== */
#sidebar{
  position:sticky;top:var(--topbar-h);
  height:calc(100vh - var(--topbar-h));
  overflow-y:auto;overflow-x:hidden;
  border-right:1px solid var(--border);
  background:var(--bg-secondary);
  padding:16px 0;scrollbar-width:thin;
}
.sidebar-group{margin-bottom:8px}
.sidebar-group-title{
  padding:8px 20px 6px;font-size:0.75rem;font-weight:700;
  text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);
}
.sidebar-tree .module-item{
  display:flex;align-items:center;gap:6px;
  padding:7px 20px;cursor:pointer;
  font-size:0.88rem;color:var(--text-secondary);
  border-left:3px solid transparent;transition:all .15s;
}
.sidebar-tree .module-item:hover{background:var(--bg-tertiary);color:var(--text)}
.sidebar-tree .module-item.active{
  background:var(--accent-bg);color:var(--accent);
  border-left-color:var(--accent);font-weight:600;
}
.sidebar-tree .module-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* Badges */
.badge{font-size:0.65rem;padding:1px 5px;border-radius:3px;font-weight:700;flex-shrink:0;line-height:1.4}
.badge-p0{background:var(--p0);color:#fff}
.badge-p1{background:var(--p1);color:#fff}
.badge-p2{background:var(--p2);color:#fff}
.badge-layer{font-size:0.6rem;padding:1px 4px;border-radius:3px;font-weight:600}
.badge-layer-Foundation{background:var(--layer-foundation);color:#5b21b6}
.badge-layer-Core{background:var(--layer-core);color:#92400e}
.badge-layer-Feature{background:var(--layer-feature);color:#166534}
.badge-layer-Peripheral{background:var(--layer-peripheral);color:#991b1b}
body.dark .badge-layer-Foundation{color:#c4b5fd}
body.dark .badge-layer-Core{color:#fcd34d}
body.dark .badge-layer-Feature{color:#86efac}
body.dark .badge-layer-Peripheral{color:#fca5a5}

/* Sidebar doc list */
.sidebar-doc-list{overflow:hidden;max-height:0;transition:max-height .3s ease}
.sidebar-doc-list.open{max-height:500px}
.sidebar-doc-list a{
  display:block;padding:5px 20px 5px 48px;
  font-size:0.82rem;color:var(--text-muted);
  border-left:3px solid transparent;transition:all .15s;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.sidebar-doc-list a:hover{background:var(--bg-tertiary);color:var(--text);text-decoration:none}
.sidebar-doc-list a.active{color:var(--accent);font-weight:600;border-left-color:var(--accent)}

/* ===== Content ===== */
#content{padding:20px 36px 60px;min-width:0}
#breadcrumb{font-size:0.82rem;color:var(--text-muted);margin-bottom:16px;display:flex;flex-wrap:wrap;align-items:center;gap:4px}
#content-body{max-width:900px}
.loading-placeholder{display:flex;flex-direction:column;align-items:center;padding:80px 0;color:var(--text-muted)}
.loading-spinner{
  width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent);
  border-radius:50%;animation:spin .8s linear infinite;margin-bottom:12px;
}
@keyframes spin{to{transform:rotate(360deg)}}

/* ===== Typography ===== */
#content-body h1{font-size:1.8rem;margin:0 0 16px;padding-bottom:10px;border-bottom:2px solid var(--border)}
#content-body h2{font-size:1.4rem;margin:32px 0 12px;padding-bottom:6px;border-bottom:1px solid var(--border-light)}
#content-body h3{font-size:1.15rem;margin:24px 0 8px}
#content-body p{margin:8px 0}
#content-body ul,#content-body ol{padding-left:1.5em;margin:8px 0}
#content-body ul{list-style:disc}
#content-body ol{list-style:decimal}
#content-body blockquote{
  border-left:4px solid var(--accent);padding:8px 16px;margin:12px 0;
  background:var(--bg-secondary);border-radius:0 var(--radius) var(--radius) 0;color:var(--text-secondary);
}
#content-body table{width:100%;border-collapse:collapse;margin:12px 0;font-size:0.88rem;display:block;overflow-x:auto}
#content-body th,#content-body td{padding:8px 12px;border:1px solid var(--border);text-align:left}
#content-body th{background:var(--bg-secondary);font-weight:700;white-space:nowrap}
#content-body code{background:var(--bg-secondary);padding:2px 6px;border-radius:4px;font-size:0.85em;color:var(--accent)}
#content-body pre{background:#1e293b;color:#e2e8f0;padding:16px 20px;border-radius:var(--radius);overflow-x:auto;margin:12px 0;line-height:1.5}
#content-body pre code{background:none;padding:0;color:inherit;font-size:0.85rem}
#content-body pre.mermaid{background:var(--bg);color:var(--text);text-align:center;padding:20px;border:1px solid var(--border)}

/* ===== TOC Panel ===== */
#toc-panel{
  position:sticky;top:var(--topbar-h);height:calc(100vh - var(--topbar-h));
  overflow-y:auto;padding:16px 12px;border-left:1px solid var(--border);scrollbar-width:thin;
}
.toc-header{font-size:0.75rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px}
#toc-list a{display:block;padding:4px 8px;font-size:0.8rem;color:var(--text-muted);border-left:2px solid transparent;transition:all .15s}
#toc-list a:hover{color:var(--text);text-decoration:none}
#toc-list a.active{color:var(--accent);border-left-color:var(--accent)}

/* ===== Homepage ===== */
.home-hero{text-align:center;padding:12px 0 16px}
.home-hero h2{font-size:1.5rem;font-weight:800;margin-bottom:4px}
.home-hero p{color:var(--text-secondary);font-size:0.95rem}
.home-intro-card{margin:0 0 20px;padding:20px 24px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg-secondary)}
.intro-highlights{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.highlight-card{padding:14px 12px;border-radius:var(--radius);background:var(--bg);border:1px solid var(--border);text-align:center;transition:box-shadow .2s}
.highlight-card:hover{box-shadow:var(--shadow-lg)}
.highlight-title{font-size:0.85rem;font-weight:700;margin-bottom:4px}
.highlight-desc{font-size:0.75rem;color:var(--text-muted);line-height:1.5}
.scenario-links{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.scenario-card{
  display:flex;align-items:center;gap:10px;padding:14px 16px;border-radius:var(--radius);
  background:var(--bg-secondary);border:1px solid var(--border);cursor:pointer;transition:all .15s;text-decoration:none;
}
.scenario-card:hover{border-color:var(--accent);box-shadow:var(--shadow);text-decoration:none}
.reading-path-selector{display:flex;gap:8px;margin-bottom:12px}
.path-select-btn{
  padding:6px 14px;border-radius:999px;font-size:0.82rem;font-weight:600;
  background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-secondary);cursor:pointer;transition:all .15s;
}
.path-select-btn.active{background:var(--accent);color:#fff;border-color:var(--accent)}

/* ===== Module Page ===== */
.module-header{margin-bottom:20px}
.module-header h2{font-size:1.6rem;font-weight:800;margin-bottom:8px}
.module-meta{display:flex;gap:6px;flex-wrap:wrap}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin:12px 0}
.stat-card{padding:14px;border-radius:var(--radius);background:var(--bg-secondary);border:1px solid var(--border);text-align:center}
.stat-value{font-size:1.4rem;font-weight:800;color:var(--accent)}
.stat-label{font-size:0.78rem;color:var(--text-muted);margin-top:2px}

/* ===== Visualization Components ===== */
.vis-section{margin:20px 0}
.vis-svg-wrapper{position:relative;margin:16px 0}
.vis-zoom-btn{
  position:absolute;top:8px;right:8px;
  width:32px;height:32px;border-radius:50%;
  background:var(--bg-secondary);border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
  opacity:0;transition:opacity .2s,background .2s;cursor:pointer;z-index:5;
}
.vis-svg-wrapper:hover .vis-zoom-btn{opacity:1}
.vis-zoom-btn:hover{background:var(--accent);color:#fff;border-color:var(--accent)}

/* Detail Panel */
.vis-detail-panel{
  margin:12px 0;padding:14px 18px;
  border:1px solid var(--border);border-radius:var(--radius);
  background:var(--bg-secondary);animation:fadeInUp .15s ease;
}
.vis-detail-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.vis-detail-title{font-weight:700;font-size:1rem}
.vis-detail-close{font-size:1.2rem;color:var(--text-muted);cursor:pointer}
.vis-detail-body{font-size:0.88rem;color:var(--text-secondary);line-height:1.7}
.vis-detail-body table{width:100%;margin:8px 0;border-collapse:collapse;font-size:0.85rem}
.vis-detail-body th,.vis-detail-body td{padding:6px 10px;border:1px solid var(--border);text-align:left}
.vis-detail-body th{background:var(--bg-tertiary);font-weight:700;white-space:nowrap;width:120px}

/* Toolbar */
.vis-toolbar{display:flex;gap:6px;align-items:center;margin:12px 0;flex-wrap:wrap}
.vis-btn{
  padding:6px 14px;border-radius:6px;font-size:0.82rem;font-weight:600;
  background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-secondary);
  cursor:pointer;transition:all .15s;
}
.vis-btn:hover{border-color:var(--accent);color:var(--accent)}
.vis-btn:active{transform:scale(0.97)}
.vis-btn.active{background:var(--accent-bg);color:var(--accent);border-color:var(--accent)}
.vis-btn-primary{background:var(--accent);color:#fff;border-color:var(--accent)}
.vis-btn-primary:hover{background:var(--accent-hover);color:#fff}
.vis-btn-primary:active{transform:scale(0.97)}
.vis-toolbar-sep{width:1px;height:20px;background:var(--border);margin:0 4px}

/* Lightbox */
.vis-svg-lightbox{
  position:fixed;inset:0;z-index:1000;
  background:rgba(0,0,0,0.85);
  display:flex;flex-direction:column;
}
.vis-lightbox-toolbar{
  display:flex;align-items:center;gap:8px;padding:10px 16px;
  background:rgba(30,41,59,0.95);border-bottom:1px solid #334155;flex-shrink:0;
}
.vis-lb-btn{
  padding:6px 12px;border-radius:6px;font-size:0.9rem;font-weight:600;
  background:#334155;color:#e2e8f0;border:1px solid #475569;cursor:pointer;transition:background .15s;
}
.vis-lb-btn:hover{background:#475569}
.vis-lb-close{margin-left:auto;font-size:1.2rem}
.vis-lb-scale{font-size:0.8rem;color:#94a3b8;min-width:48px;text-align:center}
.vis-lightbox-viewport{
  flex:1;overflow:hidden;display:flex;align-items:center;justify-content:center;
}

/* Doc Footer */
.vis-doc-footer{margin:24px 0 0;padding:16px 0 0;border-top:1px solid var(--border)}
.vis-doc-footer h3{font-size:1rem;margin-bottom:10px}
.doc-list-item{
  display:block;padding:8px 12px;margin:4px 0;
  border:1px solid var(--border);border-radius:var(--radius);
  font-size:0.88rem;color:var(--text-secondary);transition:all .15s;
}
.doc-list-item:hover{border-color:var(--accent);color:var(--accent);text-decoration:none}
.doc-id{font-family:var(--font-mono);font-size:0.78rem;color:var(--text-muted);margin-right:8px}

/* Viz Legend */
.viz-legend{display:flex;gap:14px;flex-wrap:wrap;margin:8px 0;font-size:0.8rem;color:var(--text-muted)}
.viz-legend-item{display:flex;align-items:center;gap:4px}
.viz-legend-swatch{width:14px;height:14px;border-radius:3px;border:1px solid var(--border);flex-shrink:0}

/* Sequence View */
.viz-sequence{margin:16px 0}
.viz-sequence-nav{display:flex;gap:6px;align-items:center;margin-bottom:10px}
.viz-seq-progress{font-size:0.8rem;color:var(--text-muted);margin-left:8px}
.viz-sequence-step{
  display:flex;gap:10px;padding:10px 12px;
  border-left:3px solid var(--border);margin-left:12px;
  opacity:0.5;transition:all .3s;
}
.viz-sequence-step.active{opacity:1;border-left-color:var(--accent);background:var(--accent-bg);border-radius:0 var(--radius) var(--radius) 0}
.viz-seq-num{
  width:24px;height:24px;border-radius:50%;
  background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;
  font-size:0.75rem;font-weight:700;flex-shrink:0;
}
.viz-sequence-step.active .viz-seq-num{background:var(--accent);color:#fff}

/* Mermaid zoom wrapper */
.mermaid-zoom-wrapper{position:relative;margin:12px 0}

/* Search Results */
#search-results{
  position:fixed;top:var(--topbar-h);left:50%;transform:translateX(-50%);
  width:560px;max-height:70vh;overflow-y:auto;z-index:200;
  background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);
  box-shadow:var(--shadow-lg);
}
.search-results-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border)}

/* Reading Path */
#reading-path{
  position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:90;
}
.reading-path-inner{
  display:flex;align-items:center;gap:12px;
  padding:8px 16px;border-radius:999px;
  background:var(--bg);border:1px solid var(--border);box-shadow:var(--shadow-lg);
}

/* Tooltip */
.diagram-tooltip{
  position:fixed;z-index:200;
  max-width:320px;padding:10px 14px;
  background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);
  box-shadow:var(--shadow-lg);font-size:0.85rem;
  pointer-events:none;
}

/* ===== Responsive ===== */
@media(max-width:1100px){
  #layout{grid-template-columns:var(--sidebar-w) 1fr}
  #toc-panel{display:none}
}
@media(max-width:768px){
  #layout{grid-template-columns:1fr}
  #sidebar{
    position:fixed;left:calc(-1 * var(--sidebar-w));top:var(--topbar-h);
    height:calc(100vh - var(--topbar-h));z-index:90;transition:left .3s;
  }
  #sidebar.open{left:0}
  .sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:89;display:none}
  .sidebar-overlay.active{display:block}
  .mobile-only{display:flex}
  #content{padding:16px 20px 60px}
  .intro-highlights{grid-template-columns:repeat(2,1fr)}
  .scenario-links{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:480px){
  .intro-highlights{grid-template-columns:1fr}
  .scenario-links{grid-template-columns:1fr}
  #search-box{width:200px}
}

@keyframes fadeInUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}

/* ===== Homepage Diagram Tabs ===== */
.home-diagram-tabs{display:flex;gap:8px;justify-content:center;margin:16px 0 4px}
#diagram-container{margin:8px auto;max-width:960px;min-height:300px;display:flex;align-items:center;justify-content:center;flex-direction:column}

/* ===== Slide-in Detail Sidebar ===== */
.vis-detail-sidebar{
  position:fixed;top:var(--topbar-h);right:0;bottom:0;width:380px;max-width:90vw;
  background:var(--bg);border-left:1px solid var(--border);
  box-shadow:-4px 0 20px rgba(0,0,0,0.1);z-index:80;
  transform:translateX(100%);transition:transform .25s ease;
  display:flex;flex-direction:column;overflow:hidden;
}
.vis-detail-sidebar.open{transform:translateX(0)}
.vis-ds-header{display:flex;justify-content:space-between;align-items:center;padding:8px 14px;background:var(--bg-tertiary);border-bottom:1px solid var(--border);flex-shrink:0}
.vis-ds-close{width:28px;height:28px;font-size:1.2rem;display:flex;align-items:center;justify-content:center;border-radius:50%;cursor:pointer}
.vis-ds-close:hover{background:var(--bg-secondary)}
.vis-ds-title-bar{padding:12px 16px 8px;flex-shrink:0}
.vis-ds-title{font-weight:700;font-size:1.05rem}
.vis-ds-body{flex:1;overflow-y:auto;padding:0 16px 16px;font-size:0.88rem;line-height:1.7}
.vis-ds-body table{width:100%;border-collapse:collapse;margin:8px 0;font-size:0.85rem;display:table!important}
.vis-ds-body th,.vis-ds-body td{padding:6px 10px;border:1px solid var(--border);text-align:left}
.vis-ds-body th{background:var(--bg-tertiary);font-weight:700}
.vis-ds-body code{background:var(--bg-tertiary);padding:1px 5px;border-radius:3px;font-size:0.83em;color:var(--accent)}
.vis-ds-footer{padding:12px 16px;border-top:1px solid var(--border);flex-shrink:0}
@media(max-width:768px){.vis-detail-sidebar{width:100%;max-width:100%}}

/* ===== SVG Interactive Nodes ===== */
.vis-node-hover{cursor:pointer;transition:transform .1s ease}
.vis-node-hover:hover{filter:brightness(1.1);transform:scale(1.02)}
.vis-active-state{animation:activePulse 1.5s ease infinite}
@keyframes activePulse{0%,100%{filter:drop-shadow(0 0 4px rgba(59,130,246,0.4))}50%{filter:drop-shadow(0 0 12px rgba(59,130,246,0.8))}}

/* State machine / Decision tree / Pipeline */
.state-normal{fill:#86efac}
.state-deadball{fill:#fde68a}
.state-setup{fill:#93c5fd}
.state-end{fill:#fca5a5}
.dt-node{cursor:pointer;transition:all .15s}
.dt-node:hover{filter:brightness(1.05)}
.dt-trace{stroke:#f59e0b;stroke-width:3;stroke-dasharray:8 4;animation:traceDash 0.5s linear infinite}
@keyframes traceDash{to{stroke-dashoffset:-12}}
.pipeline-track{opacity:0.85;transition:opacity .15s}
.pipeline-track:hover{opacity:1}

/* ===== Vis Section & Two-Col ===== */
.vis-section{margin:24px 0}
.vis-section h3{font-size:1.1rem;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid var(--border-light)}
.vis-two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px}
@media(max-width:900px){.vis-two-col{grid-template-columns:1fr}}

/* ===== Comparison Matrix ===== */
.vis-cmp-matrix{margin:16px 0}
.vis-cmp-title{font-size:1rem;margin-bottom:10px}
.vis-cmp-table{width:100%;border-collapse:collapse;font-size:0.85rem;display:table!important}
.vis-cmp-table th{padding:8px 12px;background:var(--bg-tertiary);font-weight:700;text-align:center;border:1px solid var(--border)}
.vis-cmp-table th:first-child{text-align:left}
.vis-cmp-table td{padding:7px 12px;text-align:center;border:1px solid var(--border)}
.vis-cmp-dim{font-weight:600;text-align:left;color:var(--text-secondary)}
.vis-cmp-yes{color:#16a34a;font-weight:700}
.vis-cmp-no{color:#dc2626;font-weight:700}
.vis-cmp-partial{color:#f59e0b;font-weight:700}

/* ===== Key Points Card ===== */
.vis-keypoints{margin:20px 0;padding:16px 18px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius)}
.vis-keypoints h3{font-size:1rem;margin:0 0 10px;padding-bottom:6px;border-bottom:1px solid var(--border-light)}
.vis-keypoints-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.vis-kp-item{display:flex;align-items:flex-start;gap:8px;font-size:0.88rem;line-height:1.6;color:var(--text-secondary)}
.vis-kp-hidden{display:none}
.vis-kp-icon{flex-shrink:0;font-size:0.7rem;margin-top:4px;color:var(--accent);width:16px;text-align:center}
.vis-kp-toggle{
  margin-top:10px;padding:4px 12px;border-radius:4px;font-size:0.8rem;font-weight:600;
  background:none;border:1px solid var(--border);color:var(--accent);cursor:pointer;transition:all .15s;
}
.vis-kp-toggle:hover{background:var(--accent-bg);border-color:var(--accent)}

/* ===== Story Walkthrough Cards ===== */
.story-walkthroughs{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}
.story-wt-card{border:1px solid var(--border);border-radius:var(--radius);background:var(--bg-secondary);overflow:hidden;transition:border-color .2s}
.story-wt-card:hover,.story-wt-card.open{border-color:var(--accent)}
.story-wt-header{display:flex;align-items:center;gap:10px;padding:14px 16px;cursor:pointer;transition:background .15s}
.story-wt-header:hover{background:var(--bg-tertiary)}
.story-wt-icon{font-size:1.3rem;flex-shrink:0}
.story-wt-q{flex:1;font-size:0.88rem;font-weight:600}
.story-wt-arrow{font-size:0.7rem;color:var(--text-muted);transition:transform .2s}
.story-wt-card.open .story-wt-arrow{transform:rotate(180deg)}
.story-wt-body{max-height:0;overflow:hidden;transition:max-height .35s ease}
.story-wt-card.open .story-wt-body{max-height:600px}
.story-wt-timeline{padding:0 16px 16px;display:flex;flex-direction:column}
.story-wt-step{display:flex;gap:12px;padding:10px 0;position:relative}
.story-wt-step:not(:last-child)::before{content:'';position:absolute;left:13px;top:36px;bottom:-2px;width:2px;background:var(--border)}
.story-wt-num{flex-shrink:0;width:28px;height:28px;border-radius:50%;background:var(--accent);color:#fff;font-size:0.75rem;font-weight:700;display:flex;align-items:center;justify-content:center;position:relative;z-index:1}
.story-wt-title{font-weight:700;font-size:0.86rem}
.story-wt-desc{font-size:0.8rem;color:var(--text-muted);line-height:1.5;margin-top:2px}
.story-wt-link{font-size:0.78rem;color:var(--accent);font-weight:600;margin-top:3px;display:inline-block}

/* ===== Module Mini Card ===== */
.vis-mod-card{display:flex;overflow:hidden;border-radius:var(--radius);border:1px solid var(--border);background:var(--bg-secondary);transition:box-shadow .2s;margin-bottom:20px}
.vis-mod-card:hover{box-shadow:var(--shadow-lg)}
.vis-mod-card-bar{width:6px;flex-shrink:0}
.vis-mod-card-body{padding:16px 20px;flex:1}
.vis-mod-card-header{display:flex;gap:6px;margin-bottom:8px}
.vis-mod-card-name{font-size:1.3rem;font-weight:800;margin:0 0 8px}
.vis-mod-card-stats{display:flex;gap:12px;font-size:0.82rem;color:var(--text-muted)}

/* ===== Animated Stats ===== */
.stats-animated .stat-card-anim{display:flex;flex-direction:column;align-items:center;gap:4px}

/* ===== Metrics Strip ===== */
.viz-metrics-strip{display:flex;flex-direction:column;gap:10px;max-width:480px}
.viz-metric-row{display:grid;grid-template-columns:120px 1fr 48px;gap:10px;align-items:center;font-size:0.86rem}
.viz-metric-bar{height:10px;background:var(--bg-tertiary);border-radius:5px;overflow:hidden}
.viz-metric-fill{height:100%;background:var(--accent);border-radius:5px;transition:width .3s ease}
.viz-metric-val{text-align:right;color:var(--text-muted)}

/* ===== Story Cards ===== */
.viz-story-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.viz-story-card{padding:16px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg-secondary)}
.viz-story-k{font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--accent);font-weight:700}
.viz-story-t{font-size:1rem;margin:6px 0 8px}
.viz-story-b{font-size:0.88rem;color:var(--text-secondary);line-height:1.6;margin:0}

/* ===== Dual Bridge ===== */
.viz-dual-bridge{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:start}
@media(max-width:720px){.viz-dual-bridge{grid-template-columns:1fr}}
.viz-dual-col{padding:12px;border-radius:var(--radius);border:1px solid var(--border);background:var(--bg-secondary)}
.viz-dual-mid{border-color:var(--accent);background:var(--accent-bg)}
.viz-dual-h{font-weight:700;font-size:0.9rem;margin-bottom:8px}
.viz-dual-ul{margin:0;padding-left:1.2em;font-size:0.86rem;color:var(--text-secondary);line-height:1.6}

/* ===== FSM Explorer ===== */
.viz-fsm{margin:12px 0}
.viz-fsm-title{font-size:1rem;margin-bottom:8px}
.viz-fsm-detail{margin-top:12px;padding:12px;background:var(--bg-secondary);border-radius:var(--radius);border:1px solid var(--border);min-height:48px;font-size:0.88rem}
.viz-fsm-hint{color:var(--text-muted);margin:0}

/* ===== Image Lightbox ===== */
.lightbox{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;cursor:zoom-out}
.lightbox img{max-width:95vw;max-height:95vh;border-radius:var(--radius)}

/* ===== Static Fallback Diagram ===== */
.static-diagram{background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius);padding:20px;max-width:800px;margin:0 auto}
.static-diagram .layer-row{display:flex;gap:8px;margin:6px 0;align-items:stretch}
.static-diagram .layer-label{width:80px;font-size:0.75rem;font-weight:700;display:flex;align-items:center;justify-content:center;border-radius:4px;text-align:center;padding:4px}
.static-diagram .layer-modules{display:flex;gap:6px;flex:1;flex-wrap:wrap}
.static-diagram .mod-box{flex:1;min-width:100px;padding:12px 8px;text-align:center;border-radius:6px;font-size:0.82rem;font-weight:600;border:2px solid rgba(0,0,0,0.1);cursor:pointer;transition:all .15s}
.static-diagram .mod-box:hover{transform:translateY(-2px);box-shadow:var(--shadow)}
```
