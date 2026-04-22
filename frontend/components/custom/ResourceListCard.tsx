import Link from "next/link";
import { ImageOff, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ResourceListCardProps = {
  id: string;
  name: string;
  typeLabel: string;
  statusLabel: string;
  isActive: boolean;
  capacity: number | null;
  location: string;
  imageUrl?: string;
  hasImageError: boolean;
  onImageError: () => void;
};

export function ResourceListCard({
  id,
  name,
  typeLabel,
  statusLabel,
  isActive,
  capacity,
  location,
  imageUrl,
  hasImageError,
  onImageError,
}: ResourceListCardProps) {
  return (
    <Card className="p-4">
      <div className="grid gap-3 sm:grid-cols-2 sm:items-stretch">
        <div className="relative h-32 w-full overflow-hidden rounded-md border bg-muted/30 sm:h-full">
          {imageUrl && !hasImageError ? (
            <img
              src={`/api/upload/view?fileName=${encodeURIComponent(imageUrl)}`}
              alt={name}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={onImageError}
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center gap-2 px-2 text-xs">
              <ImageOff className="size-4" />
              <span>No image</span>
            </div>
          )}
        </div>
        <div className="space-y-3 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{typeLabel}</Badge>
            <Badge variant={isActive ? "default" : "destructive"}>{statusLabel}</Badge>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold leading-snug">{name}</h3>
            <p className="text-muted-foreground text-xs">ID: {id}</p>
          </div>

          <div className="text-muted-foreground flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>{location || "Location not specified"}</span>
          </div>

          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Users className="size-4 shrink-0" />
            <span>Capacity: {capacity ?? "N/A"}</span>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href={`/resources/${id}`}>View Details</Link>
          </Button>
        </div>

        
      </div>
    </Card>
  );
}
