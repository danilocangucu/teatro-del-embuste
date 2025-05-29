import { ShowFromDB, ShowMetadataFromDB } from "../types/Show";
import { EventMetadataFromDB } from "@/types/Event";
import { prisma } from "@/lib/prisma";

export const getShow = async (showSlug: string) => {
  const show = await prisma.shows.findUnique({
    where: { slug: showSlug },
    include: {
      show_category: {
        select: {
          categories: {
            select: {
              name: true,
              hex_color: true,
            },
          },
        },
      },

      reviews: {
        select: {
          excerpt: true,
          url: true,
          publications: {
            select: {
              name: true,
            },
          },
          authors: {
            select: {
              name: true,
            },
          },
        },
      },

      media: {
        select: {
          media_type: true,
          url: true,
          artists: {
            select: {
              name: true,
            },
          },
        },
      },

      downloads: {
        select: {
          download_type: true,
          url: true,
        },
      },

      artists: {
        select: {
          context: true,
          artists: {
            select: {
              name: true,
            },
          },
          roles: {
            select: {
              name: true,
              role_type: true,
            },
          },
        },
      },

      grants: {
        select: {
          grants: {
            select: {
              name: true,
              organizations: {
                select: {
                  name: true,
                },
              },
              description: true,
            },
          },
          context: true,
          year: true,
        },
      },

      awards: {
        select: {
          awards: {
            select: {
              name: true,
              organizations: {
                select: {
                  name: true,
                },
              },
              description: true,
            },
          },
          context: true,
          year: true,
        },
      },
    },
  });

  if (!show) {
    throw new Error("Show not found");
  }

  return show as ShowFromDB;
};

export const getShowIdAndTitle = async (showSlug: string) => {
  const show = await prisma.shows.findUnique({
    where: { slug: showSlug },
    select: {
      id: true,
      title: true,
    },
  });

  if (!show) {
    throw new Error("Show not found");
  }

  return { showId: show.id, showTitle: show.title };
};

// TODO change media_type in the DB to enums
// TODO check getShowMetadata errors
export const getShowMetadata = async (showSlug: string) => {
  const showMetadata = (await prisma.shows.findUnique({
    where: { slug: showSlug },
    select: {
      id: true,
      title: true,
      tagline: true,
      media: {
        where: {
          media_type: "mainImage",
        },
        select: {
          url: true,
        },
      },
    },
  })) as ShowMetadataFromDB;

  if (!showMetadata) {
    throw new Error("Show not found");
  }

  const eventMetadata = (await prisma.events.findFirst({
    where: { show_id: showMetadata.id },
    select: {
      start_date: true,
      end_date: true,
    },
  })) as EventMetadataFromDB;

  if (!eventMetadata) {
    throw new Error("Event not found");
  }

  return { showMetadata, eventMetadata };
};

export const getShowSlugFromShowId = async (showId: string) => {
  const show = await prisma.shows.findUnique({
    where: { id: showId },
    select: { slug: true },
  });

  if (!show) {
    throw new Error("Show not found");
  }

  return show.slug;
};

// TODO get showSlug and
