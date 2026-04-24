import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  appBaseUrl: process.env.APP_BASE_URL || process.env.AUTH0_BASE_URL,
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: 'openid profile email'
  },

  async beforeSessionSaved(session) {
    const namespace = 'https://smartcampus.api';

    const payload = JSON.parse(
      Buffer.from(session.tokenSet.idToken!.split('.')[1], 'base64').toString()
    );

    return {
      ...session,
      user: {
        ...session.user,
        [`${namespace}/roles`]: payload[`${namespace}/roles`],
        [`${namespace}/email`]: payload[`${namespace}/email`],
        [`${namespace}/name`]:  payload[`${namespace}/name`],
      }
    };
  }
});