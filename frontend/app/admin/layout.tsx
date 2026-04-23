"use client"
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
  IconArrowLeft,
  IconBook2,
  IconDotsCircleHorizontal,
  IconGridDots,
  IconHome2,
  IconPackages,
  IconTicket,
  IconUserBolt,
} from "@tabler/icons-react"
import { motion } from "motion/react"
import React, { useState } from "react"

const links = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <IconGridDots className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: (
      <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    subLink: [
      {
        label: "Manage users",
        href: "/admin/users/manageUsers",
        icon: (
          <IconDotsCircleHorizontal className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
        ),
      },
    ],
  },
  {
    label: "Bookings",
    href: "/admin/booking",
    icon: (
      <IconBook2 className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    subLink: [
      {
        label: "Manage all bookings",
        href: "/admin/booking/viewBookings",
        icon: (
          <IconDotsCircleHorizontal className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
        ),
      },
    ],
  },
  {
    label: "Tickets",
    href: "/admin/tickets",
    icon: (
      <IconTicket className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    subLink: [
      {
        label: "Manage all tickets",
        href: "/admin/tickets/viewTickets",
        icon: (
          <IconDotsCircleHorizontal className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
        ),
      },
    ],
  },
  {
    label: "Resources",
    href: "/admin/resources",
    icon: (
      <IconPackages className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    subLink: [
      {
        label: "Manage all resources",
        href: "/admin/resources/viewResources",
        icon: (
          <IconDotsCircleHorizontal className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
        ),
      },
      {
        label: "Add resources",
        href: "/admin/resources/addResources",
        icon: (
          <IconDotsCircleHorizontal className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
        ),
      },
    ],
  },
  {
    label: "Home",
    href: "/",
    icon: (
      <IconHome2 className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
]
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [open, setOpen] = useState(false)
  return (
    <main>
      <div
        className={cn(
          "mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md bg-card/85 md:flex-row",
          "h-full" // for your use case, use `h-screen` instead of `h-[60vh]`
        )}
      >
        <Sidebar open={open} setOpen={setOpen} >
          <SidebarBody className="justify-between gap-10">
            <div className="fixed top-20 flex h-full flex-1 flex-col overflow-x-hidden overflow-y-auto">
              <div className="flex w-full flex-col gap-2">
                {links.map((link, idx) => (
                  <div key={idx}>
                    <SidebarLink link={link} />

                    {open && link.subLink && link.subLink.length > 0 && (
                      <div className="mt-1 ml-8 flex flex-col gap-1 border-l pl-2">
                        {link.subLink.map((sub, sIdx) => (
                          <SidebarLink
                            key={`sub-${sIdx}`}
                            link={sub}
                            className="text-sm opacity-70 transition-opacity hover:opacity-100"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
        <div className="flex flex-1 overflow-auto px-5">{children}</div>
      </div>
    </main>
  )
}
