import {
  InMemoryAgentRunner,
  type AgentRunnerConnectRequest,
} from "@copilotkit/runtime/v2";
import { EventType, type BaseEvent } from "@ag-ui/core";
import { from, Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";

export class SQLiteAgentRunner extends InMemoryAgentRunner {
  connect(request: AgentRunnerConnectRequest): Observable<BaseEvent> {
    const threadId = request.threadId;
    const bucketApiUrl =
      process.env.NEXT_PUBLIC_BUCKET_API_URL ||
      process.env.BUCKET_API_URL ||
      "http://localhost:8000";

    return from(
      fetch(`${bucketApiUrl}/api/threads/${threadId}/messages`)
        .then((res) => (res.ok ? res.json() : { messages: [] }))
        .catch(() => ({ messages: [] }))
    ).pipe(
      switchMap(
        (data: {
          messages?: Array<{
            id: number | string;
            role: "user" | "assistant" | "system";
            content: string;
          }>;
        }) => {
          const msgs = data.messages || [];
          if (msgs.length === 0) {
            return super.connect(request);
          }

          const runId = crypto.randomUUID();
          const mappedMessages = msgs.map((m) => ({
            id: String(m.id),
            role: m.role,
            content: m.content,
          }));

          return of(
            {
              type: EventType.RUN_STARTED,
              threadId,
              runId,
              input: {
                runId,
                messages: [],
                state: {},
                threadId,
              },
            } as BaseEvent,
            {
              type: EventType.MESSAGES_SNAPSHOT,
              messages: mappedMessages,
            } as BaseEvent,
            {
              type: EventType.RUN_FINISHED,
              threadId,
              runId,
              outcome: { type: "success" },
            } as BaseEvent
          );
        }
      )
    );
  }
}

