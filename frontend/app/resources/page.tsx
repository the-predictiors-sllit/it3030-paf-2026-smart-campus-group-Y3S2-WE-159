"use client"
import { ResourceCard } from '@/components/custom/ResourceCard';
import { Item } from '@/components/ui/item';
import { CLIENT_API_URL } from '@/lib/api-client';
import React, { useEffect, useState } from 'react'
import { toast } from "sonner"

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
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // const token = "token"
        fetch(CLIENT_API_URL + '/api/resources', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => res.json())
            .then((data: ResourceResponse) => {
                console.log(data)
                if (data.error) {
                    toast.warning(data.error.message)
                } else if (data.data) {
                    setResources(data.data.items);
                } else {
                    toast.warning("Something went wrong!")
                }

                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                setIsLoading(false);
                toast.warning(err)
            });
    }, []);

console.log(resources)
    return (
        <main className='flex flex-row'>
            <div className="basis-1/3">Filter Side bar</div>
            <div className="basis-1/3">
            {resources.map((resource) => (
                <ResourceCard
                key={resource.id}
                id = {resource.id}
                name = {resource.name}
                type = {resource.type}
                status = {resource.status}
                />
            ))}
            </div>
        </main>
    )
}

export default page



