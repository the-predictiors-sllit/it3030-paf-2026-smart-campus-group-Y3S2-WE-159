import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getBaseUrl, SERVER_API_URL } from '@/lib/api-client';

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'error', message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { token } = await auth0.getAccessToken();
    
    const Api_Url = getBaseUrl();
    const backendRes = await fetch(`${Api_Url}/api/tickets/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const text = await backendRes.text();

    return new NextResponse(text, {
      status: backendRes.status,
      headers: {
        'Content-Type': backendRes.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
