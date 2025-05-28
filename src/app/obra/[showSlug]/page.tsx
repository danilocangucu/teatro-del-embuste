import type { Metadata } from "next";

import { EventDTO, EventFromDB } from "@/types/Event";

import Show from "@/components/Show/Show";

import { getShowMetadata, getShow } from "@/services/showService";
import { getEvent } from "@/services/eventService";

import { generateShowMetadata, sanitizeShow, sanitizeShowMetadata } from "@/utils/showUtils";
import { sanitizeEvent, sanitizeEventMetadata } from "@/utils/eventUtils";
import { filterUpcomingPerformances } from "@/utils/sharedUtils";

type Props = {
  params: Promise<{ showSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { showSlug } = await params;

  let showMetadata, eventMetadata;
  try {
    ({ showMetadata, eventMetadata } = await getShowMetadata(showSlug));
  } catch (error) {
    console.error("Error fetching show:", error);
  }

  const mappedShowMetadata = sanitizeShowMetadata(showMetadata!);
  const mappedEventMetadata = sanitizeEventMetadata(eventMetadata!);
  
  const metadata = generateShowMetadata(mappedShowMetadata, mappedEventMetadata, showSlug);
  return metadata;
};

export default async function ShowPage({ params }: Props) {
  const { showSlug } = await params;

  let showFromDB;
  try {
    showFromDB = await getShow(showSlug);
  } catch (error) {
    console.error("Error fetching show:", error);
    return (
      <div>
        <h1>Show not found</h1>
        {/* TODO: Default 404 page */}
      </div>
    );
  }

  const mappedShow = sanitizeShow(showFromDB);

  let eventFromDB;
  try {
    eventFromDB = await getEvent(showFromDB.id);
  } catch (error) {
    console.error("Error fetching event:", error);
  }

  let mappedEvent: EventDTO | null = null;
  if (eventFromDB) {
    const filteredPerformances = filterUpcomingPerformances(eventFromDB);
    mappedEvent = sanitizeEvent({
      ...eventFromDB,
      performances: filteredPerformances,
    } as EventFromDB);
  }

  return (
    <>
      <Show showData={mappedShow} eventData={mappedEvent} />
    </>
  );
}
