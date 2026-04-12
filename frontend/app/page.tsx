import { auth0 } from '@/lib/auth0'
import { SERVER_API_URL } from '@/lib/api-client';
import { redirect } from 'next/navigation';

type BackendProfileResponse = {
  status: 'success';
  data: {
    id: number | string;
    name: string;
    email: string;
    role: string;
  };
};

const page = async () => {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect('/auth/login')
  }

  let profile: BackendProfileResponse['data'] | null = null;

  try {
    const { token } = await auth0.getAccessToken();

    // Keep backend user record in sync with Auth0 identity.
    await fetch(`${SERVER_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const profileRes = await fetch(`${SERVER_API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (profileRes.ok) {
      const body: BackendProfileResponse = await profileRes.json();
      profile = body.data;
    }
  } catch (error) {
    console.error('Failed to load backend profile: ', error)
  }

  return (
    <div>
      <h1 className='text-2xl font-semibold'>Welcome</h1>
      {profile ? (
        <div className='mt-4 space-y-2'>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
        </div>
      ) : (
        <p className='mt-4 text-sm text-muted-foreground'>
          Logged in with Auth0, but profile data could not be loaded from the database.
        </p>
      )}
    </div>
  )
}

export default page