import { notFound } from 'next/navigation';

import { parsePerformanceSlug } from '@/utils/performanceUtils';
import { sanitizeEvent } from '@/utils/eventUtils';
import { filterUpcomingPerformances } from '@/utils/sharedUtils';
import { getShowIdByShowSlug } from '@/services/showService';
import { getEvent } from '@/services/eventService';
import { getPerformanceFromEvent } from '@/services/performanceService';
import TicketValidator from '@/components/Ticket/TicketValidator';

export default async function TicketValidatorPage({
  params,
}: {
        params: Promise<{ showSlug: string; performanceSlug: string; key: string }>;
}) {
  const { showSlug, performanceSlug, key } = await params;

  console.log('[scan page] Received params:', { showSlug, performanceSlug, key });

  if (!showSlug || !performanceSlug || !key) {
    console.error('[scan page] Missing parameters:', { showSlug, performanceSlug, key });
    notFound();
  }

  if (key !== process.env.QR_CODE_SCAN_SECRET) {
    console.error('[scan page] Invalid secret key. Provided:', key, 'Expected:', process.env.QR_CODE_SCAN_SECRET);
    notFound();
  }

  console.log('[scan page] Secret key validated');

  let showId: string;
  try {
    console.log('[scan page] Fetching showId by showSlug:', showSlug);
    showId = await getShowIdByShowSlug(showSlug);
    console.log('[scan page] Found showId:', showId);
  } catch (err) {
    console.error('[scan page] Error fetching showId by showSlug:', showSlug, err);
    notFound();
  }

  let event;
  try {
    console.log('[scan page] Fetching event by showId:', showId);
    event = await getEvent(showId);
    console.log('[scan page] Event fetched:', { eventId: event.id });
  } catch (err) {
    console.error('[scan page] Error fetching event for showId:', showId, err);
    notFound();
  }

  console.log('[scan page] Filtering and sanitizing event performances');
  const filteredPerformances = filterUpcomingPerformances(event);
  const mappedEvent = sanitizeEvent({
    ...event,
    performances: filteredPerformances,
  });
  mappedEvent.id = event.id;

  console.log('[scan page] Mapped event:', {
    eventId: mappedEvent.id,
    performanceCount: mappedEvent.performances.length,
  });

  let performanceDate, performanceTime;
  try {
    ({ performanceDate, performanceTime } = parsePerformanceSlug(performanceSlug));
    console.log('[scan page] Parsed performanceSlug:', {
      performanceSlug,
      performanceDate,
      performanceTime,
    });
  } catch (err) {
    console.error('[scan page] Error parsing performanceSlug:', performanceSlug, err);
    notFound();
  }

  let performance;
  try {
    console.log('[scan page] Fetching performance by eventId/date/time:', {
      eventId: mappedEvent.id,
      performanceDate,
      performanceTime,
    });
    performance = await getPerformanceFromEvent(mappedEvent.id, performanceDate, performanceTime);
    console.log('[scan page] Found performance:', { performanceId: performance.id });
  } catch (err) {
    console.error('[scan page] Error fetching performance:', err);
    notFound();
  }

  console.log('[scan page] Returning TicketValidator with:', {
    eventId: mappedEvent.id,
    performanceId: performance.id,
    secretKey: key,
  });

  return (
    <TicketValidator
      eventId={mappedEvent.id}
      performanceId={performance.id}
      secretKey={key}
    />
  );
}
