import { UserDashboardBento } from '@/components/custom/UserDashboardBento'
import { UserProfileCard } from '@/components/custom/UserProfileCard'


const page = () => {
  return (
    <main className="p-5 gap-5">
      <section className="flex">
        <div className="basis-1/4">
          <UserProfileCard />
        </div>
        <div className="basis-3/4">
          <UserDashboardBento />
        </div>
      </section>
    </main>
  )
}

export default page