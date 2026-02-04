# Hostinger Deployment Notes

1. Build client:

```powershell
cd client
npm install
npm run build
```

2. Upload `client/dist` to Hostinger public folder (e.g., `public_html/app`).

3. Install server on Hostinger (Node-enabled plan):

```powershell
cd server
npm install
# set environment variables in Hostinger control panel (MONGO_URI, JWT_SECRET, NODE_ENV=production)
npm run start
```

4. Configure reverse proxy or subdomain to point to the Node server port. Alternatively, use Hostinger's process manager to run the Node app and serve static files from the `client/dist` folder.

5. File uploads: ensure local storage directory is writable and backed up.

6. Cron: Hostinger may restrict long-running cron processes; prefer platform process manager or external scheduler for payroll if necessary.

\*\*\* End Patch
