"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
    IconAdjustmentsCheck,
    IconArrowLeft,
    IconBook2,
    IconBrandTabler,
    IconDotsCircleHorizontal,
    IconGridDots,
    IconPackages,
    IconSettings,
    IconTicket,
    IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

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
                icon: (<IconDotsCircleHorizontal className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />)
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
                icon: (<IconDotsCircleHorizontal className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />)
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
                icon: (<IconDotsCircleHorizontal className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />)
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
                icon: (<IconDotsCircleHorizontal className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />)
            },
            {
                label: "Add resources",
                href: "/admin/resources/addResources",
                icon: (<IconDotsCircleHorizontal className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />)
            },
        ],
    },
    {
        label: "Logout",
        href: "/admin",
        icon: (
            <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
        ),
    },
];
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const [open, setOpen] = useState(false);
    return (
        <main >

            <div
                className={cn(
                    "mx-auto flex w-full  flex-1 flex-col overflow-hidden rounded-md border  bg-card/85 md:flex-row   mt-5",
                    "h-[90vh]", // for your use case, use `h-screen` instead of `h-[60vh]`
                )}
            >
                <Sidebar open={open} setOpen={setOpen}  >
                    <SidebarBody className="justify-between gap-10">
                        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                            {open ? <Logo /> : <LogoIcon />}
                            <div className="mt-8 flex flex-col gap-2">
                                {links.map((link, idx) => (
                                    <div key={idx}>
                                        <SidebarLink link={link} />

                                        {open && link.subLink && link.subLink.length > 0 && (
                                            <div className="mt-1 flex flex-col gap-1 ml-8 border-l   pl-2">
                                                {link.subLink.map((sub, sIdx) => (
                                                    <SidebarLink
                                                        key={`sub-${sIdx}`}
                                                        link={sub}
                                                        className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <SidebarLink
                                link={{
                                    label: "Your Name",
                                    href: "#",
                                    icon: (
                                        <img
                                            src="https://images.pexels.com/photos/1827837/pexels-photo-1827837.jpeg"
                                            className="h-7 w-7 shrink-0 rounded-full"
                                            width={50}
                                            height={50}
                                            alt="Avatar"
                                        />
                                    ),
                                }}
                            />
                        </div>
                    </SidebarBody>
                </Sidebar>
                <div className="flex-1 overflow-auto px-5 flex ">
                    {children}
                </div>
            </div>
        </main>
    )
}



export const Logo = () => {
    return (
        <a
            href="#"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
        >
            <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium whitespace-pre text-black dark:text-white"
            >
                Smart Campus
            </motion.span>
        </a>
    );
};
export const LogoIcon = () => {
    return (
        <a
            href="#"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
        >
            <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
        </a>
    );
};