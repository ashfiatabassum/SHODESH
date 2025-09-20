# SHODESH System Requirements and Tech Stack

This document inventories the tools, OS, frontend, backend, database, and utilities used across the entire `SHODESH-1` workspace.

## Overview

- Project Type: Node.js + Express server with static HTML/CSS frontend and MySQL database
- Runtime: Node.js (tested with nodemon for development)
- Package Manager: npm

## Operating System

| Component | Supported | Notes |
|---|---|---|
| Windows 10/11 | Yes | Primary dev OS (PowerShell). |
| macOS | Yes | Should work with Homebrew-installed MySQL/Node. |
| Linux (Debian/Ubuntu) | Yes | Requires MySQL and Node installed from apt/nvm. |

## Frontend

| Area | Technology | Version/Notes | Location |
|---|---|---|---|
| Static pages | HTML5, CSS3 | Vanilla, no framework | `src/public/**/*.html`, `src/public/**/*.css` |
| Admin UI | HTML/CSS + ES6 JS | Local rendering, stubs for categories | `src/public/admin/*` |
| Search UI | HTML/CSS + JS | Enhanced search, autocomplete hooks | `src/public/search.*`, `src/public/autocomplete.js` |

## Backend

| Area | Technology | Version/Notes | Location |
|---|---|---|---|
| Web framework | Express | ^5.1.0 | Defined in `package.json`; server in `src/index.js` |
| Sessions | express-session | ^1.18.2 | Admin login token in session |
| File upload | multer | ^2.0.2 | For BLOBs (photos/docs) |
| DB driver | mysql2 | ^3.14.3 | Pool for admin, single conn for app |
| HTTP fetch | node-fetch | ^3.3.2 | For external calls (if any) |
| Dev tooling | nodemon | ^3.1.10 (dev) | Live reload during development |

## Database

| Item | Details | Location |
|---|---|---|
| Engine | MySQL 8.x (tested) | Connection in `src/config/db.js` and `src/config/db-admin.js` |
| Schema | `shodesh` | DDL and data in `sql/shodeshsqlscript.sql` |
| Grants | `GRANT SELECT ON shodesh.* TO 'root'@'localhost';` | `sql/shodeshsqlscript.sql` (line ~7) |
| Views | v_event_catalog, v_event_catalog_open, v_event_filters_categories, v_event_filters_event_types, v_event_filters_divisions, analytics views | `sql/shodeshsqlscript.sql` and `sql/donation-analytics-*.sql` |
| Procedures | sp_get_event_types, sp_get_donation_analytics, sp_admin_verify_event, analytics procedures | `sql/shodeshsqlscript.sql`, `sql/updated_analytics_procedure.sql` |
| Functions | fn_event_remaining, fn_event_is_eligible (used), other helpers | `sql/shodeshsqlscript.sql` |
| Triggers | On EVENT_CREATION (verification, lifecycle), others in admin docs | `sql/shodeshsqlscript.sql` |

## Node.js and npm

| Item | Required | Notes |
|---|---|---|
| Node.js | 18.x or 20.x | Express 5 compatible; ESM not required |
| npm | 9+ | For installing dependencies |

## Environment and Configuration

| Variable | Default | Where Used | Notes |
|---|---|---|---|
| PORT | 3000 | `src/index.js` | `process.env.PORT || 3000` |
| DB_HOST | localhost | `src/config/db*.js` | Currently hard-coded; consider env vars |
| DB_USER | root | `src/config/db*.js` | Hard-coded for now |
| DB_PASSWORD | mirpurdohs832 | `src/config/db*.js` | Hard-coded; move to .env |
| DB_NAME | shodesh | `src/config/db*.js` | Hard-coded |
| SESSION_SECRET | shodesh-admin-secret-key | `src/index.js` | Hard-coded; move to env |

## Services and Routes

| Area | Endpoints (examples) | File |
|---|---|---|
| Admin | `/api/admin/*` (events, foundations, staff, categories, analytics) | `src/routes/admin.js` |
| Donor | `/api/donor/*` | `src/routes/donor.js` |
| Foundation | `/api/foundation/*` | `src/routes/foundation.js` |
| Individual | `/api/individual/*` | `src/routes/individual.js` |
| Search | `/api/search/*` and `/api/autocomplete/*` | `src/routes/search.js`, `src/routes/autocomplete.js` |
| Events | `/api/events/*`, event creation under `/api/*` | `src/routes/event.js`, `src/routes/eventcreationroutes.js` |

## Scripts

| Script | Command | Purpose |
|---|---|---|
| start | `node ./src/index.js` | Start production server |
| dev | `nodemon ./src/index.js` | Start development server with reload |

## Tools Used (Dev/Build/Test)

| Tool | Purpose | Version |
|---|---|---|
| Git | Version control | Any recent |
| VS Code | Editor | Latest |
| Node.js | Runtime | 18.x or 20.x |
| MySQL Server | Database | 8.x |
| PowerShell | Shell (Windows) | Default on Windows |

## Folder Map (high level)

| Folder | Purpose |
|---|---|
| `src/` | Server, routes, configs, static assets |
| `src/public/` | Frontend assets (HTML/CSS/JS, admin UI) |
| `src/routes/` | Express route handlers |
| `sql/` | Database DDL, views, procedures, analytics SQL |
| `adminsql/` | Documentation for admin modules |

## Notes and Recommendations

- Security: Move DB credentials and session secret to environment variables (.env) and use a config loader.
- Production: Serve static files via a reverse proxy (NGINX) and enable HTTPS; set `cookie.secure=true`.
- DB Permissions: Use a dedicated MySQL user with least privilege in production, not `root`.
- ID Generation: Consider database sequences or UUIDs instead of random 4-digit suffixes.
