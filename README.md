# Mico Industrial Press Website

Production-ready static website and Express API for **Mico Industrial Press**, located at No 24 Zik Avenue Amawbia, Awka-South L.G.A, Anambra State.

The project is intentionally lightweight:

- Static frontend: plain HTML, CSS, and JavaScript.
- Backend API: Node.js and Express.
- No database, dashboard, payments, customer accounts, or frontend framework.
- Forms send email through SMTP using Nodemailer.
- Quote file upload support is optional and controlled by environment variables.

## Project Structure

```text
mico-industrial-press/
  frontend/
    index.html
    about.html
    services.html
    portfolio.html
    contact.html
    faq.html
    quote.html
    privacy.html
    sitemap.xml
    robots.txt
    services/
      commercial-industrial-printing.html
      direct-image-printing.html
      brochures.html
      magazines.html
      heat-transfer.html
    assets/
      css/
        styles.css
      js/
        main.js
        quote-form.js
        contact-form.js
      images/
      icons/
        favicon.svg
  backend/
    config/
      env.js
    middleware/
    routes/
    services/
    .env.example
    package.json
    server.js
```

## Local Setup

Requirements:

- Node.js 18 or newer.
- npm.
- A local static server for frontend testing when forms are used.

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Create Backend Environment File

Copy the backend environment example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

At minimum for local API testing:

```env
NODE_ENV=development
PORT=3001
FRONTEND_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

SMTP can remain blank during early testing. The API will return a friendly message telling users to call or use WhatsApp.

### 3. Run Backend Locally

```bash
npm run dev
```

The backend should run at:

```text
http://localhost:3001
```

Health check:

```text
http://localhost:3001/health
```

### 4. Run Frontend Locally

The frontend is static. You can open `frontend/index.html` directly for visual review, but form testing is more reliable through a local static server.

Common local server examples:

```bash
cd frontend
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

If you use VS Code Live Server, confirm whether it opens:

```text
http://localhost:5500
```

or:

```text
http://127.0.0.1:5500
```

Whichever one the browser uses must be included in `FRONTEND_ORIGIN`.

## API Endpoints

```text
GET  /health
POST /api/quote
POST /api/contact
```

Quote form local endpoint:

```text
http://localhost:3001/api/quote
```

Contact form local endpoint:

```text
http://localhost:3001/api/contact
```

## Frontend API Base URL

The frontend reads the API base URL from a meta tag on the two form pages.

Update both files before production deployment:

- `frontend/quote.html`
- `frontend/contact.html`

Current local value:

```html
<meta name="api-base-url" content="http://localhost:3001">
```

Production example:

```html
<meta name="api-base-url" content="https://mico-industrial-press-api.onrender.com">
```

Do not include `/api/quote` or `/api/contact` in the meta tag. The JavaScript adds those paths automatically.

Alternative override for advanced use:

```html
<script>
  window.MICO_API_BASE_URL = "https://your-backend-domain.com";
</script>
```

Place that before `quote-form.js` or `contact-form.js` if used.

## Backend Environment Variables

Set these in `backend/.env` locally and in the hosting provider dashboard for production.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Yes | Use `development` locally and `production` on Render/Railway. |
| `PORT` | Usually host-provided | Local default is `3001`. Render/Railway usually provide this automatically. |
| `FRONTEND_ORIGIN` | Yes | Comma-separated frontend origins allowed by CORS. Must match the browser URL exactly. |
| `BUSINESS_NAME` | Yes | Business name used in emails. |
| `BUSINESS_EMAIL` | Yes | Owner email address that receives quote/contact messages. |
| `BUSINESS_PHONE` | Yes | Phone number included in email confirmations. |
| `BUSINESS_ADDRESS` | Yes | Address included in email text. |
| `SMTP_HOST` | Yes for email | SMTP server hostname. |
| `SMTP_PORT` | Yes for email | Usually `587` for STARTTLS or `465` for SSL. |
| `SMTP_SECURE` | Yes for email | `false` for port `587`, `true` for port `465`. |
| `SMTP_USER` | Yes for email | SMTP username, usually the full email address. |
| `SMTP_PASS` | Yes for email | SMTP password or app password. |
| `SMTP_FROM` | Yes for email | Sender name/email shown to customers. |
| `UPLOADS_ENABLED` | Optional | `false` by default. Set `true` only when file uploads are ready. |
| `MAX_UPLOAD_SIZE` | Optional | File size limit in bytes. Default example is `5242880` for 5 MB. |
| `MAX_UPLOAD_FIELD_SIZE` | Optional | Maximum size per normal multipart form field. |
| `RATE_LIMIT_WINDOW_MS` | Optional | Rate limit window. Default example is 15 minutes. |
| `RATE_LIMIT_MAX` | Optional | Max API requests per window. |
| `HONEYPOT_FIELD` | Optional | Hidden anti-spam field name. |
| `JSON_BODY_LIMIT` | Optional | JSON/urlencoded request body size limit. |

## FRONTEND_ORIGIN Rules

