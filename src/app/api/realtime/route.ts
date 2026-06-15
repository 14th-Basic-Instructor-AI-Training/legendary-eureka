import type { NextRequest } from "next/server";

/**
 * Realtime relay (Server-Sent Events). The shared Next.js server is the fan-out
 * point so events cross browser boundaries (e.g. admin in Chrome → explore /
 * landing in Brave) — which a same-browser BroadcastChannel cannot do.
 *
 *  - GET  /api/realtime  → an SSE stream every page subscribes to.
 *  - POST /api/realtime  → the admin emits a frame; we push it to all streams.
 *
 * State is kept in-memory on `globalThis` (survives HMR in dev). This works for
 * a single server process (local dev / a single Node instance). A horizontally
 * scaled deploy would need a shared broker (Redis pub/sub) behind these routes.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Client {
  id: number;
  enqueue: (chunk: Uint8Array) => void;
}

interface Hub {
  clients: Set<Client>;
  nextId: number;
}

const globalForHub = globalThis as unknown as { __jalatRealtimeHub?: Hub };
const hub: Hub = (globalForHub.__jalatRealtimeHub ??= {
  clients: new Set<Client>(),
  nextId: 1,
});

const encoder = new TextEncoder();

/** Subscribe: open a long-lived SSE stream. */
export function GET(req: NextRequest) {
  let client: Client | undefined;
  let ping: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      client = {
        id: hub.nextId++,
        enqueue: (chunk) => controller.enqueue(chunk),
      };
      hub.clients.add(client);
      controller.enqueue(encoder.encode(": connected\n\n"));

      // Heartbeat so idle connections (and proxies) stay open.
      ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          if (ping) clearInterval(ping);
        }
      }, 25000);
    },
    cancel() {
      if (ping) clearInterval(ping);
      if (client) hub.clients.delete(client);
    },
  });

  req.signal.addEventListener("abort", () => {
    if (ping) clearInterval(ping);
    if (client) hub.clients.delete(client);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

/** Emit: broadcast one frame to every subscribed stream. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const frame = encoder.encode(`data: ${JSON.stringify(body)}\n\n`);
  let delivered = 0;
  for (const client of hub.clients) {
    try {
      client.enqueue(frame);
      delivered++;
    } catch {
      hub.clients.delete(client);
    }
  }

  return Response.json({ ok: true, delivered });
}
