import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const EC2_IP = process.env.EC2_IP;
const PERSONAL_IP = process.env.PERSONAL_IP;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`🧪 Middleware triggered for path: ${pathname}`);

  if (pathname === '/api/tickets/webhook') {
    console.log('🔔 Webhook route detected, skipping IP check.');
    return NextResponse.next();
  }

  const xForwardedFor = request.headers.get('x-forwarded-for');
  const clientIP = xForwardedFor ? xForwardedFor.split(',')[0].trim() : null;

  console.log(`🌐 Client IP from x-forwarded-for: ${clientIP}`);

  if (!clientIP) {
    console.warn('🚫 No client IP detected - request forbidden');
    return new NextResponse('Forbidden - no IP detected', { status: 403 });
  }

  const allowedIPs = [EC2_IP, PERSONAL_IP].filter(Boolean);
  if (process.env.NODE_ENV === 'development') {
    allowedIPs.push('127.0.0.1', '::1');
  }

  console.log(`✅ Allowed IPs: ${allowedIPs.join(', ')}`);

  if (allowedIPs.includes(clientIP)) {
    console.log(`✔️ Client IP ${clientIP} allowed - request permitted`);
    return NextResponse.next();
  } else {
    console.warn(`❌ Client IP ${clientIP} NOT allowed - request forbidden`);
    return new NextResponse('Forbidden', { status: 403 });
  }
}