`FRONTEND_ORIGIN` must match the exact frontend origin used by the browser.

Good production example:

```env
FRONTEND_ORIGIN=https://micoindustrialpress.com
```

Good local example:

```env
FRONTEND_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

Avoid trailing slashes:

```env
# Good
FRONTEND_ORIGIN=https://micoindustrialpress.com

# Bad
FRONTEND_ORIGIN=https://micoindustrialpress.com/
```

Do not use `*` in production. The backend intentionally rejects wildcard browser origins when `NODE_ENV=production`.

## SMTP Configuration

Email sending requires:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Gmail example:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-16-character-app-password-without-spaces
SMTP_FROM="Mico Industrial Press <your-gmail-address@gmail.com>"
```

For Gmail:

1. Enable 2-Step Verification on the Google account.
2. Create a Gmail App Password.
3. Use the 16-character app password as `SMTP_PASS`.
4. Do not use the normal Gmail login password.

Alternative providers include Brevo, Mailgun, SendGrid SMTP, Postmark SMTP, Amazon SES SMTP, Zoho Mail, or a domain email provider.

## Frontend Deployment: Netlify

Use this for the static frontend only.

Recommended settings:

```text
Base directory: frontend
Build command: leave blank
Publish directory: .
```

If your Git repository root is the parent folder that contains `mico-industrial-press`, use `mico-industrial-press/frontend` instead.

Steps:

1. Push the project to GitHub.
2. In Netlify, create a new site from the Git repository.
3. Set the base directory to `frontend`, or `mico-industrial-press/frontend` if the repository root is the parent folder.
4. Leave the build command blank because this is plain HTML/CSS/JS.
5. Set publish directory to `.`.
6. Deploy the site.
7. Copy the production frontend URL.
8. Add that URL to backend `FRONTEND_ORIGIN`.
9. After the backend is deployed, update `api-base-url` in `quote.html` and `contact.html`.
10. Redeploy the frontend.

Official docs:

- https://docs.netlify.com/build/configure-builds/overview/
- https://docs.netlify.com/deploy/create-deploys/

## Frontend Deployment: Vercel

Use this for the static frontend only.

Recommended settings:

```text
Framework preset: Other
Root directory: frontend
Build command: leave blank
Output directory: .
```

If your Git repository root is the parent folder that contains `mico-industrial-press`, use `mico-industrial-press/frontend` instead.

Steps:

1. Push the project to GitHub.
2. In Vercel, import the Git repository.
3. Set the project root directory to `frontend`, or `mico-industrial-press/frontend` if the repository root is the parent folder.
4. Use framework preset `Other`.
5. Leave build command blank.
6. Set output directory to `.` if Vercel asks for one.
7. Deploy the frontend.
8. Copy the production frontend URL.
9. Add that URL to backend `FRONTEND_ORIGIN`.
10. After the backend is deployed, update `api-base-url` in `quote.html` and `contact.html`.
11. Redeploy the frontend.

Official docs:

- https://vercel.com/docs/project-configuration

## Backend Deployment: Render

Use this for the Express API only.

Recommended settings:

```text
Service type: Web Service
Root directory: backend
Build command: npm install
Start command: npm start
Environment: Node
```

If your Git repository root is the parent folder that contains `mico-industrial-press`, use `mico-industrial-press/backend` instead.

Steps:

1. Create a new Render Web Service from the Git repository.
2. Set root directory to `backend`, or `mico-industrial-press/backend` if the repository root is the parent folder.
3. Set build command to `npm install`.
4. Set start command to `npm start`.
5. Add all required environment variables in the Render dashboard.
6. Set `NODE_ENV=production`.
7. Set `FRONTEND_ORIGIN` to the deployed frontend URL.
8. Deploy the backend.
9. Open `/health` on the backend URL to confirm it responds.
10. Copy the backend URL into the frontend `api-base-url` meta tags.

Official docs:

- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/environment-variables

## Backend Deployment: Railway

Use this for the Express API only.

Recommended settings:

```text
Service root: backend
Start command: npm start
Environment variables: set in Railway dashboard
```

If your Git repository root is the parent folder that contains `mico-industrial-press`, use `mico-industrial-press/backend` instead.

Steps:

1. Create a Railway project from the Git repository.
2. Configure the service to deploy from `backend`, or `mico-industrial-press/backend` if the repository root is the parent folder.
3. Confirm Railway installs dependencies from `package.json`.
4. Set start command to `npm start` if Railway does not detect it automatically.
5. Add all required environment variables.
6. Set `NODE_ENV=production`.
7. Set `FRONTEND_ORIGIN` to the deployed frontend URL.
8. Deploy the backend.
9. Open `/health` on the backend URL.
10. Copy the backend URL into the frontend `api-base-url` meta tags.

Official docs:

- https://docs.railway.com/guides/start-command
- https://railway.com/deploy/nodejs-1

## Production Testing Checklist

Run these after both frontend and backend are deployed.

