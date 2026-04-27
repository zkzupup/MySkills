# Template: build_site.py (Python Build Script)

Skeleton build script that scans a documentation directory tree, converts
markdown files to HTML fragments, and produces the JSON/JS data files
consumed by the SPA shell (`index.html` + `app.js`).

## Prerequisites

```
pip install markdown
```

## Outputs

| File | Purpose |
|---|---|
| `data/modules.json` | Module tree with docs, metadata, diagrams |
| `data/search-index.json` | Fuse.js-compatible search entries |
| `data/all-docs.js` | Inlined JS bundle for `file://` mode |
| `data/docs/{moduleId}/{docId}.html` | Per-document HTML fragments |
| `site/images/` | Copied image assets |

---

## Template

```python
#!/usr/bin/env python3
"""
build_site.py -- Documentation Static Site Generator

Converts a markdown documentation tree into a self-contained static site
with search index and inline JS bundle for file:// support.

Usage:
    python build_site.py [DOC_ROOT]

    DOC_ROOT defaults to the parent of this script's directory.

Requirements:
    pip install markdown
"""

import json
import os
import re
import shutil
import sys
from pathlib import Path

try:
    import markdown
    from markdown.extensions.toc import TocExtension
except ImportError:
    print("ERROR: 'markdown' package required.  pip install markdown")
    sys.exit(1)

# =========================================================================
# Configuration  /* ADAPT */
# =========================================================================

# Display name used in log output
PROJECT_NAME = "MyProject"

# /* ADAPT: Directory naming pattern.
#    Structural modules: "010-ModuleName", "020-AnotherModule"
#    Feature modules:    "F01-FeatureName", "F02-AnotherFeature"
#    Change these regexes if your project uses a different convention. */
MODULE_PATTERN_STRUCTURAL = re.compile(r'^(\d{3})-(.+)$')
MODULE_PATTERN_FEATURE    = re.compile(r'^(F\d{2})-(.+)$')

# /* ADAPT: Document ID extraction from filenames.
#    e.g. "011_Bootstrap_Analysis.md" -> "011"
#         "F01_AI_System.md"         -> "F01" */
RE_DOC_ID = re.compile(r'^(\d{3}|F\d{2,3})_')

# /* ADAPT: Module grouping logic.
#    Map group keys to (regex, sidebar_ul_id) pairs.
#    The order here determines sidebar rendering order. */
MODULE_GROUPS = {
    "structural": (MODULE_PATTERN_STRUCTURAL, "sidebar-structure"),
    "features":   (MODULE_PATTERN_FEATURE,    "sidebar-features"),
}

# /* ADAPT: Hardcoded metadata for modules that cannot be auto-detected.
#    Keys are module IDs; values are dicts with name, priority, layer, etc.
#    Remove or extend as needed. */
MODULE_META = {
    # "010": {"name": "Core Framework", "priority": "P0", "layer": "Core"},
    # "F01": {"name": "AI System",      "priority": "P0", "layer": "Feature"},
}

# /* ADAPT: Image directories to copy.
#    Maps module IDs to subdirectory names under IMAGES_SRC. */
IMAGE_MAP = {
    # "010": ["diagrams/CoreFramework"],
}

# =========================================================================
# Paths
# =========================================================================

SCRIPT_DIR = Path(__file__).resolve().parent
SITE_DIR   = SCRIPT_DIR.parent if SCRIPT_DIR.name == "build" else SCRIPT_DIR
DOC_ROOT   = Path(sys.argv[1]) if len(sys.argv) > 1 else SITE_DIR.parent

IMAGES_SRC = DOC_ROOT / "diagrams"
IMAGES_DST = SITE_DIR / "images"
DATA_DIR   = SITE_DIR / "data"
DOCS_DIR   = DATA_DIR / "docs"

# =========================================================================
# Markdown converter
# =========================================================================

MD = markdown.Markdown(
    extensions=[
        "tables",
        "fenced_code",
        TocExtension(permalink=False, toc_depth="1-4"),
    ],
    output_format="html",
)

def reset_md():
    """Reset converter state between documents."""
    MD.reset()

# =========================================================================
# Extraction helpers
# =========================================================================

def extract_title(md_text: str) -> str:
    """Return text of the first '# ' heading, or a fallback."""
    for line in md_text.splitlines():
        s = line.strip()
        if s.startswith("# "):
            return s[2:].strip()
    return "(untitled)"


def extract_summary(md_text: str, max_len: int = 120) -> str:
    """Extract a short summary: first blockquote or first paragraph after title."""
    lines = md_text.splitlines()
    # Strategy 1: first blockquote
    for line in lines:
        s = line.strip()
        if s.startswith("> "):
            text = re.sub(r'\*\*([^*]+)\*\*', r'\1', s[2:].strip())
            text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
            if len(text) > 10:
                return text[:max_len] + ("..." if len(text) > max_len else "")
    # Strategy 2: first real paragraph after the title
    past_title = False
    for line in lines:
        s = line.strip()
        if s.startswith("# "):
            past_title = True
            continue
        if not past_title or not s:
            continue
        if s[0] in ("#", "|", "-", ">", "`") or s.startswith("<!--"):
            continue
        text = re.sub(r'\*\*([^*]+)\*\*', r'\1', s)
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
        if len(text) > 15:
            return text[:max_len] + ("..." if len(text) > max_len else "")
    return ""


