"use client";
import React from "react";
import { BackgroundGradient } from "../ui/background-gradient";
import { Ai_CampusResource_card } from "./Ai_CampusResource_card";
import { Shimmer } from "../ai-elements/shimmer";



interface CampusResource {
    id: string;
    name: string;
    type: string;
    capacity: number | null;
    location: string | null;
    status: string;
}

interface ToolboxProps {
    rawOutput: any;
}
export const Ai_CampusResource_toolbox = ({ rawOutput }: ToolboxProps) => {
    if (!rawOutput || typeof rawOutput !== 'string') {
        return null;
    }
    try {
        // 2. Parse the JSON string into an array of resources
        const resources: CampusResource[] = JSON.parse(rawOutput);

        return (
            <main className="p-5 ">
                <BackgroundGradient className="rounded-lg w-full p-4 bg-card ">
                    <section className="flex gap-4 lg:gap-x-10 overflow-x-auto flex-nowrap lg:justify-center-safe px-6 scrollbar-hide h-70 lg:h-80 ">
                        {resources.map((resource) => (
                            <div className="flex-shrink-0 w-60 lg:w-70 key={resource.id}">

                                <Ai_CampusResource_card
                                    
                                    id={resource.id}
                                    name={resource.name}
                                    type={resource.type}
                                    capacity={resource.capacity}
                                    location={resource.location}
                                    status={resource.status}
                                />
                            </div>
                        ))}
                    </section>
                </BackgroundGradient>
            </main>
        );
    } catch (error) {
        console.error("Failed to parse campus resources:", error);
        return (
            <Shimmer as="p">Can't load resources ui component at the moment.</Shimmer>
        );
    }
}

// <BackgroundGradient className=" rounded-lg w-full p-4 bg-card">
//     <section className="flex flex-wrap">