import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HomeAdminPageAccessBtn } from "@/components/custom/HomeAdminPageAccessBtn"
import { HomeImageSlider } from "@/components/custom/HomeImageSlider"
import { SERVER_API_URL } from "@/lib/api-client"
import { auth0 } from "@/lib/auth0"
import { ChevronRight, Settings2, Sparkles, Zap, BookOpen, MessageSquare, ShieldCheck } from "lucide-react"
import { ReactNode } from "react"

type BackendProfileResponse = {
  status: "success"
  data: {
    id: number | string
    name: string
    email: string
    role: string
  }
}

type ResourcePreview = {
  name: string
  type: string
  location: string
  capacity: number
  status: string
}

const featuredResources: ResourcePreview[] = [
  {
    name: "Room 204 - Engineering Lab",
    type: "Lab",
    location: "Science Building",
    capacity: 24,
    status: "Available",
  },
  {
    name: "Conference Room A",
    type: "Room",
    location: "Administration Wing",
    capacity: 12,
    status: "Available",
  },
  {
    name: "3D Printer Suite",
    type: "Equipment",
    location: "Innovation Center",
    capacity: 8,
    status: "Active",
  },
]

const faqItems = [
  {
    question: "How do I reserve a room?",
    answer:
      "Visit the campus resources page, choose the room you need, and submit a booking request with your preferred date and time.",
  },
  {
    question: "Can I get help from the AI assistant?",
    answer:
      "Yes — the campus chat assistant can answer questions about availability, building locations, services, and support hours.",
  },
  {
    question: "Who can manage resource access?",
    answer:
      "Administrators can keep resource data in sync and approve requests through the admin dashboard.",
  },
  {
    question: "What types of campus resources are supported?",
    answer:
      "The platform supports rooms, labs, equipment, and scheduling tools for students, faculty, and staff.",
  },
]

