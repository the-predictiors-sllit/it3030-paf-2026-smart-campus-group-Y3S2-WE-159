import { ManageUsers } from '@/components/custom/ManageUsers'
import { auth0 } from '@/lib/auth0';

const page = async () => {
    const { token } = await auth0.getAccessToken();
  return (
    <div><ManageUsers token={token}/></div>
  )
}

export default page