// Utility to get the correct base URL

export const getBaseUrl = (): string => {
  // Check if we are on the Server
  if (typeof window === 'undefined') {
    // Priority: Internal Env > Docker Internal Default
    return process.env.INTERNAL_API_URL ?? 'http://backend:8080';
  }

  // We are on the Client (Browser)
  // Priority: Public Env > Localhost Default
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8118';
};



// For server-side only (API routes, server components)
export const SERVER_API_URL = process.env.INTERNAL_API_URL || 'http://backend:8080';

// For client-side only (browser)
// export const CLIENT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8118';
export const CLIENT_API_URL = 'http://localhost:8118';