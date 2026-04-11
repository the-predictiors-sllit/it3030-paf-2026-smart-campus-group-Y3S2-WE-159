"use client"
import React, { useEffect, useState } from 'react'
import { MoreHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { getAuthToken } from "@/lib/getAuthToken"
import { CLIENT_API_URL } from '@/lib/api-client'
import { toast } from 'sonner'
import { Field } from '../ui/field'
import { Input } from '../ui/input'
import { useRouter } from 'next/navigation'
import { LoadingData } from './LoadingData'
import { EmptyData } from './EmptyData'



export interface Link {
    href: string;
}

export interface BookingLinks {
    resource: Link;
    self: Link;
    resource_availability: Link;
}

export interface ResourceSummary {
    id: string;
    name: string;
}

export interface BookingResponseData {
    id: string;
    resource: ResourceSummary;
    startTime: string;
    endTime: string;
    status: string;
    _links: BookingLinks;
}

interface ApiResponseProps {
    data: {
        items: BookingResponseData[];
    };
    status: string;
    error: string | null;
}

export const MyBookings = () => {
    const [resources, setResource] = useState<BookingResponseData[]>([]);
    const [loading, setLoading] = useState(true);
    
    const router = useRouter();


    useEffect(() => {
        const fetchData = async () => {
            const token = await getAuthToken();
            try {
                const response = await fetch(CLIENT_API_URL + `/api/bookings/me`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                const result: ApiResponseProps = await response.json();
                if (result.status === "success") {
                    setResource(result.data.items);
                }

            } catch (error) {
                toast.warning("Something went wrong!")
                console.error("Failed to fetch resource:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);
    if (loading) return <div><LoadingData/></div>;
    if (!loading && resources.length === 0) return <div><EmptyData/></div>;


    // console.log(resources)

    const tableHead = ["Resource", "StartTime", "EndTime", "Status", "Actions"]


    return (
        <main>
            <div>
                <Field orientation="horizontal">
                    <Input type="search" placeholder="Search..." />
                    <Button>Search</Button>
                </Field>
            </div>

            <Table>
                <TableHeader>
                    <TableRow >
                        {tableHead.map((item, index) => (

                            <TableHead key={index}>{item}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {resources.map((resource) => (
                        <TableRow key={resource.id}>
                            <TableCell className="font-medium cursor-pointer underline hover:translate-x-1" onClick={()=>router.push(`/resources/${resource.resource.id}`)}>{resource.resource.name}</TableCell>
                            <TableCell>{resource.startTime}</TableCell>
                            <TableCell>{resource.endTime}</TableCell>
                            <TableCell>{resource.status}</TableCell>
                            <TableCell hidden={resource.status !== "PENDING"}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="size-8">
                                            <MoreHorizontalIcon />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {/* <DropdownMenuItem>Other</DropdownMenuItem> */}
                                        <DropdownMenuItem variant="destructive">
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}


                </TableBody>
            </Table>
        </main>
    )
}



/*

api instructions (remove this after completing the ui - instructions by pasan)) 
- Request: GET /api/bookings/me
- Optional filters: status add this as filter

{
    "_links": {
        "self": {
            "href": "/api/bookings/me?page=1&limit=10"
        }
    },
    "data": {
        "items": [
            {
                "id": "bkg_20260411162901_0692",
                "resource": {
                    "id": "res_lab_01",
                    "name": "Resource res_lab_01"
                },
                "startTime": "2026-04-13T14:00:00",
                "endTime": "2026-04-13T15:30:00",
                "status": "PENDING",
                "_links": {
                    "resource": {
                        "href": "/api/resources/res_lab_01"
                    },
                    "self": {
                        "href": "/api/bookings/bkg_20260411162901_0692"
                    },
                    "resource_availability": {
                        "href": "/api/resources/res_lab_01/availability"
                    }
                }
            },
            {
                "id": "bkg_20260411162831_0692",
                "resource": {
                    "id": "res_lab_01",
                    "name": "Resource res_lab_01"
                },
                "startTime": "2026-04-13T10:30:00",
                "endTime": "2026-04-13T11:30:00",
                "status": "PENDING",
                "_links": {
                    "resource": {
                        "href": "/api/resources/res_lab_01"
                    },
                    "self": {
                        "href": "/api/bookings/bkg_20260411162831_0692"
                    },
                    "resource_availability": {
                        "href": "/api/resources/res_lab_01/availability"
                    }
                }
            }
        ],
        "total": 2,
        "page": 1,
        "totalPages": 1
    },
    "error": null,
    "status": "success"
}

*/