def extract_keywords(md_text: str, max_keywords: int = 20) -> list:
    """Extract notable keywords for search indexing."""
    kw = set()
    # Code identifiers in backticks
    for m in re.finditer(r'`([A-Za-z_]\w{2,})`', md_text):
        kw.add(m.group(1))
    # Bold terms
    for m in re.finditer(r'\*\*([^*]{2,40})\*\*', md_text):
        kw.add(m.group(1).strip())
    # CamelCase identifiers
    for m in re.finditer(r'(?<!\w)([A-Z][a-z]+(?:[A-Z][a-z]+){1,})\b', md_text):
        kw.add(m.group(1))
    # /* ADAPT: Remove project-specific generic terms */
    generic = {"Analysis", "Module", "System", "Class", "File", "Table",
               "Source", "Notes", "Type", "Name", "Path"}
    kw -= generic
    return sorted(kw)[:max_keywords]

# =========================================================================
# Markdown -> HTML conversion
# =========================================================================

# /* ADAPT: Cross-doc link rewriting.
#    Adjusts relative markdown links to SPA hash routes.
#    e.g.  [label](../020-Engine/021_States.md) -> [label](#/doc/020/021) */
RE_CROSS_DOC_LINK = re.compile(
    r'\[([^\]]*)\]'
    r'\(\.\./(?:'
        r'(\d{3})-[^/]+/(\d{3}|\w+?)_[^)]+\.md'
    r'|'
        r'(F\d{2})-[^/]+/(F\d{2,3}|\w+?)_[^)]+\.md'
    r')\)'
)

RE_IMG_PATH = re.compile(r'(\.\./diagrams/)')

RE_MERMAID_BLOCK = re.compile(
    r'<pre><code class="language-mermaid">(.*?)</code></pre>',
    re.DOTALL,
)


def rewrite_links(md_text: str) -> str:
    """Rewrite relative cross-doc links to SPA hash routes."""
    def _sub(m):
        label = m.group(1)
        mod_id = m.group(2) or m.group(4)
        doc_id = m.group(3) or m.group(5)
        if mod_id and doc_id:
            return f'[{label}](#/doc/{mod_id}/{doc_id})'
        return m.group(0)
    return RE_CROSS_DOC_LINK.sub(_sub, md_text)


def rewrite_images(md_text: str) -> str:
    """Rewrite ../diagrams/X/Y.png to images/X/Y.png."""
    return RE_IMG_PATH.sub('images/', md_text)


def postprocess_mermaid(html: str) -> str:
    """Convert fenced mermaid blocks to <pre class="mermaid"> for client rendering."""
    def _sub(m):
        content = m.group(1).replace("&amp;", "&").replace("&quot;", '"')
        return f'<pre class="mermaid">{content}</pre>'
    return RE_MERMAID_BLOCK.sub(_sub, html)


