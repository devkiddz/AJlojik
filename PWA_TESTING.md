# AJ Logik PWA Testing

## Production-mode local test

```powershell
npm run build
npm start
```

Open `http://localhost:3000` on the same computer.

In Chrome or Edge DevTools:

1. Open **Application**.
2. Check **Manifest** for AJ Logik and all required icons.
3. Check **Service Workers** for `/sw.js` with scope `/`.
4. Open `/store`, then enable Offline mode and refresh a public page.
5. Confirm `/offline` is used when an uncached page cannot be reached.

## Phone and tablet test

Use the deployed HTTPS Vercel Preview or Production address. A normal LAN address such as `http://192.168.x.x:3000` is not a secure context for service-worker installation.

Test:

- home-screen installation;
- standalone launch;
- theme/status-bar appearance;
- Store and customer dashboard navigation;
- User Action Tray on short screens;
- sticky Navbar;
- Back and History restoration;
- orientation changes;
- offline fallback.

## Development behavior

`npm run dev` and `npm run dev:webpack` unregister AJ Logik service workers. This prevents an old production worker from serving stale files while developing.
