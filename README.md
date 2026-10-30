# SafeNet

React interface for a phishing triage prototype built for a Rutgers hackathon in 2025. Users can submit a URL, email address, or message and review the backend's analysis.

The companion [Flask API](https://github.com/daleloncosky/safenet-backend) checks URLs with Google Safe Browsing and sends general message text to OpenAI. Email addresses receive an explicit explanation that an address alone cannot authenticate a sender. This implementation does not provide personal-data discovery or removal-request workflows.

## Run locally

Use Node.js 22.12 or newer. Node 24 is recorded in `.nvmrc`.

```sh
npm ci
cp .env.example .env
npm start
```

Open `http://localhost:3000`. Start the companion API on port 5000. Set `VITE_API_BASE_URL` in `.env` to use a different API. Vite reads this value at build time; never put API keys in frontend environment variables.

## Checks and deployment

```sh
npm test
npm run build
npm audit
```

The production output is `build/`. The Vite migration preserves that folder name for existing hosting configurations. `npm run preview` serves the built output locally. If `VITE_API_BASE_URL` is absent, development uses localhost and production retains the original Render API address from this project. Availability of that historical deployment is not guaranteed. Set the API address explicitly for a new deployment and add the frontend's exact origin to the backend's `ALLOWED_ORIGINS`.

Tests cover submission, duplicate-request prevention, blank input, and service errors. They mock the API and do not call paid providers.

## Implementation

- React state manages input, pending requests, and results.
- Axios uses a request timeout and displays recoverable errors.
- Inputs have accessible labels; result updates use a live region.
- A pending request disables editing and repeat submission.
- Message length is limited to match the API's 8000-character limit.

## Privacy and limits

Submitted URLs are sent to Google Safe Browsing. General message text is sent to OpenAI through the backend. Use synthetic examples without passwords, tokens, or personal information. The app does not independently crawl a submitted website. A missing threat match and an AI-generated assessment do not establish safety. This is a hackathon prototype; public operation also requires abuse prevention, request limits, and an appropriate privacy policy.

## Repository layout

`src/App.jsx` contains the interface, `src/App.css` its styling, and `src/App.test.jsx` the interaction tests. `vite.config.js` defines the build and test configuration. Dependencies are restored from the lockfile instead of being tracked in Git.
