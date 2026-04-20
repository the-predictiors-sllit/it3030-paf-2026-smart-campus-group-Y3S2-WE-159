import LangSmithChat from '@/components/custom/LangSmithChat'
import { auth0 } from '@/lib/auth0';

const page = async () => {
  const { token } = await auth0.getAccessToken();
  return (
    <LangSmithChat token={token}/>
  )
}

export default page