- Open the homepage on a mobile phone and desktop browser.
- Confirm all navigation links work.
- Confirm service detail pages open correctly.
- Confirm sticky mobile CTA buttons call, open WhatsApp, and open quote page.
- Confirm `robots.txt` loads at `/robots.txt`.
- Confirm `sitemap.xml` loads at `/sitemap.xml`.
- Confirm backend `/health` returns a safe JSON response.
- Submit the contact form with valid details.
- Submit the quote form with valid details.
- Confirm business owner receives email.
- Confirm customer receives confirmation email when email is provided.
- Test form failure behavior by temporarily using missing SMTP values in a staging environment.
- If uploads are disabled, confirm quote form without upload still works.
- If uploads are enabled, test valid and invalid file types.
- Confirm browser console has no CORS errors.
- Confirm `FRONTEND_ORIGIN` exactly matches the frontend URL.
- Confirm `api-base-url` points to the deployed backend URL.
- Run Lighthouse mobile checks for Performance, Accessibility, Best Practices, and SEO.

## Launch Checklist

- Confirm final frontend domain.
- Confirm final backend domain.
- Update `api-base-url` in `quote.html` and `contact.html`.
- Update backend `FRONTEND_ORIGIN`.
- Confirm SMTP credentials are production-ready.
- Confirm `BUSINESS_EMAIL`, phone numbers, WhatsApp numbers, address, and hours are correct.
- Replace placeholder photos with compressed real photos.
- Add a real logo/favicon when available.
- Add a real Open Graph image when available.
- Confirm canonical URLs, `sitemap.xml`, and `robots.txt` use the final domain.
- Confirm HTTPS is active on frontend and backend.
- Submit final quote/contact test.
- Check email spam folder and improve SMTP/domain authentication if needed.
- Submit sitemap to Google Search Console after launch.

## Maintenance Checklist

Monthly:

- Test quote form and contact form.
- Confirm SMTP credentials still work.
- Review backend logs for repeated errors or rate-limit activity.
- Confirm phone, WhatsApp, hours, and address are still accurate.
- Check deployed frontend and backend URLs.

Quarterly:

- Update dependencies if security updates are available.
- Run Lighthouse again after content or image changes.
- Review real portfolio photos and replace weak placeholders.
- Check Search Console for indexing or mobile usability issues.

Before changing hosting:

- Update `FRONTEND_ORIGIN`.
- Update frontend `api-base-url`.
- Retest forms.
- Retest CORS.

## Troubleshooting

### CORS Errors

Symptoms:

- Browser console says the request was blocked by CORS.
- Forms work locally but fail after deployment.

Fix:

1. Check the exact frontend URL in the browser.
2. Set backend `FRONTEND_ORIGIN` to that exact origin.
3. Do not include a trailing slash.
4. Redeploy/restart the backend.

Example:

```env
FRONTEND_ORIGIN=https://micoindustrialpress.com
```

### SMTP Errors

Symptoms:

- Form submits but returns an email configuration error.
- Backend logs mention incomplete SMTP configuration.

Fix:

1. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`.
2. Confirm `BUSINESS_EMAIL` is correct.
3. For Gmail, use an App Password, not the normal account password.
4. Restart/redeploy the backend.
5. Submit the form again.

### Form Not Submitting

Check:

- Is the backend running?
- Does `/health` work?
- Is the frontend `api-base-url` correct?
- Does the browser console show CORS errors?
- Are required fields completed?
- Is SMTP configured?
- Is the user trying to upload a file while uploads are disabled?

### Wrong API URL

Symptoms:

- Browser network tab shows requests to `localhost:3001` on the live site.
- Forms fail after deployment.

Fix:

Update both:

```html
<meta name="api-base-url" content="https://your-production-backend-url">
```

Files:

- `frontend/quote.html`
- `frontend/contact.html`

Redeploy the frontend after editing.

### Live Server Origin Mismatch

Symptoms:

- Backend allows `http://localhost:5500`, but the browser opened `http://127.0.0.1:5500`.
- CORS error appears during local testing.

Fix:

Set both local origins:

```env
FRONTEND_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

Restart the backend after changing `.env`.

### Missing `.env`

Symptoms:

- Backend starts with defaults.
- SMTP is missing.
- Production settings are not applied locally.

Fix:

```bash
cd backend
cp .env.example .env
```

Then fill in the real values and restart the backend.

### Upload Problems

If uploads are disabled:

```env
UPLOADS_ENABLED=false
```

Customers should submit the form without a file or use WhatsApp.

If uploads are enabled:

```env
UPLOADS_ENABLED=true
MAX_UPLOAD_SIZE=5242880
```

Allowed file types:

- PDF
- JPG
- JPEG
- PNG
- DOC
- DOCX

## Current Deployment Recommendation

Recommended simple production setup:

- Frontend: Netlify or Vercel.
- Backend: Render or Railway.
- API URL: deployed backend domain.
- CORS: exact deployed frontend domain.
- SMTP: production email provider or Gmail App Password.

This keeps the project lightweight, easy to maintain, and close to the original approved architecture.
