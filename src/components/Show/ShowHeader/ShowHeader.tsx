"use client";

import { ShowDTO } from "@/types/Show";
import { EventDTO } from "@/types/Event";

import ShowImage from "./ShowImage";
import ShowTitle from "./ShowTitle";
import ShowInfo from "./ShowInfo";

import { getMainImage, hasShowUpcomingOrRunningEvent } from "@/utils/showUtils";

type ShowHeaderProps = {
  showData: ShowDTO;
  eventData: EventDTO | null;
};

function ShowHeader({ showData, eventData }: ShowHeaderProps) {
  let showHasEvent = false;
  if (eventData) {
    showHasEvent = hasShowUpcomingOrRunningEvent(
      eventData.startDate,
      eventData.defaultTime
    );
  }

  const mainImage = getMainImage(showData.media);

  return (
    <header>
      {/* TODO It needs to handle additional images */}
      {mainImage && <ShowImage mainImage={mainImage} />}
      <section className="fontSecondaryMedium">
        <ShowTitle title={showData.title} />
        <ShowInfo
          category={showData.category}
          eventData={eventData}
          showHasEvent={showHasEvent}
        />
      </section>
    </header>
  );
}

export default ShowHeader;
