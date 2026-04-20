// lib/FixedLangGraphTransport.ts
import type {
  ChatRequestOptions,
  ChatTransport,
  UIMessage,
  UIMessageChunk,
} from 'ai';
import { toBaseMessages, toUIMessageStream } from '@ai-sdk/langchain';
import { RemoteGraph, type RemoteGraphParams } from '@langchain/langgraph/remote';
import type { AIMessageChunk } from '@langchain/core/messages';

export type FixedLangGraphTransportOptions = Omit<RemoteGraphParams, 'graphId'> & {
  graphId?: string;
};

export class FixedLangGraphTransport<UI_MESSAGE extends UIMessage = UIMessage>
  implements ChatTransport<UI_MESSAGE>
{
  private graph: RemoteGraph;

  constructor(options: FixedLangGraphTransportOptions) {
    this.graph = new RemoteGraph({
      ...options,
      graphId: options.graphId ?? 'agent',
    });
  }

  async sendMessages(
    options: { messages: UI_MESSAGE[]; abortSignal?: AbortSignal } & ChatRequestOptions,
  ): Promise<ReadableStream<UIMessageChunk>> {
    const baseMessages = await toBaseMessages(options.messages);

    const stream = await this.graph.stream(
      { messages: baseMessages },
      { streamMode: ['values', 'messages', 'updates'] },
    );

    return toUIMessageStream(
      this.normalizeStream(stream) as AsyncIterable<AIMessageChunk>,
    );
  }

  async reconnectToStream(_options: unknown): Promise<ReadableStream<UIMessageChunk> | null> {
    return null;
  }

  // Fixes the messages-tuple mismatch between LangGraph server and @ai-sdk/langchain
  private async *normalizeStream(source: AsyncIterable<unknown>) {
    for await (const chunk of source) {
      if (!Array.isArray(chunk)) { yield chunk; continue; }

      let event = chunk as unknown[];

      // Normalize messages-tuple → messages
      if (event.length === 2 && event[0] === 'messages-tuple') {
        event = ['messages', event[1]];
      } else if (event.length === 3 && event[1] === 'messages-tuple') {
        event = [event[0], 'messages', event[2]];
      }

      // Normalize AIMessageChunk type field so toUIMessageStream can parse it
      const mode = event.length === 2 ? event[0] : event[1];
      if (mode === 'messages') {
        const payload = event[event.length - 1];
        if (Array.isArray(payload) && payload.length >= 2 && payload[0] && typeof payload[0] === 'object') {
          const msg = { ...(payload[0] as Record<string, unknown>) };
          if (msg.type === 'AIMessageChunk' || msg.type === 'AIMessage') {
            msg.type = 'ai';
            event = [...event.slice(0, -1), [msg, payload[1]]];
          }
        }
      }

      yield event;
    }
  }
}