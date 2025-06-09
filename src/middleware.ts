import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUSPICIOUS_THRESHOLD = 200; // hits per minute
const ipHits = new Map<string, { count: number; last: number }>();

function trackIP(ip: string) {
  const now = Date.now();

  const entry = ipHits.get(ip);

  if (entry && now - entry.last < 60000) {
    entry.count += 1;
    entry.last = now;

    if (entry.count > SUSPICIOUS_THRESHOLD) {
      console.warn(
        `⚠️ High-frequency access from ${ip} (${entry.count} hits/min)`
      );
    }
  } else {
    ipHits.set(ip, { count: 1, last: now });
  }
}

const knownPaths = [
  "/",
  "/_not-found",
  "/api/tickets/reservations",
  "/api/tickets/reservations/items",
  "/api/tickets/reservations/review",
  "/api/tickets/webhook",
  "/api/users",
  "/boletas/", // base for dynamic routes
  "/boletas/pago",
  "/boletas/verificacion",
  "/obra/",
];

function isKnownPath(pathname: string) {
  if (knownPaths.includes(pathname)) return true;
  return knownPaths.some((prefix) => {
    if (prefix.endsWith("/")) {
      return pathname.startsWith(prefix);
    }
    return false;
  });
}

// TODO its not really tracking properly. attempts to, for example, /wp-admin/** and /wordpress/** are not being logged as unknown
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`🧪 Middleware triggered for path: ${pathname}`);

  if (pathname === "/api/tickets/webhook") {
    console.log("🔔 Webhook route detected, skipping IP check.");
    return NextResponse.next();
  }

  if (pathname === "/admin") {
    const xForwardedFor = request.headers.get("x-forwarded-for");
    const clientIP = xForwardedFor
      ? xForwardedFor.split(",")[0].trim()
      : "unknown";
    console.warn(`🎯 Bot probe attempt at /admin from ${clientIP}`);
    return new NextResponse("Not found", { status: 404 });
  }

  const xForwardedFor = request.headers.get("x-forwarded-for");
  const clientIP = xForwardedFor ? xForwardedFor.split(",")[0].trim() : null;

  console.log(`🌐 Client IP from x-forwarded-for: ${clientIP}`);

  if (!clientIP) {
    console.warn("🚫 No client IP detected - request forbidden");
    return new NextResponse("Forbidden - no IP detected", { status: 403 });
  }

  trackIP(clientIP);

  if (!isKnownPath(pathname)) {
    console.warn(
      `🕳️ Unknown or suspicious path accessed: ${pathname} from ${clientIP}`
    );
  }

  return NextResponse.next();
}
