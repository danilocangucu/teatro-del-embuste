"use client";

import classNames from "classnames";
import { useParams } from 'next/navigation';

import styles from "../../styles/Show/Show.module.css";

import { ShowDTO } from "@/types/Show";
import { EventDTO } from "@/types/Event";

import ShowHeader from "./ShowHeader/ShowHeader";
import ShowBoleteria from "./ShowBoleteria/ShowBoleteria";
import ShowVideoPlayer from "./ShowVideoPlayer";
import ShowOverview from "./ShowOverview/ShowOverview";
import ShowReviews from "./ShowReviews/ShowReviews";
import ShowTechnicalDetails from "./ShowTechinicalDetails/ShowTechnicalDetails";
import ShowHonors from "./ShowHonors/ShowHonors";

import { getYouTubeTrailerId } from "@/utils/showUtils";

const Show = ({
  showData,
  eventData,
}: {
  showData: ShowDTO;
  eventData: EventDTO | null;
}) => {
  const { showSlug } = useParams() as { showSlug: string };

  const trailerId = getYouTubeTrailerId(showData.media);

  return (
    <>
    <main className={classNames(styles.show, "u-container")}>
      <ShowHeader
        showData={showData}
        eventData={eventData}
      />
      {eventData && eventData?.performances.length !== 0 && (
        <ShowBoleteria eventData={eventData} showSlug={showSlug}/>
      )}
      {trailerId && <ShowVideoPlayer videoId={trailerId} />}
      <ShowOverview showData={showData} />
      <ShowReviews reviews={showData.reviews} />
      <ShowTechnicalDetails technicalDetails={showData.technicalDetails} />
      <ShowHonors awards={showData.awards} grants={showData.grants} />
    </main>
    </>
  );
};

export default Show;
