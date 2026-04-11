"use client"
import React from 'react'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation';
import Image from "next/image"

import { AspectRatio } from "@/components/ui/aspect-ratio"


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
        <Card onClick={handleClick} className=' cursor-pointer hover:shadow-lg active:translate-1 transition ease-in-out'>
            <div className="w-full max-w-[6rem]">
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
            {name}
            <br />
            {type}
            <br />
            {status}
        </Card>
    )
}
