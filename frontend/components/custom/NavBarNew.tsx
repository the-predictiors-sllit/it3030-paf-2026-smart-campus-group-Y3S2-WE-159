"use client"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { IconMenu2 } from "@tabler/icons-react"
import { MotionConfig } from "motion/react"
import { motion } from "framer-motion"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu"
import Link from "next/link"
import { Logo } from "./Logo"
import { DarkLight } from "./DarkLightBtn"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import { NotificationIcon } from "./NotificationIcon"

const pages = [
  {
    title: "Resources",
    href: "/resources",
  },
  {
    title: "My Bookings",
    href: "/booking",
  },
  {
    title: "My Tickets",
    href: "/tickets",
  },
  // {
  //   title: "Contact Us",
  //   href: "/contactus",
  // },
  {
    title: "Policy",
    href: "/policy",
  },
  {
    title: "Notifications",
    href: "/notifications",
  },
]

const NavBarNew = () => {
  return (
    <main>
      <nav className="flex items-center justify-between px-8 py-4 bg-background/70  backdrop-blur-2xl shadow-lg">
        {/* Logo for mobile */}
        <div className="lg:hidden">
          <Logo />
        </div>
        <section className="hidden items-center gap-7 lg:flex">
          {/* Logo */}
          <div>
            <Logo />
          </div>
          <NavigationMenuLinkComponent />
        </section>
        {/* desktop avatar, notification, theme mode */}
        <section className="hidden lg:block">
          <div className="flex gap-5">
            <NotificationIcon />
            <DarkLight />
            <UserProfile />
          </div>
        </section>

        {/* mobile navigation bar */}
        <section className="block lg:hidden">
          <MobileNavBar />
        </section>
      </nav>
    </main>
  )
}

export default NavBarNew

// -------------------------------------------------------------------------------------------------
// components

export const UserProfile = () => {
  return (
    <section className="flex-coll flex items-center gap-3">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <span className="block lg:hidden">My Name</span>
    </section>
  )
}

export const MobileNavBar = () => {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <motion.div
          whileHover={{ rotate: 180 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Button variant="ghost" size="icon" className="rounded-full">
            <span>
              <IconMenu2 />
            </span>
          </Button>
        </motion.div>
      </DrawerTrigger>
      <DrawerContent className="h-full lg:hidden">
        <DrawerHeader>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerDescription>Description.</DrawerDescription>
        </DrawerHeader>

        {/* navigation links */}
        <div>
          <NavigationMenuLinkComponent />
        </div>

        <DrawerFooter>
          <UserProfile />
          {/* <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose> */}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// Links
export const NavigationMenuLinkComponent = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem className="flex flex-col flex-nowrap gap-5 lg:flex-row">
          {pages.map((link, index) => (
            <NavigationMenuLink
              asChild
              key={index}
              className="bg-transparent transition-all delay-50 duration-100 ease-in-out hover:bg-transparent hover:text-primary hover:underline focus:bg-transparent"
            >
              <Link href={link.href}>{link.title}</Link>
            </NavigationMenuLink>
          ))}
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
