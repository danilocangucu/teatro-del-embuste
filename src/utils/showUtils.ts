import { ArtistFromDB, AwardFromDB, DownloadFromDB, GrantFromDB, MediaFromDB, ReviewFromDB, ShowDTO, ShowFromDB } from "../types/Show";


export const sanitizeShow = (show: ShowFromDB): ShowDTO => {
  return {
    title: show.title,
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
      })),
      genre: show.genre ?? null,
      language: show.language ?? null,
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
    })),
    downloads: show.downloads.map((download: DownloadFromDB) => ({
      downloadType: download.download_type,
      url: download.url,
    })),
    awards: show.awards.map((award: AwardFromDB) => ({
      name: award.awards.name,
      description: award.awards.description,
      context: award.context ?? undefined,
      year: award.year,
      organization: award.awards.organizations.name,
    })),
    grants: show.grants.map((grant: GrantFromDB) => ({
      name: grant.grants.name,
      description: grant.grants.description,
      context: grant.context ?? undefined,
      year: grant.year,
      organization: grant.grants.organizations.name,
    })),
  };
};
