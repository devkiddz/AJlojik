# Google authentication setup

AJ Logik supports Google sign-up and sign-in through Better Auth. The UI is configuration-aware: email/password authentication remains available while Google credentials are missing.

## Google Cloud configuration

Create an OAuth 2.0 Client ID with application type **Web application**, then add these authorized redirect URIs:

- `http://localhost:3000/api/auth/callback/google`
- `https://ajlojik.vercel.app/api/auth/callback/google`

Set these environment variables locally and in Vercel:

```env
GOOGLE_CLIENT_ID="your-google-web-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
BETTER_AUTH_URL="https://ajlojik.vercel.app"
```

Use `BETTER_AUTH_URL="http://localhost:3000"` for local development. Restart the development server after changing authentication environment variables.

The same Google flow handles both registration and login. Existing accounts can be linked when Google returns the same verified email address.
