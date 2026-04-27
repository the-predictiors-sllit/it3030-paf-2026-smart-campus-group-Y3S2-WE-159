import { HomeAdminPageAccessBtn } from '@/components/custom/HomeAdminPageAccessBtn'
import { HomeImageSlider } from '@/components/custom/HomeImageSlider'
import { ResourceListCard } from '@/components/custom/ResourceListCard'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { CalendarDays, MessageSquare, Ticket } from 'lucide-react'
import { ReactNode } from 'react'
import { auth0 } from '@/lib/auth0'
import { SERVER_API_URL } from '@/lib/api-client'

interface Resource {
  id: string
  name: string
  type: 'ROOM' | 'LAB' | 'EQUIPMENT' | string
  capacity: number | null
  location: string
  status: 'ACTIVE' | 'OUT_OF_SERVICE' | string
  imageUrl?: string
  _links: {
    self: { href: string }
  }
}

interface ResourceResponse {
  _links: Record<string, unknown>
  data: {
    items: Resource[]
    total: number
    page: number
    totalPages: number
  } | null
  error: {
    code: string
    message: string
  } | null
  status: 'success' | 'error' | string
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'ROOM':
      return 'Room'
    case 'LAB':
      return 'Lab'
    case 'EQUIPMENT':
      return 'Equipment'
    default:
      return type
  }
}

const getStatusLabel = (status: string) =>
  status === 'OUT_OF_SERVICE' ? 'Out of Service' : 'Active'

async function fetchHomeResources(): Promise<Resource[]> {
  try {
    const session = await auth0.getSession()

    if (!session?.user) {
      return []
    }

    const { token } = await auth0.getAccessToken()
    const query = new URLSearchParams({ page: '1', limit: '4' })
    const response = await fetch(`${SERVER_API_URL}/api/resources?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return []
    }

    const result = (await response.json()) as ResourceResponse
    return result.status === 'success' && result.data ? result.data.items : []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const resources = await fetchHomeResources()

  return (
    <main>
      <HomeAdminPageAccessBtn />
      <HomeImageSlider />
      <Features />

      <Card className="m-5 py-20">
        <CardHeader className="mb-5">
          <CardTitle className="text-3xl font-semibold lg:text-4xl text-center">
            Book a Resource
          </CardTitle>
          <CardDescription className="text-center">
            Explore and reserve rooms, labs, or equipment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 w-full">
            {resources.length > 0 ? (
              resources.map((resource) => (
                <ResourceListCard
                  key={resource.id}
                  id={resource.id}
                  name={resource.name}
                  typeLabel={getTypeLabel(resource.type)}
                  statusLabel={getStatusLabel(resource.status)}
                  isActive={resource.status === 'ACTIVE'}
                  location={resource.location}
                  capacity={resource.capacity}
                  imageUrl={resource.imageUrl}
                  hasImageError={false}
                />
              ))
            ) : (
              <div className="text-center w-full py-24 text-muted-foreground">
                No featured resources available right now.
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="w-full flex justify-center">
          <Button asChild className="object-center w-50">
            <Link href="/resources">View All</Link>
          </Button>
        </CardFooter>
      </Card>

      <FAQsThree />
      <Separator />
    </main>
  )
}

type FAQItem = {
  id: string
  icon: IconName
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    id: 'item-1',
    icon: 'calendar',
    question: 'How do I reserve a room?',
    answer:
      'Visit the campus resources page, choose the room you need, and submit a booking request with your preferred date and time.',
  },
  {
    id: 'item-2',
    icon: 'message-square',
    question: 'Can I get help from the AI assistant?',
    answer:
      'Yes — the campus chat assistant can answer questions about availability, building locations, services, and support hours.',
  },
  {
    id: 'item-3',
    icon: 'shield-check',
    question: 'Who can manage resource access?',
    answer:
      'Administrators can keep resource data in sync and approve requests through the admin dashboard.',
  },
  {
    id: 'item-4',
    icon: 'book-open',
    question: 'What types of campus resources are supported?',
    answer:
      'The platform supports rooms, labs, equipment, and scheduling tools for students, faculty, and staff.',
  },
]

function FAQsThree() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:gap-16">
          <div className="md:w-1/3">
            <div className="sticky top-20">
              <h2 className="mt-4 text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground mt-4">
                Can't find what you're looking for? Contact our{' '}
                <Link href="#" className="text-primary font-medium hover:underline">
                  customer support team
                </Link>
              </p>
            </div>
          </div>
          <div className="md:w-2/3">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="bg-background shadow-xs rounded-lg border px-4 last:border-b"
                >
                  <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="flex size-6">
                        <DynamicIcon name={item.icon} className="m-auto size-4" />
                      </div>
                      <span className="text-base">{item.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <div className="px-9">
                      <p className="text-base">{item.answer}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className="py-20">
      <div className="@container mx-auto px-3">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-semibold lg:text-4xl">Streamline Campus Life</h2>
          <p className="mt-4 text-muted-foreground">Everything you need to manage space, report issues, and get instant support.</p>
        </div>
        <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <CalendarDays className="size-6 text-primary" aria-hidden />
              </CardDecorator>
              <h3 className="mt-6 font-medium">Smart Reservations</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Easily book study rooms, labs, and equipment in real-time with an intuitive campus-wide calendar.
              </p>
            </CardContent>
          </Card>

          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Ticket className="size-6 text-primary" aria-hidden />
              </CardDecorator>
              <h3 className="mt-6 font-medium">Report Incidents</h3>
            </CardHeader>
            <CardContent>
              <p className="mt-3 text-sm text-muted-foreground">
                Spotted an issue? Submit a ticket instantly. Track the status of your reports from submission to resolution.
              </p>
            </CardContent>
          </Card>

          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <MessageSquare className="size-6 text-primary" aria-hidden />
              </CardDecorator>
              <h3 className="mt-6 font-medium">24/7 AI Assistant</h3>
            </CardHeader>
            <CardContent>
              <p className="mt-3 text-sm text-muted-foreground">
                Interact with our AI to check availability, or find answers to frequently asked questions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[24px_24px] dark:opacity-50"
    />
    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">
      {children}
    </div>
  </div>
)
