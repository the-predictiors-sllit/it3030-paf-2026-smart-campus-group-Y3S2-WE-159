import { getBaseUrl } from '@/lib/api-client';
import { auth0 } from '@/lib/auth0';
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
    const apiUrl = getBaseUrl();

    if (!request.nextUrl.searchParams.get('fileName')) {
      return NextResponse.json(
        { status: 'error', message: 'fileName query parameter is required' },
        { status: 400 }
      );
    }

    let backendRes = await fetch(`${apiUrl}/api/upload/view${search}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    // Some backend setups expect multipart form-data semantics for this endpoint.
    // Fetch does not support GET with body, so retry via POST with empty multipart data.
    if (!backendRes.ok && backendRes.status >= 500) {
      const fallbackForm = new FormData();
      fallbackForm.append('file', new Blob([]), '');
      fallbackForm.append('folder', '');

      backendRes = await fetch(`${apiUrl}/api/upload/view${search}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fallbackForm,
        cache: 'no-store',
      });
    }

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