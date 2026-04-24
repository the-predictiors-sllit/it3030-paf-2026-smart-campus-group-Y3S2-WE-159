import { getBaseUrl } from '@/lib/api-client';
import { auth0 } from '@/lib/auth0';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    _request: NextRequest,
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
        const backendRes = await fetch(
            `${Api_Url}/api/auth0/management/users/${encodeURIComponent(id)}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            }
        );

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
export async function DELETE(
    _request: NextRequest,
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

        const backendRes = await fetch(
            `${Api_Url}/api/auth0/management/users/${encodeURIComponent(id)}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            }
        );

        if (backendRes.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const data = await backendRes.text();

        return new NextResponse(data, {
            status: backendRes.status,
            headers: {
                'Content-Type': backendRes.headers.get('content-type') || 'application/json',
            },
        });
    } catch (error: unknown) {
        console.error('Delete Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ status: 'error', message }, { status: 500 });
    }
}
