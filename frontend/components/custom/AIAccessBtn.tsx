"use client"

import { RainbowButton } from "@/components/ui/rainbow-button"
import { IconRobotFace } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

export const AIAccessBtn = () => {
  const router = useRouter()

  return (
    <RainbowButton
      className="rounded-full hover:-translate-y-2 transition-all delay-200 ease-in-out active:translate-1"
      variant={"outline"}
      onClick={() => router.push("/ai")}
    >
      <IconRobotFace /> Chat with AI
    </RainbowButton>
  )
}
