import { BentoCard, BentoGrid } from '@/components/ui/bento-grid'
import React from 'react'
import {
    BellIcon,
    CalendarIcon,
    FileTextIcon,
    GlobeIcon,
    InputIcon,
    RadiobuttonIcon,
} from "@radix-ui/react-icons"
import { BookDownIcon, TicketIcon } from "lucide-react"


const features = [
    {
        Icon: RadiobuttonIcon,
        name: "AI Chatbot",
        description: "Engage in real-time conversations with our AI.",
        href: "",
        cta: "",
        background: (
            <img alt="" className="absolute -top-20 -right-20 opacity-60" />

        ),
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
        Icon: BookDownIcon,
        name: "My Bookings",
        description: "Manage all of your resource bookings in one place.",
        href: "/booking",
        cta: "Learn more",
        background: (
            <img alt="" className="absolute -top-20 -right-20 opacity-60" />
        ),

        className: "lg:col-start-1 lg:col-end-3 lg:row-start-1 lg:row-end-3",
    },
    {
        Icon: TicketIcon,
        name: "My Tickets",
        description: "Track and view all of your incident tickets.",
        href: "/tickets",
        cta: "Learn more",
        background: (
            <img alt="" className="absolute -top-20 -right-20 opacity-60" />
        ),
        className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-3",
    },
    {
        Icon: BellIcon,
        name: "Notifications",
        description: "Stay updated with your latest alerts and activities.",
        href: "/notifications",
        cta: "View all",
        background: (
            <img alt="" className="absolute -top-20 -right-20 opacity-60" />
        ),
        className: "lg:col-start-2 lg:col-end-4 lg:row-start-3 lg:row-end-4",
    },
    {
        Icon: BellIcon,
        name: "Notifications",
        description: "Stay updated with your latest alerts and activities.",
        href: "/notifications",
        cta: "View all",
        background: (
            <img alt="" className="absolute -top-20 -right-20 opacity-60" />
        ),
        className: "lg:col-start-4 lg:col-end-5 lg:row-start-1 lg:row-end-4",
    },
];

const page = () => {
    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <section className="w-full">
                <div className='mb-10'><h1 className=' text-2xl'>Welcome!</h1></div>
                <BentoGrid className="lg:grid-rows-1">
                    {features.map((feature, index) => (
                        <BentoCard key={index} {...feature} />
                    ))}
                </BentoGrid>
            </section>
        </div>
    )
}

export default page