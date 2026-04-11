"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, ChevronDown } from "lucide-react"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useAuth } from "@/lib/auth-context"
import { UserRole } from "@/lib/roles"
            import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"



// Navigation items with role requirements
interface NavItem {
    title: string
    href: string
    description: string
    roles?: UserRole[]  // undefined = visible to all authenticated users
}

interface NavSection {
    label: string
    href?: string
    items: NavItem[]
    roles?: UserRole[]  // undefined = visible to all authenticated users
}

const UserManagement: NavItem[] = [
    {
        title: "View Users",
        href: "/admin/users",
        description: "Manager all users in the system",
        roles: [UserRole.ADMIN],
    },
    {
        title: "Assign Roles",
        href: "/admin/roles",
        description: "Assign and manage user roles",
        roles: [UserRole.ADMIN],
    },
    {
        title: "User Profile",
        href: "/user/profile",
        description: "View and edit your profile",
        // roles undefined = all authenticated users
    },
]

const Facilities_Assets: NavItem[] = [
    {
        title: "Resources Catalogue",
        href: "/resources",
        description: "Browse All Resources",
        // roles undefined = all authenticated users
    },
    {
        title: "Resource Management",
        href: "/resources/admin",
        description: "Manage facilities and resources",
        roles: [UserRole.ADMIN, UserRole.TECHNICIAN],
    },
]

const Booking_resource: NavItem[] = [
    {
        title: "My Bookings",
        href: "/booking",
        description: "View your bookings",
        // roles undefined = all authenticated users
    },
]

const Incident: NavItem[] = [
    {
        title: "My Tickets",
        href: "/tickets",
        description: "Report an incident or issue",
    },
    {
        title: "Manage Tickets",
        href: "/technician/tickets",
        description: "Manage all support tickets",
        roles: [UserRole.ADMIN, UserRole.TECHNICIAN],
    },
]





