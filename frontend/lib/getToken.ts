// lib/getToken.ts
'use server'; // <--- CRITICAL: This makes it a Server Action

import { auth0 } from "./auth0";

export async function getToken() {
  try {
    const session = await auth0.getSession();
    return session?.accessToken;
  } catch (error) {
    console.error("Failed to fetch token:", error);
    return null;
  }
}