def convert_md(md_path: Path) -> str:
    """Read markdown file, return processed HTML fragment."""
    md_text = md_path.read_text(encoding="utf-8")
    md_text = rewrite_links(md_text)
    md_text = rewrite_images(md_text)
    reset_md()
    html = MD.convert(md_text)
    html = postprocess_mermaid(html)
    return f'<div class="doc-content">{html}</div>'

# =========================================================================
# Module discovery
# =========================================================================

def discover_modules():
    """
    Scan DOC_ROOT for module directories.
    Returns a dict: { group_key: [module_record, ...] }
    """
    results = {key: [] for key in MODULE_GROUPS}

    for entry in sorted(DOC_ROOT.iterdir()):
        if not entry.is_dir():
            continue

        dirname = entry.name
        matched_group = None
        module_id = None
        name_en = None

        # /* ADAPT: Match against each group pattern */
        for group_key, (pattern, _) in MODULE_GROUPS.items():
            m = pattern.match(dirname)
            if m:
                matched_group = group_key
                module_id = m.group(1)
                name_en = m.group(2)
                break

        if not matched_group:
            continue

        meta = MODULE_META.get(module_id, {})

        # Discover markdown documents
        docs = []
        for fpath in sorted(entry.iterdir()):
            if not fpath.is_file() or not fpath.name.endswith(".md"):
                continue
            dm = RE_DOC_ID.match(fpath.name)
            doc_id = dm.group(1) if dm else fpath.stem
            try:
                file_text = fpath.read_text(encoding="utf-8")
                title = extract_title(file_text)
                summary = extract_summary(file_text)
            except Exception:
                title = fpath.stem
                summary = ""
            doc_entry = {"id": doc_id, "title": title, "file": fpath.name}
            if summary:
                doc_entry["summary"] = summary
            docs.append(doc_entry)

        # /* ADAPT: Metadata extraction - add fields relevant to your project */
        record = {
            "id": module_id,
            "name": meta.get("name", name_en),
            "nameEn": name_en,
            "priority": meta.get("priority", "P2"),
            "layer": meta.get("layer", "Unknown"),
            "docs": docs,
            "dirName": dirname,
        }
        results[matched_group].append(record)

    return results

# =========================================================================
# Build steps
# =========================================================================

