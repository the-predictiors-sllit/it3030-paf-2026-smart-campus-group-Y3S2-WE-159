
import { auth0 } from '@/lib/auth0'
import { SERVER_API_URL } from '@/lib/api-client';
import { redirect, useRouter } from 'next/navigation';
import { HomeImageSlider } from '@/components/custom/HomeImageSlider';
import { HomeAdminPageAccessBtn } from '@/components/custom/HomeAdminPageAccessBtn';

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
    console.log(token)

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
    const errorMessage = error instanceof Error ? error.message : '';

    const requiresReauth =
      errorMessage.includes('AccessTokenError') ||
      (errorMessage.includes('expired') && errorMessage.includes('refresh token'));

    if (requiresReauth) {
      redirect('/auth/login?returnTo=/');
    }

    console.error('Failed to load backend profile: ', error)
  }


  

  return (
    <main>
      <HomeAdminPageAccessBtn/>
      <HomeImageSlider/>
    </main>

    // <div>
    //   <h1 className='text-2xl font-semibold'>Welcome</h1>
    //   {profile ? (
    //     <div className='mt-4 space-y-2'>
    //       <p><strong>Name:</strong> {profile.name}</p>
    //       <p><strong>Email:</strong> {profile.email}</p>
    //       <p><strong>Role:</strong> {profile.role}</p>
    //     </div>
    //   ) : (
    //     <p className='mt-4 text-sm text-muted-foreground'>
    //       Logged in with Auth0, but profile data could not be loaded from the database.
    //     </p>
    //   )}
    // </div>
  )
}

export default page