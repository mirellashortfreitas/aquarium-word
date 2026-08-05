# Aquarium World

## Overview

This is a Node.js/Express aquarium website (Aquarium World) using EJS templates for pages like Home, Events, FAQ, Zones, Accessibility, and Contact, with static assets served via CSS/JS. It uses SQLite (via `database.js`) to store contacts, FAQ like/heart reactions, and events, with security/logging middleware (helmet, morgan, express-rate-limit). The frontend (`main.js`) adds interactive features: a photo popup gallery, live server time, AJAX FAQ reactions, contact form validation, event search, site-wide search, and event countdown badges.

## Features

**Backend (Node.js/Express)**
- Express 5 server with EJS templating engine
- SQLite database (via `sqlite3`) for persistent storage
- Helmet for security headers / Content Security Policy
- Morgan for HTTP request logging
- express-rate-limit for request throttling
- Validator for input validation/sanitization
- Nodemon for development auto-reload

**Database (SQLite tables)**
- `contacts` — stores contact form submissions (name, email, subject, message, status, timestamp)
- `reactions` — stores like/heart counts per FAQ item
- `events` — stores event listings (title, type, description, date, image)
- `faqs` — stores FAQ questions, answers, and images

**Pages (EJS views)**
- Home (`index.ejs`)
- Events (`events.ejs`)
- FAQ (`faq.ejs`)
- Zones (`zones.ejs`)
- Accessibility (`accessibility.ejs`)
- Contact (`contact.ejs`)

**Frontend interactivity (`main.js`)**
- Photo gallery popup/lightbox (click and keyboard-accessible)
- Live server time display (polled every second via `/server-time`)
- FAQ like/heart reaction buttons with AJAX POST to `/reactions`, and loading saved counts on page load
- Contact form client-side validation + AJAX submission to `/contact`, with success/error messaging
- Live event search/filtering via `/api/events/search`
- Site-wide search widget with debounce, dropdown results, and click-outside-to-close behavior (`/api/search`)
- Event countdown badges (days remaining, "happening today," "event ended")

## Technologies

**Backend / Runtime**
- Node.js — JavaScript runtime environment on the server
- Express 5 — web framework for routing, middleware, and HTTP server
- EJS — templating engine used to render dynamic HTML on the server

**Database**
- SQLite3 — lightweight, file-based relational database (`aquarium.db`), accessed via the `sqlite3` driver with raw SQL queries (`db.run`, `db.get`)

**Security & Middleware**
- Helmet — sets HTTP security headers, including Content Security Policy (this is why `main.js` avoids inline handlers like `onclick`)
- express-rate-limit — limits the number of requests to prevent abuse/spam
- Morgan — HTTP request logging in the console/server
- Validator — input validation and sanitization (e.g. contact form data)

**Frontend**
- HTML/CSS — plain CSS (`style.css`), no CSS framework (no Bootstrap/Tailwind)
- Vanilla JavaScript (ES6+) — no frameworks like React/Vue; uses the `fetch` API, `async/await`, event listeners, and direct DOM manipulation
- Fetch API — handles asynchronous (AJAX) communication between frontend and backend for: FAQ reactions, contact form submission, event search, site-wide search, and server time

**Development Tools**
- Nodemon — automatically restarts the server during development
- npm — package manager (evidenced by `package.json` and `package-lock.json`)

**Architecture**
- A simple server-rendered (SSR) multi-page application using EJS, not a full REST API or SPA — it's a traditional multi-page site enhanced with AJAX for specific features (search, reactions, form submission).

## Project Structure

aquarium-world/
│
├── index.mjs              # Main server entry point (Express app, routes, middleware)
├── database.js            # SQLite database setup (tables + seed data)
├── aquarium.db             # SQLite database file (contacts, reactions, events, faqs)
│
├── package.json            # Project metadata & dependencies
├── package-lock.json       # Locked dependency versions
│
├── views/                  # EJS templates (server-rendered pages)
│   ├── partials/
│   │   ├── header.ejs      # Shared site header (logo, nav menu, search widget)
│   │   └── footer.ejs      # Shared site footer
│   │
│   ├── index.ejs
│   ├── events.ejs
│   ├── faq.ejs
│   ├── zones.ejs
│   ├── accessibility.ejs
│   └── contact.ejs
│
└── public/                 # Static assets served to the client
    ├── main.js
    └── style.css

## Installation

Clone the repository:

```bash
git clone https://github.com/mirellashortfreitas/aquarium-word.git
```

Navigate to the project directory:

```bash
cd aquarium-world
```

Install the required dependencies:

```bash
npm install
```

## Configuration

No environment variables are required to run this project locally. The SQLite database (`aquarium.db`) is created and seeded automatically with sample data on first run.

> Note: requests to `/contact` and `/reactions` are validated against an allowed-origin list (`http://localhost:5000` by default). If you change the port, update `ALLOWED_ORIGINS` in `index.mjs` accordingly.

## Running the Application

Start the server:

```bash
npm start
```

Or run in development mode with auto-reload (via nodemon):

```bash
npm run dev
```

Open your browser and visit:

```
http://localhost:5000
```

## Testing

No automated tests are currently implemented (see Future Improvements).

## Future Improvements

- Admin dashboard — a protected area to manage FAQs, events, and view contact submissions (the `status` field in `contacts` already exists but has no UI to update it)
- Authentication — add login/session handling for admin access
- Email notifications — send a confirmation email to users after contact form submission, and notify staff of new messages
- Full-text search — replace basic `LIKE`-style search with SQLite FTS5 for faster, more relevant event/site search
- Pagination / infinite scroll — for events and FAQ pages as content grows
- Image upload support — allow admins to upload event/FAQ images instead of hardcoding static paths
- Input sanitization audit — expand `validator` usage across all form endpoints, not just contact
- Testing — add unit/integration tests (currently `npm test` is a placeholder)
- Database layer upgrade — migrate from raw `sqlite3` callbacks to `better-sqlite3` or an ORM (e.g. Prisma) for cleaner async/await code
- Environment configuration — introduce a `.env` file for configurable values (e.g. port, allowed origins)
- Caching — cache static data like FAQs/events to reduce DB reads
- Accessibility enhancements — expand on `accessibility.ejs` with ARIA live regions for dynamic content (search results, reaction counts, countdown badges)
- Internationalization — support multiple languages
- Docker support — containerize the app for easier deployment
- CI/CD pipeline — automated linting/testing on push
- Mobile responsiveness audit — ensure all AJAX-driven features work smoothly on smaller screens

## Contributing

This is currently a personal/portfolio project and not open for external contributions. Feel free to reach out if you'd like to discuss it.

## License

All rights reserved. This project's source code is publicly visible for portfolio/demonstration purposes only.
Copying, modifying, or redistributing this code without explicit permission from the author is not allowed.

© 2026 Mirella Short Freitas. All rights reserved.

## Author

Developed by Mirella Short Freitas.

Feel free to connect or provide feedback about this project.