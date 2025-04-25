import classNames from "classnames";

import { ArtistDTO, ArtistFromDB, AwardFromDB, DownloadFromDB, GrantFromDB, MediaDTO, MediaFromDB, ReviewFromDB, ShowDTO, ShowMetadataFromDB, ShowFromDB, TechnicalDetailsDTO, ShowMetadataDTO } from "../types/Show";
import styles from "../styles/Show/Show.module.css";
import { combineDateAndTime, parseTimeString } from "./sharedUtils";
import { EventMetadataDTO } from "@/types/Event";
import { Metadata } from "next";
import { formatEventDateRange } from "./eventUtils";
// TODO make it all const or all function?

export const sanitizeShow = (show: ShowFromDB): ShowDTO => {
  return {
    title: show.title,
    category: {
      name:  show.show_category.categories.name,
      hexColor: show.show_category.categories.hex_color,
    },
    tagline: show.tagline,
    description: show.description,
    technicalDetails: {
      premiereYear: show.premiere_year ?? null,
      durationMinutes: show.duration_minutes ?? null,
      company: show.company ?? null,
      artists: show.artists.map((artistRole: ArtistFromDB) => ({
        name: artistRole.artists.name,
        role: artistRole.roles.name,
        roleType: artistRole.roles.role_type,
        context: artistRole.context ?? null,
      })),
      genre: show.genre ?? null,
      language: show.language ?? null,
      importantNotice: show.important_notice ?? null,
    },
    reviews: show.reviews.map((review: ReviewFromDB) => ({
      author: review.authors.name,
      publication: review.publications.name,
      excerpt: review.excerpt,
      url: review.url,
    })),
    media: show.media.map((mediaItem: MediaFromDB) => ({
      mediaType: mediaItem.media_type,
      url: mediaItem.url,
      artist: mediaItem?.artists?.name ?? null,
    })),
    downloads: show.downloads.map((download: DownloadFromDB) => ({
      downloadType: download.download_type,
      url: download.url,
    })),
    awards: show.awards.map((award: AwardFromDB) => ({
      name: award.awards.name,
      description: award.awards.description,
      context: award.context ?? null,
      year: award.year,
      organization: award.awards.organizations.name,
    })),
    grants: show.grants.map((grant: GrantFromDB) => ({
      name: grant.grants.name,
      description: grant.grants.description,
      context: grant.context ?? null,
      year: grant.year,
      organization: grant.grants.organizations.name,
    })),
  };
};

export const sanitizeShowMetadata = (show: ShowMetadataFromDB): ShowMetadataDTO => {
  return { 
    title: show.title,
    tagline: show.tagline,
    media: {url: show.media[0].url},
   };
}

export function formatDescriptionParagraphs(description: string) {
  const paragraphs = description.split("\n");

  return paragraphs.map((paragraph, index) => (
    <p
      key={index}
      className={classNames(
        styles.showDescription,
        "fontPrimary"
      )}
    >
      {paragraph}
    </p>
  ));
}

export function formatNamesWithContext(
  people: { name: string; context: string | null }[]
): string {
  const withContext = people.map(({ name, context }) =>
    context ? `${context} ${name}` : name
  );

  if (withContext.length === 0) return "";
  if (withContext.length === 1) return withContext[0];
  if (withContext.length === 2) return `${withContext[0]} y ${withContext[1]}`;

  return `${withContext.slice(0, -1).join(", ")} y ${withContext.slice(-1)}`;
}

export function hasShowUpcomingOrRunningEvent(
  endDateStr: string,
  defaultTimeStr: string
): boolean {
  const currentTime = new Date();
  const endDate = new Date(endDateStr);
  const defaultTime = parseTimeString(defaultTimeStr);

  const end = combineDateAndTime(endDate, defaultTime);

  return currentTime.getTime() <= end.getTime();
}


export function getYouTubeTrailerId(media: MediaDTO[] | undefined): string | null {
  const trailer = media?.find(
    (item) => item.mediaType === "trailer" && !!item.url
  );

  const url = trailer?.url;
  if (!url) return null;

  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );

  return match?.[1] || null;
}

export const getMainImage = (media: ShowDTO["media"]) => {
  return media.find((item) => item.mediaType === "mainImage") || null;
};

export function getTicketStatus(
  availableSeats: number,
  totalSeats: number
): "AGOTADA" | "ÚLTIMAS BOLETAS" | "" {
  if (availableSeats === 0) return "AGOTADA";
  if (availableSeats / totalSeats <= 0.1) return "ÚLTIMAS BOLETAS";
  return "";
}

export function filterArtistsByRoleType(
  artists: ArtistDTO[],
  roleType: "cast" | "production"
) {
  return artists.filter((artist) => artist.roleType === roleType);
}

export function groupArtistsByRole(
  artists: ArtistDTO[]
): Record<string, { name: string; context: string | null }[]> {
  return artists.reduce<Record<string, { name: string; context: string | null }[]>>(
    (acc, { name, role, context }) => {
      if (!role) return acc;
      acc[role] = acc[role] || [];
      acc[role].push({ name, context: context ?? null });
      return acc;
    },
    {}
  );
}

export function getBasicTechnicalDetails(
  technicalDetails: TechnicalDetailsDTO
): { label: string; value: string | null }[] {
  const details = [
    {
      label: "AÑO DE ESTRENO",
      value: String(technicalDetails.premiereYear),
    },
    {
      label: "DURACIÓN",
      value: `${technicalDetails.durationMinutes} minutos`,
    },
    {
      label: "IDIOMA",
      value: technicalDetails.language || "",
    },
    {
      label: "GÉNERO",
      value: technicalDetails.genre || "",
    },
  ];

  // Add "" to represent the <br /> after "GÉNERO" if there is no company
  if (!technicalDetails.company) {
    details.push({ label: "", value: "" });
  }

  // Add "" after COMPAÑÍA if it exists
  if (technicalDetails.company) {
    details.push({
      label: "COMPAÑÍA",
      value: technicalDetails.company,
    });
    details.push({ label: "", value: "" });
  }

  return details;
}

export const formatSeasonDateMetadata = (dateRange: string): string => {
  const [startDate, endDate] = dateRange.split(" - ");
  return `del ${startDate} al ${endDate}`;
};

export const generateShowMetadata = (
  mappedShowMetadata: ShowMetadataDTO,
  mappedEventMetadata: EventMetadataDTO,
  showSlug: string
): Metadata => {
  const eventDateRange = formatEventDateRange(mappedEventMetadata.startDate, mappedEventMetadata.endDate);
  const formattedMetadataDate = formatSeasonDateMetadata(eventDateRange);

  return {
    title: mappedShowMetadata.title,
    description: `“${mappedShowMetadata.tagline}” – ${mappedShowMetadata.title}: Temporada ${formattedMetadataDate} en el Teatro del Embuste`,
    openGraph: {
      title: mappedShowMetadata.title,
      description: `“${mappedShowMetadata.tagline}” – ${mappedShowMetadata.title}: Temporada ${formattedMetadataDate} en el Teatro del Embuste`,
      url: `https://teatrodelembuste.com/obra/${showSlug}`,
      siteName: "Teatro del Embuste",
      type: "website",
      images: [
        {
          url: mappedShowMetadata.media.url,
          width: 1277,
          height: 662,
          alt: mappedShowMetadata.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: mappedShowMetadata.title,
      description: `“${mappedShowMetadata.tagline}” – ${mappedShowMetadata.title}: Temporada ${formattedMetadataDate} en el Teatro del Embuste`,
      images: [mappedShowMetadata.media.url],
    },
  };
};