const page = async () => {
  const session = await auth0.getSession()
  if (!session?.user) {
    redirect("/auth/login")
  }

  try {
    const { token } = await auth0.getAccessToken()

    await fetch(`${SERVER_API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
  } catch (error) {
    console.error("Failed to load backend profile: ", error)
  }

  return (
    <main className="space-y-24 py-6 lg:py-10">
      <section className="overflow-hidden rounded-[2.5rem] bg-primary/5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">Smart Campus</span>
                <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary-foreground">AI-powered bookings</span>
              </div>
              <div className="space-y-6">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                  Manage campus resources, room bookings and intelligent support from one dashboard.
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Smart Campus combines rooms, labs, equipment and an AI chat assistant to help students, faculty and staff book spaces faster and stay connected.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/resources">Browse Resources</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/ai">Open AI Chat</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border border-border bg-background p-6 shadow-sm">
                <CardHeader className="gap-3 px-0 pb-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="size-5 text-primary" />
                    <CardTitle className="text-lg">Campus Snapshot</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-0">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-primary/10 p-4">
                      <p className="text-sm text-muted-foreground">Upcoming bookings</p>
                      <p className="mt-2 text-2xl font-semibold">14</p>
                    </div>
                    <div className="rounded-3xl bg-secondary/10 p-4">
                      <p className="text-sm text-muted-foreground">Available resources</p>
                      <p className="mt-2 text-2xl font-semibold">32</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Active labs</p>
                      <p className="mt-2 text-2xl font-semibold">9</p>
                    </div>
                    <div className="rounded-3xl bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Support chats</p>
                      <p className="mt-2 text-2xl font-semibold">7</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 rounded-3xl border border-border bg-background p-6 text-sm text-muted-foreground shadow-sm">
                <div className="flex items-center gap-3 text-primary">
                  <MessageSquare className="size-5" />
                  <span className="font-semibold">Campus AI Assistant</span>
                </div>
                <p>
                  Ask the AI chatbot for resource availability, directions, or event support — then act on results directly from the dashboard.
                </p>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/ai">Launch Chat</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-50 py-16 md:py-28 dark:bg-transparent">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Built to support your campus operations</h2>
            <p className="mt-4 text-base text-muted-foreground">
              A modern campus platform for bookings, resource management, and AI-powered campus support.
            </p>
          </div>

          <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
            <FeatureCard icon={Zap} title="Flexible bookings" description="Reserve rooms, labs, and equipment with an intuitive interface built for students and staff." />
            <FeatureCard icon={Settings2} title="Full control" description="Admin tools let staff update availability, approve requests, and manage campus resources." />
            <FeatureCard icon={Sparkles} title="AI campus support" description="The built-in chat assistant helps people find resources, directions, and answers immediately." />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Featured resources</p>
              <h2 className="text-3xl font-semibold sm:text-4xl">Browse resource types for your next campus booking.</h2>
              <p className="max-w-2xl text-base text-muted-foreground">
                Discover rooms, labs, and equipment with capacity, location, and availability details right from the home page.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild size="sm" variant="secondary">
                <Link href="/resources">View all resources</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/resources">Explore catalog</Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featuredResources.map((resource) => (
              <Card key={resource.name} className="border border-border bg-background shadow-sm">
                <CardHeader className="px-6 pb-4 pt-5">
                  <CardTitle className="text-base">{resource.name}</CardTitle>
                  <CardDescription>{resource.type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-6 pb-6">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Location:</span> {resource.location}</p>
                    <p><span className="font-medium text-foreground">Capacity:</span> {resource.capacity}</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-sm font-medium text-primary">
                    {resource.status}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-28 bg-muted dark:bg-background">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-6 md:grid-cols-2 md:gap-12">
            <div>
              <h2 className="text-4xl font-medium">The smart campus ecosystem brings resources, people, and AI together.</h2>
            </div>
            <div className="space-y-6">
              <p>
                Smart Campus is designed to help students and staff find the right room, equipment or lab space quickly and reliably. It supports an entire operational workflow from discovery to booking and follow-up support.
              </p>
              <p>
                Use the AI assistant to get instant answers about availability, campus directions, or booking policies. Then move from chat to action with campus resources at your fingertips.
              </p>
              <Button asChild variant="secondary" size="sm" className="gap-1 pr-1.5">
                <Link href="/ai">Start AI help</Link>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">Frequently asked questions</h2>
            <p className="mt-4 text-base text-muted-foreground">
              Answers for booking, support, and campus resource management.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {faqItems.map((item) => (
              <Card key={item.question} className="border border-border bg-background shadow-sm">
                <CardContent className="space-y-3 px-6 py-6">
                  <div className="flex items-center gap-3 text-primary">
                    <ShieldCheck className="size-4" />
                    <h3 className="text-base font-semibold">{item.question}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <HomeAdminPageAccessBtn />
        <div className="mt-10">
          <HomeImageSlider />
        </div>
      </section>
    </main>
  )
}

export default page

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Zap
  title: string
  description: string
}) {
  return (
    <Card className="group shadow-zinc-950/5">
      <CardHeader className="pb-3 px-6">
        <CardDecorator>
          <Icon className="size-6" aria-hidden />
        </CardDecorator>
        <CardTitle className="mt-6 font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function CardDecorator({ children }: { children: ReactNode }) {
  return (
    <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50"
      />

      <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">
        {children}
      </div>
    </div>
  )
}














// import Link from "next/link"
// import { redirect } from "next/navigation"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { HomeAdminPageAccessBtn } from "@/components/custom/HomeAdminPageAccessBtn"
// import { HomeImageSlider } from "@/components/custom/HomeImageSlider"
// import { SERVER_API_URL } from "@/lib/api-client"
// import { auth0 } from "@/lib/auth0"
// import { ChevronRight, Settings2, Sparkles, Zap, BookOpen, MessageSquare, ShieldCheck } from "lucide-react"
// import { ReactNode } from "react"

// type BackendProfileResponse = {
//   status: "success"
//   data: {
//     id: number | string
//     name: string
//     email: string
//     role: string
//   }
// }

// type ResourcePreview = {
//   name: string
//   type: string
//   location: string
//   capacity: number
//   status: string
// }

// const featuredResources: ResourcePreview[] = [
//   {
//     name: "Room 204 - Engineering Lab",
//     type: "Lab",
//     location: "Science Building",
//     capacity: 24,
//     status: "Available",
//   },
//   {
//     name: "Conference Room A",
//     type: "Room",
//     location: "Administration Wing",
//     capacity: 12,
//     status: "Available",
//   },
//   {
//     name: "3D Printer Suite",
//     type: "Equipment",
//     location: "Innovation Center",
//     capacity: 8,
//     status: "Active",
//   },
// ]

// const faqItems = [
//   {
//     question: "How do I reserve a room?",
//     answer:
//       "Visit the campus resources page, choose the room you need, and submit a booking request with your preferred date and time.",
//   },
//   {
//     question: "Can I get help from the AI assistant?",
//     answer:
//       "Yes — the campus chat assistant can answer questions about availability, building locations, services, and support hours.",
//   },
//   {
//     question: "Who can manage resource access?",
//     answer:
//       "Administrators can keep resource data in sync and approve requests through the admin dashboard.",
//   },
//   {
//     question: "What types of campus resources are supported?",
//     answer:
//       "The platform supports rooms, labs, equipment, and scheduling tools for students, faculty, and staff.",
//   },
// ]

// const page = async () => {
//   const session = await auth0.getSession()
//   if (!session?.user) {
//     redirect("/auth/login")
//   }

//   try {
//     const { token } = await auth0.getAccessToken()

//     await fetch(`${SERVER_API_URL}/api/auth/register`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       cache: "no-store",
//     })
//   } catch (error) {
//     console.error("Failed to load backend profile: ", error)
//   }

//   return (
//     <main className="space-y-24 py-6 lg:py-10">
//       <section className="overflow-hidden rounded-[2.5rem] bg-primary/5 py-16 md:py-24">
//         <div className="mx-auto max-w-6xl px-6">
//           <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
//             <div className="space-y-8">
//               <div className="flex flex-wrap items-center gap-3">
//                 <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">Smart Campus</span>
//                 <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary-foreground">AI-powered bookings</span>
//               </div>
//               <div className="space-y-6">
//                 <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
//                   Manage campus resources, room bookings and intelligent support from one dashboard.
//                 </h1>
//                 <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
//                   Smart Campus combines rooms, labs, equipment and an AI chat assistant to help students, faculty and staff book spaces faster and stay connected.
//                 </p>
//               </div>

//               <div className="flex flex-wrap gap-4">
//                 <Button asChild size="lg">
//                   <Link href="/resources">Browse Resources</Link>
//                 </Button>
//                 <Button asChild size="lg" variant="outline">
//                   <Link href="/ai">Open AI Chat</Link>
//                 </Button>
//               </div>
//             </div>

//             <div className="space-y-6">
//               <Card className="border border-border bg-background p-6 shadow-sm">
//                 <CardHeader className="gap-3 px-0 pb-4">
//                   <div className="flex items-center gap-3">
//                     <BookOpen className="size-5 text-primary" />
//                     <CardTitle className="text-lg">Campus Snapshot</CardTitle>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="space-y-4 px-0">
//                   <div className="grid gap-3 sm:grid-cols-2">
//                     <div className="rounded-3xl bg-primary/10 p-4">
//                       <p className="text-sm text-muted-foreground">Upcoming bookings</p>
//                       <p className="mt-2 text-2xl font-semibold">14</p>
//                     </div>
//                     <div className="rounded-3xl bg-secondary/10 p-4">
//                       <p className="text-sm text-muted-foreground">Available resources</p>
//                       <p className="mt-2 text-2xl font-semibold">32</p>
//                     </div>
//                   </div>
//                   <div className="grid gap-3 sm:grid-cols-2">
//                     <div className="rounded-3xl bg-muted p-4">
//                       <p className="text-sm text-muted-foreground">Active labs</p>
//                       <p className="mt-2 text-2xl font-semibold">9</p>
//                     </div>
//                     <div className="rounded-3xl bg-muted p-4">
//                       <p className="text-sm text-muted-foreground">Support chats</p>
//                       <p className="mt-2 text-2xl font-semibold">7</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <div className="grid gap-4 rounded-3xl border border-border bg-background p-6 text-sm text-muted-foreground shadow-sm">
//                 <div className="flex items-center gap-3 text-primary">
//                   <MessageSquare className="size-5" />
//                   <span className="font-semibold">Campus AI Assistant</span>
//                 </div>
//                 <p>
//                   Ask the AI chatbot for resource availability, directions, or event support — then act on results directly from the dashboard.
//                 </p>
//                 <Button asChild variant="secondary" size="sm">
//                   <Link href="/ai">Launch Chat</Link>
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="bg-zinc-50 py-16 md:py-28 dark:bg-transparent">
//         <div className="mx-auto max-w-5xl px-6">
//           <div className="text-center">
//             <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Built to support your campus operations</h2>
//             <p className="mt-4 text-base text-muted-foreground">
//               A modern campus platform for bookings, resource management, and AI-powered campus support.
//             </p>
//           </div>

//           <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
//             <FeatureCard icon={Zap} title="Flexible bookings" description="Reserve rooms, labs, and equipment with an intuitive interface built for students and staff." />
//             <FeatureCard icon={Settings2} title="Full control" description="Admin tools let staff update availability, approve requests, and manage campus resources." />
//             <FeatureCard icon={Sparkles} title="AI campus support" description="The built-in chat assistant helps people find resources, directions, and answers immediately." />
//           </div>
//         </div>
//       </section>

//       <section className="py-16 md:py-28">
//         <div className="mx-auto max-w-6xl px-6">
//           <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
//             <div className="space-y-4">
//               <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Featured resources</p>
//               <h2 className="text-3xl font-semibold sm:text-4xl">Browse resource types for your next campus booking.</h2>
//               <p className="max-w-2xl text-base text-muted-foreground">
//                 Discover rooms, labs, and equipment with capacity, location, and availability details right from the home page.
//               </p>
//             </div>
//             <div className="flex items-center gap-3">
//               <Button asChild size="sm" variant="secondary">
//                 <Link href="/resources">View all resources</Link>
//               </Button>
//               <Button asChild size="sm" variant="outline">
//                 <Link href="/resources">Explore catalog</Link>
//               </Button>
//             </div>
//           </div>

//           <div className="mt-10 grid gap-6 md:grid-cols-3">
//             {featuredResources.map((resource) => (
//               <Card key={resource.name} className="border border-border bg-background shadow-sm">
//                 <CardHeader className="px-6 pb-4 pt-5">
//                   <CardTitle className="text-base">{resource.name}</CardTitle>
//                   <CardDescription>{resource.type}</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4 px-6 pb-6">
//                   <div className="space-y-1 text-sm text-muted-foreground">
//                     <p><span className="font-medium text-foreground">Location:</span> {resource.location}</p>
//                     <p><span className="font-medium text-foreground">Capacity:</span> {resource.capacity}</p>
//                   </div>
//                   <div className="rounded-2xl bg-primary/10 p-3 text-sm font-medium text-primary">
//                     {resource.status}
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section className="py-16 md:py-28 bg-muted dark:bg-background">
//         <div className="mx-auto max-w-5xl px-6">
//           <div className="grid gap-6 md:grid-cols-2 md:gap-12">
//             <div>
//               <h2 className="text-4xl font-medium">The smart campus ecosystem brings resources, people, and AI together.</h2>
//             </div>
//             <div className="space-y-6">
//               <p>
//                 Smart Campus is designed to help students and staff find the right room, equipment or lab space quickly and reliably. It supports an entire operational workflow from discovery to booking and follow-up support.
//               </p>
//               <p>
//                 Use the AI assistant to get instant answers about availability, campus directions, or booking policies. Then move from chat to action with campus resources at your fingertips.
//               </p>
//               <Button asChild variant="secondary" size="sm" className="gap-1 pr-1.5">
//                 <Link href="/ai">Start AI help</Link>
//                 <ChevronRight className="size-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="py-16 md:py-28">
//         <div className="mx-auto max-w-5xl px-6">
//           <div className="text-center">
//             <h2 className="text-3xl font-semibold">Frequently asked questions</h2>
//             <p className="mt-4 text-base text-muted-foreground">
//               Answers for booking, support, and campus resource management.
//             </p>
//           </div>

//           <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {faqItems.map((item) => (
//               <Card key={item.question} className="border border-border bg-background shadow-sm">
//                 <CardContent className="space-y-3 px-6 py-6">
//                   <div className="flex items-center gap-3 text-primary">
//                     <ShieldCheck className="size-4" />
//                     <h3 className="text-base font-semibold">{item.question}</h3>
//                   </div>
//                   <p className="text-sm text-muted-foreground">{item.answer}</p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section className="mx-auto max-w-6xl px-6">
//         <HomeAdminPageAccessBtn />
//         <div className="mt-10">
//           <HomeImageSlider />
//         </div>
//       </section>
//     </main>
//   )
// }

// export default page

// function FeatureCard({
//   icon: Icon,
//   title,
//   description,
// }: {
//   icon: typeof Zap
//   title: string
//   description: string
// }) {
//   return (
//     <Card className="group shadow-zinc-950/5">
//       <CardHeader className="pb-3 px-6">
//         <CardDecorator>
//           <Icon className="size-6" aria-hidden />
//         </CardDecorator>
//         <CardTitle className="mt-6 font-medium">{title}</CardTitle>
//       </CardHeader>
//       <CardContent className="px-6">
//         <p className="text-sm text-muted-foreground">{description}</p>
//       </CardContent>
//     </Card>
//   )
// }

// function CardDecorator({ children }: { children: ReactNode }) {
//   return (
//     <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
//       <div
//         aria-hidden
//         className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50"
//       />

//       <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">
//         {children}
//       </div>
//     </div>
//   )
// }
