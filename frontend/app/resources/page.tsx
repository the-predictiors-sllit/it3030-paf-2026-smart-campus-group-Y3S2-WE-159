"use client"
import { ResourceCard } from '@/components/custom/ResourceCard';
import { Item } from '@/components/ui/item';
import React, { useEffect, useState } from 'react'
import { toast } from "sonner"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { EmptyData } from '@/components/custom/EmptyData';
import { LoadingData } from '@/components/custom/LoadingData';

export interface Resource {
    id: string;
    name: string;
    type: string;
    capacity: number | null;
    location: string;
    status: string;
    _links: {
        self: { href: string };
    };
}

export interface ResourceResponse {
    _links: any;
    data: {
        items: Resource[];
        total: number;
        page: number;
        totalPages: number;
    } | null;
    error: {
        code: string;
        message: string;
    } | null;
    status: string;
}

const page = () => {

    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({
                    page: '1',
                    limit: '10',
                    // add other prams here
                });

                const response = await fetch(`/api/resources?${query.toString()}`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }

                const result: ResourceResponse = await response.json();

                if (result.status === "success" && result.data) {
                    setResources(result.data.items);
                } else if (result.error) {
                    toast.error(result.error.message);
                } else {
                    toast.warning("Received an unexpected response format.");
                }
            } catch (err: any) {
                console.error("Error fetching data:", err);
                toast.error(err.message || "Failed to connect to the server");
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, []);

    if (loading) return <div><LoadingData/></div>;
    if (!resources) return <div><EmptyData/></div>;
    return (
        <main className='flex flex-row'>
            <div className="basis-1/3">Create a filter option here</div>
            <div className="basis-1/3">
                <section className='flex flex-col'>
                    <div> Add search option here use this template
                        <Field orientation="horizontal">
                            <Input type="search" placeholder="Search..." />
                            <Button>Search</Button>
                        </Field>
                    </div>
                    <div>{resources.map((resource) => (
                        <ResourceCard
                            key={resource.id}
                            id={resource.id}
                            name={resource.name}
                            type={resource.type}
                            status={resource.status}
                        />
                    ))}</div>
                    <div> Add Pagination option here to navigate product list use this below template.
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href="#" />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink href="#">1</PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink href="#" isActive>
                                        2
                                    </PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink href="#">3</PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext href="#" />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </section>

            </div>
        </main>
    )
}

export default page




/* 

api instructions (remove this after completing the ui - instructions by pasan)) 
GET - http://localhost:8080/api/resources?page=1&limit=10

Query params:
- type: ROOM, LAB, or EQUIPMENT
- status: ACTIVE or OUT_OF_SERVICE
- minCapacity: number
- page: number, default 1
- limit: number, default 10
```json
{
    "_links": {
        "self": {
            "href": "/api/resources?page=1&limit=10"
        }
    },
    "data": {
        "items": [
            {
                "id": "res_lab_03",
                "name": "Advanced Robotics",
                "type": "LAB",
                "capacity": 15,
                "location": "Building 4, Basement",
                "status": "ACTIVE",
                "_links": {
                    "self": {
                        "href": "/api/resources/res_lab_03"
                    }
                }
            },
            {
                "id": "res_lab_01",
                "name": "Chemistry Lab 3",
                "type": "LAB",
                "capacity": 30,
                "location": "Building 2, Floor 1",
                "status": "ACTIVE",
                "_links": {
                    "self": {
                        "href": "/api/resources/res_lab_01"
                    }
                }
            },
            {
                "id": "res_equip_03",
                "name": "DSLR Camera Kit",
                "type": "EQUIPMENT",
                "capacity": null,
                "location": "Media Room 4",
                "status": "OUT_OF_SERVICE",
                "_links": {
                    "self": {
                        "href": "/api/resources/res_equip_03"
                    }
                }
            },
            {
                "id": "res_room_01",
                "name": "Main Lecture Hall A",
                "type": "ROOM",
                "capacity": 150,
                "location": "Building 1, Floor 2",
                "status": "ACTIVE",
                "_links": {
                    "self": {
                        "href": "/api/resources/res_room_01"
                    }
                }
            },
            {
                "id": "res_equip_01",
                "name": "Mobile Projector X1",
                "type": "EQUIPMENT",
                "capacity": null,
                "location": "IT Storage Desk",
                "status": "ACTIVE",
                "_links": {
                    "self": {
                        "href": "/api/resources/res_equip_01"
                    }
                }
            },
            {
                "id": "res_lab_02",
                "name": "Physics Lab Intro",
                "type": "LAB",
                "capacity": 25,
                "location": "Building 2, Floor 2",
                "status": "ACTIVE",
                "_links": {
                    "self": {
                        "href": "/api/resources/res_lab_02"
                    }
                }
            },
            {
                "id": "res_room_02",
                "name": "Seminar Room B",
                "type": "ROOM",
                "capacity": 40,
                "location": "Building 1, Floor 3",
                "status": "ACTIVE",
                "_links": {
                    "self": {
                        "href": "/api/resources/res_room_02"
                    }
                }
            },
            {
                "id": "res_room_03",
                "name": "Study Pod 1",
                "type": "ROOM",
                "capacity": 4,
                "location": "Library, Floor 1",
                "status": "ACTIVE",
                "_links": {
                    "self": {
                        "href": "/api/resources/res_room_03"
                    }
                }
            },
            {
                "id": "res_room_04",
                "name": "Study Pod 2",
                "type": "ROOM",
                "capacity": 4,
                "location": "Library, Floor 1",
                "status": "OUT_OF_SERVICE",
                "_links": {
                    "self": {
                        "href": "/api/resources/res_room_04"
                    }
                }
            },
            {
                "id": "res_equip_02",
                "name": "Wireless Mic Array A",
                "type": "EQUIPMENT",
                "capacity": null,
                "location": "IT Storage Desk",
                "status": "ACTIVE",
                "_links": {
                    "self": {
                        "href": "/api/resources/res_equip_02"
                    }
                }
            }
        ],
        "total": 10,
        "page": 1,
        "totalPages": 1
    },
    "error": null,
    "status": "success"
}
```


*/

