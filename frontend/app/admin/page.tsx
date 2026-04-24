import { BentoCard, BentoGrid } from '@/components/ui/bento-grid'
import {
  IconBook2,
  IconTicket,
  IconPackages,
  IconUserBolt,
} from '@tabler/icons-react'
import { AdminDashboardOverview } from '@/components/custom/AdminDashboardOverview'

const features = [
  {
    Icon: IconBook2,
    name: 'Bookings',
    description: 'View booking analytics and approve requests across campus.',
    href: '/admin/booking',
    cta: 'Open bookings',
    background: <div className="absolute inset-0 bg-primary/10" />,
    className: 'lg:col-start-1 lg:col-end-3 lg:row-start-1 lg:row-end-3',
  },
  {
    Icon: IconPackages,
    name: 'Resources',
    description: 'Track resource usage, manage inventory, and add new assets.',
    href: '/admin/resources',
    cta: 'Open resources',
    background: <div className="absolute inset-0 bg-secondary/10" />,
    className: 'lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-3',
  },
  {
    Icon: IconTicket,
    name: 'Tickets',
    description: 'Resolve incident tickets and monitor support activity.',
    href: '/admin/tickets',
    cta: 'Open tickets',
    background: <div className="absolute inset-0 bg-destructive/10" />,
    className: 'lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4',
  },
  {
    Icon: IconUserBolt,
    name: 'Users',
    description: 'Review user activity, roles, and account health.',
    href: '/admin/users',
    cta: 'Open users',
    background: <div className="absolute inset-0 bg-accent/10" />,
    className: 'lg:col-start-2 lg:col-end-4 lg:row-start-3 lg:row-end-4',
  },
]

const page = () => {
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <section className="w-full space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Admin dashboard</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Real-time admin metrics and analytics for bookings, resources, tickets, and users.
          </p>
        </div>

        <AdminDashboardOverview />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quick actions</h2>
          <BentoGrid className="lg:grid-rows-1">
            {features.map((feature, index) => (
              <BentoCard key={index} {...feature} />
            ))}
          </BentoGrid>
        </div>
      </section>
    </div>
  )
}

export default page