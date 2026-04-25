'use client'

import { HomeAdminPageAccessBtn } from '@/components/custom/HomeAdminPageAccessBtn'
import { HomeImageSlider } from '@/components/custom/HomeImageSlider'
import React, { useEffect, useState } from 'react'
import { LoaderOne } from "@/components/ui/loader";



function getTypeLabel(type: string) {
  switch (type) {
    case "ROOM":
      return "Room"
    case "LAB":
      return "Lab"
    case "EQUIPMENT":
      return "Equipment"
    default:
      return type
  }
}

function getStatusLabel(status: string) {
  return status === "OUT_OF_SERVICE" ? "Out of Service" : "Active"
}


interface Resource {
  id: string
  name: string
  type: "ROOM" | "LAB" | "EQUIPMENT" | string
  capacity: number | null
  location: string
  status: "ACTIVE" | "OUT_OF_SERVICE" | string
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
  status: "success" | "error" | string
}



const page = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(4)
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const router = useRouter();


  useEffect(() => {

    const fetchResources = async () => {
      setLoading(true)
      try {
        const query = new URLSearchParams({
          page: String(currentPage),
          limit: String(rowsPerPage),
        })
        const response = await fetch(`/api/resources?${query.toString()}`, {
          method: "GET",
        })

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`)
        }

        const result: ResourceResponse = await response.json()
        if (result.status === "success" && result.data) {
          setResources(result.data.items)
          setImageErrors({})
        }
        else {
          toast.warning("Received an unexpected response format.")
        }
      }
      catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to connect to the server"
        console.error("Error fetching resources:", error)
        toast.error(message)
      } finally {
        setLoading(false)
      }

    }
    fetchResources()
  }, [])
  return (
    <main>
      <HomeAdminPageAccessBtn />
      <HomeImageSlider />
      <Features />
      <Card className='m-5 py-20'>
        <CardHeader className='mb-5'>
          <CardTitle className='text-3xl font-semibold lg:text-4xl text-center'>
            Book a Resource
          </CardTitle>
          <CardDescription className='text-center'>Explore and reserve rooms, labs, or equipment.</CardDescription>
        </CardHeader>
        <CardContent>


          {!loading ? (
            <div className='grid grid-cols-2 gap-6 w-full'>

              {resources.map((resource) => (
                <ResourceListCard
                  key={resource.id}
                  id={resource.id}
                  name={resource.name}
                  typeLabel={getTypeLabel(resource.type)}
                  statusLabel={getStatusLabel(resource.status)}
                  isActive={resource.status === "ACTIVE"}
                  location={resource.location}
                  capacity={resource.capacity}
                  imageUrl={resource.imageUrl}
                  hasImageError={Boolean(imageErrors[resource.id])}
                  onImageError={() => {
                    setImageErrors((prev) => ({
                      ...prev,
                      [resource.id]: true,
                    }))
                  }}
                />
              ))}
            </div>

          ) : (
            <div className='text-center w-full flex justify-center'><LoaderOne /></div>
          )}



        </CardContent>
        <CardFooter className='w-full flex justify-center'>
          <Button className='object-center w-50' onClick={() => router.push(`/`)}>View All</Button>
        </CardFooter>
      </Card>
      <FAQsThree />
      <Separator />
    </main>
  )
}

export default page






import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import Link from 'next/link'

type FAQItem = {
  id: string
  icon: IconName
  question: string
  answer: string
}

export function FAQsThree() {
  const faqItems: FAQItem[] = [
    {
      id: 'item-1',
      icon: 'calendar',
      question: "How do I reserve a room?",
      answer: "Visit the campus resources page, choose the room you need, and submit a booking request with your preferred date and time.",
    },
    {
      id: 'item-2',
      icon: 'message-square',
      question: "Can I get help from the AI assistant?",
      answer: "Yes — the campus chat assistant can answer questions about availability, building locations, services, and support hours.",
    },
    {
      id: 'item-3',
      icon: 'shield-check',
      question: "Who can manage resource access?",
      answer: "Administrators can keep resource data in sync and approve requests through the admin dashboard.",
    },
    {
      id: 'item-4',
      icon: 'book-open',
      question: "What types of campus resources are supported?",
      answer: "The platform supports rooms, labs, equipment, and scheduling tools for students, faculty, and staff.",
    },
  ];

  return (
    <section className=" py-20">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:gap-16">
          <div className="md:w-1/3">
            <div className="sticky top-20">
              <h2 className="mt-4 text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground mt-4">
                Can't find what you're looking for? Contact our{' '}
                <Link
                  href="#"
                  className="text-primary font-medium hover:underline">
                  customer support team
                </Link>
              </p>
            </div>
          </div>
          <div className="md:w-2/3">
            <Accordion
              type="single"
              collapsible
              className="w-full space-y-2">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="bg-background shadow-xs rounded-lg border px-4 last:border-b">
                  <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="flex size-6">
                        <DynamicIcon
                          name={item.icon}
                          className="m-auto size-4"
                        />
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



import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, MessageSquare, Ticket } from 'lucide-react'
import { ReactNode } from 'react'
import { toast } from 'sonner'
import { ResourceListCard } from '@/components/custom/ResourceListCard'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

export function Features() {
  return (
    <section className="py-20 ">
      <div className="@container mx-auto px-3">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-semibold lg:text-4xl">Streamline Campus Life</h2>
          <p className="mt-4 text-muted-foreground">Everything you need to manage space, report issues, and get instant support.</p>
        </div>
        <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">

          {/* Feature 1: Resource Booking */}
          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <CalendarDays
                  className="size-6 text-primary"
                  aria-hidden
                />
              </CardDecorator>
              <h3 className="mt-6 font-medium">Smart Reservations</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Easily book study rooms, labs, and equipment in real-time with an intuitive campus-wide calendar.</p>
            </CardContent>
          </Card>

          {/* Feature 2: Incident Reporting */}
          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Ticket
                  className="size-6 text-primary"
                  aria-hidden
                />
              </CardDecorator>
              <h3 className="mt-6 font-medium">Report Incidents</h3>
            </CardHeader>
            <CardContent>
              <p className="mt-3 text-sm text-muted-foreground">Spotted an issue? Submit a ticket instantly. Track the status of your reports from submission to resolution.</p>
            </CardContent>
          </Card>

          {/* Feature 3: AI Interaction */}
          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <MessageSquare
                  className="size-6 text-primary"
                  aria-hidden
                />
              </CardDecorator>
              <h3 className="mt-6 font-medium">24/7 AI Assistant</h3>
            </CardHeader>
            <CardContent>
              <p className="mt-3 text-sm text-muted-foreground">Interact with our AI to check availability, or find answers to frequently asked questions.</p>
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
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50"
    />

    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
  </div>
)



