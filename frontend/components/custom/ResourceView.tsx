"use client"
import { CLIENT_API_URL } from '@/lib/api-client';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import Image from "next/image"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
    Timeline,
    TimelineDate,
    TimelineHeader,
    TimelineIndicator,
    TimelineItem,
    TimelineSeparator,
    TimelineTitle,
} from "@/components/reui/timeline"

import { cn } from "@/lib/utils"
import { formatTime } from '@/lib/formatTime';


interface AvailabilityWindow {
    day: string;
    startTime: string;
    endTime: string;
}

interface ResourcesData {
    id: string;
    name: string;
    type: string;
    capacity: string;
    location: string;
    status: string;
    description: string;
    availabilityWindows: AvailabilityWindow[];
    createdAt: string;
}

interface ApiResponseProps {
    data: ResourcesData;
    status: string;
    error: string | null;
}

export const ResourceView = ({ id }: { id: string }) => {

    const [resource, setResource] = useState<ResourcesData | null>(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const fetchData = async () => {
            // const token = "token"

            try {
                const response = await fetch(CLIENT_API_URL + `/api/resources/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Bearer ${token}`
                    }
                })
                const result: ApiResponseProps = await response.json();

                if (result.status === "success") {
                    setResource(result.data);
                }
            } catch (error) {
                toast.warning("Something went wrong!")
                console.error("Failed to fetch resource:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!resource) return <div>Resource not found.</div>;

    return (
        // design single product view here
        <main className='pr-2 pt-5'>

            <div className="w-full max-w-[15rem]">
                {/* Todo: add images to resources. for now keep this */}
                <AspectRatio ratio={1 / 1} className="rounded-lg bg-muted">
                    <Image
                        src="https://images.pexels.com/photos/29101883/pexels-photo-29101883.jpeg"
                        alt="Photo"
                        fill
                        className="rounded-lg object-cover  dark:brightness-90"
                    />
                </AspectRatio>
            </div>
            <h1 className=' text-2xl'>{resource.name}</h1>
            <p>{resource.status}</p>
            <p>{resource.type}</p>
            <p>{resource.location}</p>
            <p>{resource.description}</p>
            <p>{resource.capacity}</p>
            <p>{resource.createdAt}</p>
            <br />
            <h1>Availability windows</h1>
            {resource.availabilityWindows && resource.availabilityWindows.length > 0 ? (

                <Timeline defaultValue={0} className="w-full max-w-md">
                    {resource.availabilityWindows.map((item, index) => (


                        <TimelineItem
                            key={index}
                            step={index}
                            className={cn(
                                "w-[calc(50%-1.5rem)] odd:ms-auto even:me-auto even:text-right even:group-data-[orientation=vertical]/timeline:ms-0 even:group-data-[orientation=vertical]/timeline:me-8",
                                "even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-indicator]:-right-6 even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-indicator]:left-auto",
                                "even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-indicator]:translate-x-1/2 even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-separator]:-right-6",
                                "even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-separator]:left-auto even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-separator]:translate-x-1/2"
                            )}
                        >
                            <TimelineHeader>
                                <TimelineSeparator />
                                <TimelineTitle>{item.day}</TimelineTitle>
                                <TimelineDate>{formatTime(item.startTime)} - {formatTime(item.endTime)}
                                </TimelineDate>
                                <TimelineIndicator />
                            </TimelineHeader>
                        </TimelineItem>
                    ))}
                </Timeline>


            ) : (
                <div>No availability Windows Yet.</div>
            )}
        </main>
    )
}




/*
remove this later
how the api look like
{
    "_links": {
        "tickets": {
            "href": "/api/tickets?resourceId=res_lab_01"
        },
        "self": {
            "href": "/api/resources/res_lab_01"
        },
        "availability": {
            "href": "/api/resources/res_lab_01/availability"
        },
        "bookings": {
            "href": "/api/bookings?resourceId=res_lab_01"
        }
    },
    "data": {
        "id": "res_lab_01",
        "name": "Chemistry Lab 3",
        "type": "LAB",
        "capacity": 30,
        "location": "Building 2, Floor 1",
        "status": "ACTIVE",
        "description": "Fume hoods, acid resistant tables.",
        "availabilityWindows": [
            {
                "day": "MONDAY",
                "startTime": "08:00:00.0000000",
                "endTime": "16:00:00.0000000"
            },
            {
                "day": "TUESDAY",
                "startTime": "08:00:00.0000000",
                "endTime": "16:00:00.0000000"
            },
            {
                "day": "THURSDAY",
                "startTime": "08:00:00.0000000",
                "endTime": "16:00:00.0000000"
            }
        ],
        "createdAt": "2026-03-20T09:20:00"
    },
    "error": null,
    "status": "success"
}
*/