def build_modules_json(groups: dict) -> dict:
    """Write data/modules.json."""
    outpath = DATA_DIR / "modules.json"
    outpath.parent.mkdir(parents=True, exist_ok=True)
    outpath.write_text(
        json.dumps(groups, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    total = sum(len(v) for v in groups.values())
    print(f"  [modules.json] {total} modules")
    return groups


def build_doc_html(groups: dict) -> dict:
    """Convert all markdown docs to HTML fragments. Returns {key: html}."""
    all_docs = {}
    total = 0
    for mod_list in groups.values():
        for mod in mod_list:
            mid = mod["id"]
            mod_dir = DOC_ROOT / mod["dirName"]
            out_dir = DOCS_DIR / mid
            out_dir.mkdir(parents=True, exist_ok=True)
            for doc in mod["docs"]:
                did = doc["id"]
                src = mod_dir / doc["file"]
                if not src.exists():
                    print(f"    WARNING: {src} not found, skipping")
                    continue
                html = convert_md(src)
                (out_dir / f"{did}.html").write_text(html, encoding="utf-8")
                all_docs[f"{mid}/{did}"] = html
                total += 1
                print(f"    {mid}/{did}")
    print(f"  [docs] {total} HTML fragments generated")
    return all_docs


def build_search_index(groups: dict):
    """Generate data/search-index.json for Fuse.js."""
    index = []
    for mod_list in groups.values():
        for mod in mod_list:
            mid = mod["id"]
            mod_dir = DOC_ROOT / mod["dirName"]
            for doc in mod["docs"]:
                src = mod_dir / doc["file"]
                if not src.exists():
                    continue
                md_text = src.read_text(encoding="utf-8")
                entry = {
                    "id": f"{mid}/{doc['id']}",
                    "title": doc["title"],
                    "module": mod["name"],
                    "keywords": extract_keywords(md_text),
                }
                summary = extract_summary(md_text)
                if summary:
                    entry["summary"] = summary
                index.append(entry)
    outpath = DATA_DIR / "search-index.json"
    outpath.write_text(
        json.dumps(index, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"  [search-index.json] {len(index)} entries")


def build_all_docs_js(all_docs: dict, modules_data: dict):
    """Write data/all-docs.js -- inlined JS bundle for file:// support."""
    outpath = DATA_DIR / "all-docs.js"
    parts = [
        f"window.MODULES_DATA = {json.dumps(modules_data, ensure_ascii=False)};",
    ]
    search_path = DATA_DIR / "search-index.json"
    if search_path.exists():
        parts.append(
            f"window.SEARCH_INDEX_DATA = {search_path.read_text(encoding='utf-8')};"
        )
    parts.append(
        f"window.DOCS_DATA = {json.dumps(all_docs, ensure_ascii=False)};"
    )
    outpath.write_text("\n".join(parts) + "\n", encoding="utf-8")
    size_kb = outpath.stat().st_size / 1024
    print(f"  [all-docs.js] {len(all_docs)} docs inlined, {size_kb:.0f} KB")


def copy_images():
    """Copy image assets from DOC_ROOT to site/images/."""
    if not IMAGES_SRC.is_dir():
        print("  [images] source directory not found, skipping")
        return
    total = 0
    for subdir in sorted(IMAGES_SRC.iterdir()):
        if not subdir.is_dir():
            continue
        dst_sub = IMAGES_DST / subdir.name
        dst_sub.mkdir(parents=True, exist_ok=True)
        for img in sorted(subdir.iterdir()):
            if img.suffix.lower() in (".png", ".jpg", ".jpeg", ".gif", ".svg"):
                shutil.copy2(img, dst_sub / img.name)
                total += 1
    print(f"  [images] {total} files copied")

# =========================================================================
# Main
# =========================================================================

def main():
    print("=" * 60)
    print(f"{PROJECT_NAME} Documentation Site Builder")
    print("=" * 60)
    print(f"  Document root : {DOC_ROOT}")
    print(f"  Site output   : {SITE_DIR}")
    print()

    if not DOC_ROOT.is_dir():
        print(f"ERROR: Document root not found: {DOC_ROOT}")
        sys.exit(1)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: Discover modules
    print("[1/5] Discovering modules...")
    groups = discover_modules()
    for key, mods in groups.items():
        print(f"  {key}: {len(mods)} modules")
    print()

    # Step 2: Generate modules.json
    print("[2/5] Generating modules.json...")
    modules_data = build_modules_json(groups)
    print()

    # Step 3: Convert markdown to HTML
    print("[3/5] Converting markdown to HTML...")
    all_docs = build_doc_html(groups)
    print()

    # Step 4: Generate search index
    print("[4/5] Generating search index...")
    build_search_index(groups)
    print()

    # Step 5: Build inline JS bundle + copy images
    print("[5/5] Building all-docs.js and copying images...")
    build_all_docs_js(all_docs, modules_data)
    copy_images()
    print()

    print("=" * 60)
    print("Build complete.")
    print("=" * 60)


if __name__ == "__main__":
    main()
```

## ADAPT Points Summary

All lines marked `/* ADAPT */` require project-specific changes:

1. **`PROJECT_NAME`** -- Display name for log output
2. **`MODULE_PATTERN_*`** -- Regex for directory naming convention (e.g. `NNN-Name` vs `mod_name`)
3. **`RE_DOC_ID`** -- How document IDs are extracted from filenames
4. **`MODULE_GROUPS`** -- Which groups exist and their sidebar UL element IDs
5. **`MODULE_META`** -- Hardcoded metadata for modules that can't be auto-detected
6. **`IMAGE_MAP`** -- Which image subdirectories belong to which modules
7. **`extract_keywords` generic set** -- Project-specific stopwords to exclude from search
8. **`RE_CROSS_DOC_LINK`** -- Cross-document link pattern if your paths differ
9. **`discover_modules` record fields** -- Add custom metadata fields per module
