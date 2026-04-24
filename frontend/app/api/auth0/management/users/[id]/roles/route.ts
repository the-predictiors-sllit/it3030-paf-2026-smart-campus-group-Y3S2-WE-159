import { getBaseUrl } from '@/lib/api-client';
import { auth0 } from '@/lib/auth0';
import { NextRequest, NextResponse } from 'next/server';



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'error', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { token } = await auth0.getAccessToken();
    const { id } = await params;
    const Api_Url = getBaseUrl();

    const backendRes = await fetch(`${Api_Url}/api/auth0/management/users/${encodeURIComponent(id)}/roles`, {
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
    console.error("Fetch Roles Error:", error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }

}



export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'error', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { token } = await auth0.getAccessToken();
    const { id } = await params;
    const payload = await request.json();

    const Api_Url = getBaseUrl();

    const backendRes = await fetch(
      `${Api_Url}/api/auth0/management/users/${encodeURIComponent(id)}/roles`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (backendRes.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const contentType = backendRes.headers.get('content-type') || '';
    const data = await backendRes.text();

    return new NextResponse(data || null, {
      status: backendRes.status,
      headers: {
        'Content-Type': contentType.includes('json')
          ? 'application/json'
          : contentType || 'application/json',
      },
    });
  } catch (error: unknown) {
    console.error('Delete Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}














export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'error', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { token } = await auth0.getAccessToken();
    const { id } = await params;
    const payload = await request.json();

    const Api_Url = getBaseUrl();

    const backendRes = await fetch(`${Api_Url}/api/auth0/management/users/${encodeURIComponent(id)}/roles`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
    console.error("User Creation Error:", error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }

}