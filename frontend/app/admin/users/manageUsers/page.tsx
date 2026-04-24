import { ManageUsers } from "@/components/custom/ManageUsers"
import { auth0 } from "@/lib/auth0"

const page = async () => {
  const { token } = await auth0.getAccessToken()
  return (
    <div className="space-y-5 pt-5 w-full">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight ">Manage Users</h1>
        {/* <p className="text-sm text-muted-foreground">
              Review, approve, reject, and remove resource bookings.
            </p> */}
      </div>
      <ManageUsers token={token} />
    </div>
  )
}

export default page
