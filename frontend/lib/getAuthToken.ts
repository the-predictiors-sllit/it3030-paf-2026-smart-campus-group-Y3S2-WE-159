'use server'
import { auth0 } from '@/lib/auth0';


export async function getAuthToken() {
  try {
    const session = await auth0.getSession();
    if (!session) return null;

    const { token } = await auth0.getAccessToken();
    return token;
  } catch (error) {
    console.error("Global Auth Action Error:", error);
    return null;
  }
}