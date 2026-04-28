"use client"

import { useChat } from "@ai-sdk/react"

import { FixedLangGraphTransport } from "@/lib/FixedLangGraphTransport"
import { useMemo } from "react"

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"
import {
  PromptInput,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input"
import { CopyIcon, RefreshCcwIcon } from "lucide-react"
import { useState } from "react"

import { Fragment } from "react"

import { Shimmer } from "@/components/ai-elements/shimmer"
import { DiaTextReveal } from "@/components/ui/dia-text-reveal"
import { SparklesText } from "@/components/ui/sparkles-text"
import { Ai_CampusResource_toolbox } from "@/components/custom/Ai_CampusResource_toolbox"
import { Highlighter } from "@/components/ui/highlighter"

export default function LangSmithChat({ token }: { token: string }) {
  const [input, setInput] = useState("")
  const transport = useMemo(
    () =>
      new FixedLangGraphTransport({
        // url: 'http://host.docker.internal:2024',
        url: "http://localhost:2024",
        graphId: "agent",
        headers: {
          userjwttoken: `Bearer ${token}`,
        },
      }),
    []
  )

  const { messages, sendMessage, status, regenerate, stop } = useChat({
    transport,
  })

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim()) {
      sendMessage({ text: message.text })
      setInput("")
    }
  }

  return (
    <div className="relative mx-auto size-full h-[90dvh] max-w-7xl rounded-lg p-6">
      <div className="flex h-full flex-col">
        <Conversation>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-6 p-8">
              {/* <Shimmer as="h1" className="font-bold text-4xl" duration={3} spread={3}>
                    Welcome to Smart Campus AI Assistant.
                  </Shimmer> */}
              <div className="flex items-center justify-center">
                <SparklesText sparklesCount={20}>
                  <DiaTextReveal
                    className="text-4xl font-bold tracking-tight "
                    text="Welcome to Smart Campus AI Assistant."
                    repeat={true}
                    duration={2.5}
                    repeatDelay={3.5}
                  />
                </SparklesText>
              </div>
              <Highlighter action="underline" color="#FF9800" isView={true} >
                <Shimmer duration={3} spread={3}>
                  Ask me to find rooms, labs, or equipment.
                </Shimmer>
              </Highlighter>
            </div>
          )}
          <ConversationContent>
            {messages.map((message, messageIndex) => {
              // console.log("Full Message Object:", message);

              return (
                <Fragment key={message.id}>
                  {message.parts.map((part, i) => {
                    // console.log("parts"+part)
                    // console.log("part type "+part.type)
                    // console.log(`Part ${i} for message ${message.id}:`, part);
                    // console.log(status)
                    // if (part.type === "dynamic-tool") {
                    //   console.log("Dynamic Tool Part:", part);
                    // }
                    switch (part.type) {
                      case "text":
                        const isLastMessage =
                          messageIndex === messages.length - 1

                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              <MessageContent>
                                {message.role === "assistant" &&
                                  isLastMessage &&
                                  status === "streaming" && (
                                    <Shimmer>Generating...</Shimmer>
                                  )}
                                <MessageResponse>{part.text}</MessageResponse>
                              </MessageContent>
                            </Message>
                            {message.role === "assistant" && isLastMessage && (
                              <MessageActions>
                                <MessageAction
                                  onClick={() => regenerate()}
                                  label="Retry"
                                >
                                  <RefreshCcwIcon className="size-3" />
                                </MessageAction>
                                <MessageAction
                                  onClick={() =>
                                    navigator.clipboard.writeText(part.text)
                                  }
                                  label="Copy"
                                >
                                  <CopyIcon className="size-3" />
                                </MessageAction>
                              </MessageActions>
                            )}
                          </Fragment>
                        )
                      case "dynamic-tool":
                        if (
                          part.toolName == "campusResources" &&
                          part.output != null &&
                          part.output != "null"
                        ) {
                          const isLastMessage =
                            messageIndex === messages.length - 1
                          return (
                            <div key={`${message.id}-${i}`}>
                              {message.role === "assistant" &&
                                isLastMessage &&
                                status === "streaming" && (
                                  <Shimmer>Generating...</Shimmer>
                                )}
                              <Ai_CampusResource_toolbox
                                rawOutput={part.output}
                              />
                            </div>
                          )
                        }
                      default:
                        return null
                    }
                  })}
                </Fragment>
              )
            })}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput
          onSubmit={handleSubmit}
          className="relative mx-auto mt-4 w-full border-transparent shadow-lg"
        >
          <PromptInputTextarea
            value={input}
            placeholder="Say something..."
            onChange={(e) => setInput(e.currentTarget.value)}
            className={`pr-12 ${
              status === "streaming"
                ? "cursor-pointer"
                : status === "submitted"
                  ? "cursor-progress"
                  : "cursor-text"
            }`}
          />
          <PromptInputSubmit
            // status={status === "streaming" ? "streaming" : "ready"}
            status={
              status === "streaming"
                ? "streaming"
                : status === "submitted"
                  ? "submitted"
                  : "ready"
            }
            disabled={!input.trim()}
            className={`absolute right-1 bottom-1 rounded-full`}
          />
        </PromptInput>
      </div>
    </div>
  )
}

{
  /* <h4>Tool: {part.toolName}</h4>
<pre>{JSON.stringify(part.output, null, 2)}</pre> */
}

// curl -X POST http://host.docker.internal:2024/runs/stream \
//   -H "Content-Type: application/json" \
//   -d '{
//     "assistant_id": "agent",
//     "if_not_exists": "create",
//     "input": {
//       "messages": [
//         {
//           "role": "human",
//           "content": "Hello, LangGraph!"
//         }
//       ]
//     },
//     "stream_mode": ["values", "messages-tuple"]
//   }'

// const ResourceCards = ({ resources }: { resources: CampusResource[] }) => (
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//     {resources.map((item) => (
//       <Card key={item.id} className="p-4 shadow-sm border-l-4 border-l-primary">
//         <div className="flex justify-between items-start">
//           <h4 className="font-bold text-lg">{item.name}</h4>
//           <span className={`text-xs px-2 py-1 rounded ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//             }`}>
//             {item.status}
//           </span>
//         </div>
//         <p className="text-sm text-muted-foreground">{item.location}</p>
//         <div className="mt-2 flex gap-4 text-xs font-medium">
//           <span>Type: {item.type}</span>
//           {item.capacity && <span>Capacity: {item.capacity}</span>}
//         </div>
//       </Card>
//     ))}
//   </div>
// );
