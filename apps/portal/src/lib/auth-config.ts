import type { Configuration } from '@azure/msal-browser'

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_B2C_CLIENT_ID ?? '',
    authority: process.env.NEXT_PUBLIC_B2C_AUTHORITY ?? '',
    knownAuthorities: [process.env.NEXT_PUBLIC_B2C_KNOWN_AUTHORITY ?? ''],
    redirectUri: process.env.NEXT_PUBLIC_B2C_REDIRECT_URI ?? 'http://localhost:3000/auth/callback',
    postLogoutRedirectUri: '/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
}

export const loginRequest = {
  scopes: (process.env.NEXT_PUBLIC_B2C_SCOPES ?? 'openid profile').split(' '),
}