export const PageNavigation = () => {
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const [openSection, setOpenSection] = React.useState<string | null>(null)
    const { roles, loading } = useAuth()

    const toggleSection = (section: string) => {
        setOpenSection((prev) => (prev === section ? null : section))
    }

    // All navigation sections with role requirements
    const allNavSections: NavSection[] = [
        { label: "User Management", items: UserManagement, roles: [UserRole.ADMIN] },
        { label: "Facilities & Assets", items: Facilities_Assets },
        { label: "Resource Booking", items: Booking_resource },
        { label: "Incident Reports", items: Incident },
    ]

    /**
     * Check if user has access to a navigation item or section
     * If no roles are specified, all authenticated users can access
     */
    const hasAccess = (requiredRoles?: UserRole[]): boolean => {
        if (!requiredRoles) return true // No role requirement = all can access
        return requiredRoles.some(role => roles.includes(role))
    }

    /**
     * Filter section items based on user roles
     */
    const getVisibleItems = (items: NavItem[]): NavItem[] => {
        return items.filter(item => hasAccess(item.roles))
    }

    /**
     * Filter sections based on user roles
     */
    const getVisibleSections = (sections: NavSection[]): NavSection[] => {
        return sections
            .filter(section => hasAccess(section.roles))
            .map(section => ({
                ...section,
                items: getVisibleItems(section.items),
            }))
            .filter(section => section.items.length > 0) // Hide sections with no items
    }

    const navSections = getVisibleSections(allNavSections)

    // Show loading state
    if (loading) {
        // return <div className="text-sm text-muted-foreground">Loading navigation...</div>
        return(
            <div className="hidden lg:flex lg:flex-row lg:gap-3">
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-5 w-[100px]" />
            </div>
        )
    }

    return (
        <>
            {/* ── Desktop Navigation (lg+) ── */}
            <div className="hidden lg:block">
                <NavigationMenu>
                    <NavigationMenuList>
                        {navSections.map(({ label, items }) => (
                            <NavigationMenuItem key={label}>
                                <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w[600px]">
                                        {items.map((item) => (
                                            <ListItem key={item.title} title={item.title} href={item.href}>
                                                {item.description}
                                            </ListItem>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        ))}
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <Link href="/docs">Contact Us</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            {/* ── Mobile Hamburger Button (below lg) ── */}
            <div className="lg:hidden">
                <button
                    onClick={() => setMobileOpen((prev) => !prev)}
                    className="p-2 rounded-md"
                    aria-label="Toggle navigation"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* ── Mobile Dropdown Panel ── */}
            {mobileOpen && (
                <div className="lg:hidden absolute top-[65px] left-0 w-full border-b z-50 bg-background shadow-md px-4 py-4 flex flex-col gap-1">
                    {navSections.map(({ label, items }) => (
                        <div key={label} className="border-b last:border-none">
                            <button
                                onClick={() => toggleSection(label)}
                                className="w-full flex items-center justify-between py-3 text-sm font-medium"
                            >
                                {label}
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform duration-200 ${openSection === label ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {openSection === label && (
                                <ul className="flex flex-col gap-1 pb-3 pl-2">
                                    {items.map((item) => (
                                        <li key={item.title}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                className="block py-2 px-3 rounded-md text-sm hover:bg-accent"
                                            >
                                                <div className="font-medium">{item.title}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">
                                                    {item.description}
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                    <Link
                        href="/notifications"
                        onClick={() => setMobileOpen(false)}
                        className="py-3 text-sm font-medium"
                    >
                        Notifications
                    </Link>
                    <Separator />
                    <Link
                        href="/docs"
                        onClick={() => setMobileOpen(false)}
                        className="py-3 text-sm font-medium"
                    >
                        Contact Us
                    </Link>
                </div>
            )}
        </>
    )
}









// export const PageNavigation = () => {
//     return (
//         <NavigationMenu>
//             <NavigationMenuList>
//                 <NavigationMenuItem className="hidden md:flex">
//                     <NavigationMenuTrigger>User Management</NavigationMenuTrigger>
//                     <NavigationMenuContent>
//                         <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
//                             {UserManagement.map((UserManagement) => (
//                                 <ListItem
//                                     key={UserManagement.title}
//                                     title={UserManagement.title}
//                                     href={UserManagement.href}
//                                 >
//                                     {UserManagement.description}
//                                 </ListItem>
//                             ))}
//                         </ul>
//                     </NavigationMenuContent>
//                 </NavigationMenuItem>
//                 <NavigationMenuItem className="hidden md:flex">
//                     <NavigationMenuTrigger>Facilities & Assets</NavigationMenuTrigger>
//                     <NavigationMenuContent>
//                         <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
//                             {Facilities_Assets.map((Facilities_Assets) => (
//                                 <ListItem
//                                     key={Facilities_Assets.title}
//                                     title={Facilities_Assets.title}
//                                     href={Facilities_Assets.href}
//                                 >
//                                     {Facilities_Assets.description}
//                                 </ListItem>
//                             ))}
//                         </ul>
//                     </NavigationMenuContent>
//                 </NavigationMenuItem>
//                 <NavigationMenuItem>
//                     <NavigationMenuTrigger>Resource Booking</NavigationMenuTrigger>
//                     <NavigationMenuContent>
//                         <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
//                             {Booking_resource.map((Booking_resource) => (
//                                 <ListItem
//                                     key={Booking_resource.title}
//                                     title={Booking_resource.title}
//                                     href={Booking_resource.href}
//                                 >
//                                     {Booking_resource.description}
//                                 </ListItem>
//                             ))}
//                         </ul>
//                     </NavigationMenuContent>

//                 </NavigationMenuItem>
//                 <NavigationMenuItem>
//                     <NavigationMenuTrigger>Incident Reports</NavigationMenuTrigger>
//                     <NavigationMenuContent>
//                         <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
//                             {Incident.map((Incident) => (
//                                 <ListItem
//                                     key={Incident.title}
//                                     title={Incident.title}
//                                     href={Incident.href}
//                                 >
//                                     {Incident.description}
//                                 </ListItem>
//                             ))}
//                         </ul>
//                     </NavigationMenuContent>

//                 </NavigationMenuItem>
//                 <NavigationMenuItem>
//                     <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
//                         <Link href="/docs">Contact Us</Link>
//                     </NavigationMenuLink>
//                 </NavigationMenuItem>
//             </NavigationMenuList>
//         </NavigationMenu>
//     )
// }


function ListItem({
    title,
    children,
    href,
    ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild>
                <Link href={href}>
                    <div className="flex flex-col gap-1 text-sm">
                        <div className="leading-none font-medium">{title}</div>
                        <div className="line-clamp-2 text-muted-foreground">{children}</div>
                    </div>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}