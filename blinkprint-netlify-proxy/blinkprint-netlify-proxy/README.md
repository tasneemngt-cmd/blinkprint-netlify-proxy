# Blink Print API proxy (Netlify)

This project proxies only these GET actions to the existing Blink Print API: `health`, `app_products`, `pricing`, `app_locations`.

## Deploy
1. Upload these files to a GitHub repository.
2. In Netlify choose **Add new project / Import an existing project** and connect that repository.
3. Leave build command empty and publish directory as `.` (or let Netlify detect `netlify.toml`).
4. Deploy the site.

Test after deploy:
- `https://YOUR-SITE.netlify.app/.netlify/functions/blink-api?action=health`
- `https://YOUR-SITE.netlify.app/.netlify/functions/blink-api?action=app_products`

If the function returns `upstreamContentType: text/html`, the original InfinityFree host is also returning its security page to server-to-server requests. The proxy alone cannot bypass that; a supported API route/allowlisting or a backend endpoint that serves JSON is needed.

Do not use this as an order-forwarding endpoint. Order submission needs authentication, validation, and secure payment verification before production.
