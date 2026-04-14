import {
  BellIcon,
  CalendarIcon,
  FileTextIcon,
  GlobeIcon,
  InputIcon,
  RadiobuttonIcon,
} from "@radix-ui/react-icons"
import { BentoCard, BentoGrid } from "../ui/bento-grid"
import { NotificationsAnimatedList } from "./NotificationsAnimatedList"
import { BookDownIcon, TicketIcon } from "lucide-react"
import { DotPattern } from "@/components/ui/dot-pattern"
import { HexagonPattern } from "@/components/ui/hexagon-pattern"
import { BackgroundGradientAnimation } from "../ui/background-gradient-animation";


const features = [
  {
    Icon: RadiobuttonIcon,
    name: "AI Chatbot",
    description: "Engage in real-time conversations with our AI.",
    href: "/ai",
    cta: "Chat Now", // Fixed typo "Char"
    background: (
      // <img alt="" className="absolute -top-20 -right-20 opacity-60" />
      <div className="absolute inset-0 z-0  [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
        <BackgroundGradientAnimation size="100%"/>
      </div>
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
      <div className="absolute inset-0 z-0 opacity-90 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
        <DotPattern />
      </div>
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
      <div className="absolute inset-0 z-0 opacity-90 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
        <HexagonPattern />
      </div>
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
      <NotificationsAnimatedList className="absolute top-4 right-2 h-1/2 w-full scale-75 border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90" />
    ),
    className: "lg:col-start-2 lg:col-end-4 lg:row-start-3 lg:row-end-4",
  },
];

export function UserDashboardBento() {
  return (
    <BentoGrid className="lg:grid-rows-1">
      {features.map((feature,index) => (
        <BentoCard key={index} {...feature} />
      ))}
    </BentoGrid>
  )
}
