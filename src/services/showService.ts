import { PrismaClient } from "@prisma/client";
import { ShowFromDB } from "../types/Show";

const prisma = new PrismaClient();

export const getShow = async (showSlug: string) => {
  const show = await prisma.shows.findUnique({
    where: { slug: showSlug },
    include: {
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
