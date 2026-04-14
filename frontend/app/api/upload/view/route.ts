import { auth0 } from '@/lib/auth0';
import { getBaseUrl } from '@/lib/api-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'error', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { token } = await auth0.getAccessToken();
    const search = request.nextUrl.search;
    const Api_Url = getBaseUrl();

    const backendRes = await fetch(`${Api_Url}/api/upload/view${search}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        // No Content-Type needed for a GET request
      },
      cache: 'no-store',
    });
    if (backendRes.status === 404) {
    return NextResponse.redirect(new URL('/brokenImageLink.png', request.url));
}

    if (!backendRes.ok) {
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch image from storage' },
            { status: backendRes.status }
        );
    }

    // Use arrayBuffer for binary data like images
    const blob = await backendRes.arrayBuffer();

    return new NextResponse(blob, {
      status: backendRes.status,
      headers: {
        // Forward the exact content-type from MinIO (image/png, image/jpeg, etc.)
        'Content-Type': backendRes.headers.get('content-type') || 'image/png',
        // Optional: Cache control for better performance
        'Cache-Control': 'public, max-age=3600', 
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}