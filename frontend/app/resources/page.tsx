"use client"
import { EmptyData } from '@/components/custom/EmptyData';
import { LoadingData } from '@/components/custom/LoadingData';
import { ResourceCard } from '@/components/custom/ResourceCard';
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useState } from 'react';
import { toast } from "sonner";

interface Resource {
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

interface ResourceResponse {
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

    const [searchInput, setSearchInput] = useState("");
    const [activeSearch, setActiveSearch] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    //add filter states
    const [selectedType, setSelectedType] = useState<string>("ALL");
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const [minCapacity, setMinCapacity] = useState<string>("");



    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({
                    page: String(page),
                    limit: '10',
                    search: activeSearch,
                });

                if (activeSearch) {
                    query.append('search', activeSearch); 
                }
                if (selectedType !== "ALL") query.append('type', selectedType);
                if (selectedStatus !== "ALL") query.append('status', selectedStatus);
                if (minCapacity) query.append('minCapacity', minCapacity);

                const response = await fetch(`/api/resources?${query.toString()}`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }

                const result: ResourceResponse = await response.json();

                if (result.status === "success" && result.data) {
                    setResources(result.data.items);
                    setTotalPages(result.data.totalPages);
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
    }, [page, activeSearch, selectedType, selectedStatus, minCapacity]);

// Helper to generate page numbers
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push('...');
            
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                pages.push(i);
            }
            
            if (page < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    const handleSearchClick = () => {
        setActiveSearch(searchInput);
    };

    if (loading) return <div><LoadingData/></div>;
    if (!resources) return <div><EmptyData/></div>;
    return (
        <main className='flex flex-row'>
            <div className="basis-1/3">Create a filter option   
                {/* Type Filter */}
                <div>
                    <label className="text-sm font-medium">Resource Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="ROOM">Room</SelectItem>
                            <SelectItem value="LAB">Lab</SelectItem>
                            <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Capacity Filter */}
                <div>
                    <label className="text-sm font-medium">Min Capacity</label>
                    <Input 
                        type="number"
                        placeholder="e.g. 20"
                        value={minCapacity}
                        onChange={(e) => setMinCapacity(e.target.value)}
                    />
                </div>

                {/* Reset Filters */}
                <Button 
                    variant="outline"
                    onClick={() => {
                        setSelectedType("ALL");
                        setSelectedStatus("ALL");
                        setMinCapacity("");
                        setPage(1);
                    }}
                >
                    Clear Filters
                </Button>
            </div>
            <div className="basis-2/3">
                <section className='flex flex-col'>
                    <div> Add search option here use this template
                        <Field orientation="horizontal">
                            <Input 
                                type="search" 
                                placeholder="Search..." 
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                    setActiveSearch(searchInput);
                                    }
                                }}
                            />
                            <Button onClick={handleSearchClick}>Search</Button>
                        </Field>
                    </div>
                    <div className="grid gap-4">{resources.map((resource) => (
                        <ResourceCard
                            key={resource.id}
                            id={resource.id}
                            name={resource.name}
                            type={resource.type}
                            status={resource.status}
                        />
                    ))}</div>
                    <div> 
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (page > 1) setPage(page - 1);
                                        }}
                                        className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                {getPageNumbers().map((pageNum, idx) => (
                                    <PaginationItem key={idx}>
                                        {pageNum === '...' ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink 
                                                href="#"
                                                isActive={page === pageNum}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (typeof pageNum === 'number') setPage(pageNum);
                                                }}
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}
                                
                                <PaginationItem>
                                    <PaginationNext 
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (page < totalPages) setPage(page + 1);
                                        }}
                                        className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                                    />
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

