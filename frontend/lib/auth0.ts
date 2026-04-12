import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  // v4 expects APP_BASE_URL; this fallback supports existing AUTH0_BASE_URL setups.
  appBaseUrl: process.env.APP_BASE_URL || process.env.AUTH0_BASE_URL,
  authorizationParameters: {
    // CRITICAL: This guarantees the token is valid for your Spring Boot backend
    audience: process.env.AUTH0_AUDIENCE,
    scope: 'openid profile email'
  }
});