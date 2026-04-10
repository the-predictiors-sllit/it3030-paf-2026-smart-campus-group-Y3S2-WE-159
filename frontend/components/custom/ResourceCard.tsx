"use client"
import React from 'react'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation';


interface Resource {
    id: string;
    name: string;
    type: string;
  
    status: string;

}

export const ResourceCard = ({ id, name, type, status }: Resource) => {
    const router = useRouter();
    const handleClick = () => {
        router.push(`/resources/${id}`)
    }
    return (
        <Card onClick={handleClick}>
            {name}
            {type}
            {status}
        </Card>
    )
}
