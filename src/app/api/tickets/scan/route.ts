import { getTicketById } from '@/services/ticketService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { eventId, performanceId, ticketId, type, secretKey } = await req.json();

  if (secretKey !== process.env.QR_CODE_SCAN_SECRET) {
    return NextResponse.json({ message: '❌ Invalid key' }, { status: 401 });
  }

  if (!eventId || !performanceId || !ticketId || !type) {
    return NextResponse.json({ message: '❌ Missing parameters' }, { status: 400 });
  }

  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    return NextResponse.json({ message: '❌ Ticket not found' }, { status: 404 });
  }

  const isValid =
    ticket.event_id === eventId &&
    ticket.performance_id === performanceId &&
    ticket.ticket_type === type;

  if (!isValid) {
    return NextResponse.json({ message: '❌ Ticket does not match' }, { status: 400 });
  }

  return NextResponse.json({ message: '✅ Valid ticket' });
}
