# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JavaScript personal portfolio website for Sebastian Gerken. No build system, no dependencies, no package manager - files are served directly.

## Development

Start a local server from the project root:
```bash
python -m http.server 8000
# or: npx http-server
```

No build, test, or lint commands exist. Edit files directly and refresh the browser.

## Architecture

**Pages:** `index.html` (homepage with hero, projects, timeline, contact), `about.html`, `contact.html`, `impressum.html` (German legal), `datenschutz.html` (privacy)

**CSS Modules (`css/`):**
- `variables.css` - Design tokens (dark theme, amber accent #F59E0B, fluid typography via clamp())
- `base.css` - Reset and typography
- `layout.css` - Grid and container system
- `components.css` - UI components (.btn, .card, .tag, .project-card, .timeline__*)
- `animations.css` - Keyframe animations
- `responsive.css` - Media queries (mobile-first)

**JavaScript (`js/main.js`):** Single file using IIFE module pattern containing:
- `RoleRotation` - Typewriter effect cycling through professional roles
- `ScrollAnimations` - Intersection Observer for reveal animations
- `DataLoader` - Fetches `content/projects.json` and `content/timeline.json`
- `Header`, `MobileNav`, `SmoothScroll`, `Parallax`, `LanguageToggle`, `PageLoader`
- `ContactProtection` - Base64 decodes contact info on page load

**Content (`content/`):** JSON files for projects and experience timeline, loaded dynamically with fallback content.

## Key Implementation Details

- Contact details are Base64 encoded in JS for spam protection
- Language toggle stores preference in localStorage but doesn't translate content
- Timeline uses Intersection Observer to animate progress fill on scroll
- Header auto-hides when scrolling down, shows when scrolling up
- Includes accessibility features: skip link, ARIA labels, semantic HTML, reduced-motion support
