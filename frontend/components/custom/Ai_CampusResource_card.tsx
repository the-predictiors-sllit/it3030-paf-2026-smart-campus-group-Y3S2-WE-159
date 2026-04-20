"use client"
import Image from "next/image"

import { Card } from "@/components/ui/card"
import classroomImg from "@/assets/classroom1.jpg"
import { Badge } from "@/components/ui/badge"


interface campusResourcesType {
  id: string;
  name: string;
  type: string;
  capacity: number | null;
  location: string | null;
  status: string;
}



export const Ai_CampusResource_card = ({ id, name, type, capacity, location, status }: campusResourcesType) => {
  return (
    <Card className="group/card relative h-full w-full max-w-xs overflow-hidden border-0 p-0! cursor-pointer">
      <Image
        src={classroomImg}
        alt="Background"
        fill
        className="object-cover brightness-50 transition-transform duration-500 group-hover/card:scale-110"
      />

      {/* Background fade effects */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/60 to-transparent transition-opacity duration-500 group-hover/card:from-black/70" />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-end p-6">
        <h3 className="text-xl font-bold text-white">{name}</h3>
        {capacity != null && (
          <p className="text-sm text-white/90 line-clamp-1">
            Capacity: {capacity}
          </p>
        )}
        {location != null && (
        <p className=" text-sm text-white/90 line-clamp-1">location: {location}</p>
        )}
        <div className="flex flex-row gap-2 mt-2">
          <Badge>{type}</Badge>
          <Badge>{status}</Badge>
        </div>
      </div>
    </Card>
  )
}

