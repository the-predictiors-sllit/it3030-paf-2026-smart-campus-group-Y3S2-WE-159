"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface TicketImageGalleryProps {
  attachments?: string[] | null
  ticketId: string
}

export const TicketImageGallery = ({ attachments, ticketId }: TicketImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadImages = async () => {
      if (!attachments || attachments.length === 0) {
        setLoading(false)
        return
      }

      setLoading(true)
      const urls = new Map<string, string>()

      for (const fileName of attachments) {
        try {
          const response = await fetch(
            `/api/upload/view?fileName=${encodeURIComponent(fileName)}`,
            { method: "GET" }
          )
          if (response.ok) {
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            urls.set(fileName, url)
          }
        } catch (error) {
          console.error(`Failed to load image: ${fileName}`, error)
        }
      }

      setImageUrls(urls)
      setLoading(false)
    }

    loadImages()
  }, [attachments])

  if (!attachments || attachments.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">No images attached</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {attachments.map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {attachments.map((fileName, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedImageIndex(idx)}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
          >
            <img
              src={imageUrls.get(fileName) || ""}
              alt={fileName}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white opacity-0 hover:opacity-100">View</span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Screen Image Dialog */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={(open) => {
        if (!open) setSelectedImageIndex(null)
      }}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>
              Image {selectedImageIndex !== null ? selectedImageIndex + 1 : 0} of{" "}
              {attachments.length}
            </DialogTitle>
          </DialogHeader>

          {selectedImageIndex !== null && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden">
                <img
                  src={imageUrls.get(attachments[selectedImageIndex]) || ""}
                  alt={attachments[selectedImageIndex]}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedImageIndex((i) => (i === null || i === 0 ? attachments.length - 1 : i - 1))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm text-muted-foreground">
                  {attachments[selectedImageIndex]}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedImageIndex((i) => (i === null || i === attachments.length - 1 ? 0 : i + 1))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = imageUrls.get(attachments[selectedImageIndex]) || ""
                    link.download = attachments[selectedImageIndex]
                    link.click()
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
