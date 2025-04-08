export type ShowDTO = {
  title: string; // Title of the show
  tagline: string; // Tagline or brief description of the show
  description: string; // Full description or synopsis of the show
  technicalDetails: TechnicalDetailsDTO; // Store technical details in a separate object
  reviews?: ReviewDTO[]; // Array of reviews
  media: MediaDTO[]; // Array of media content (images, trailers, etc.)
  downloads: DownloadDTO[]; // Array of downloadable content
  awards?: AwardDTO[]; // Array of awards
  grants?: GrantDTO[]; // Array of grants
};

export type MediaDTO = {
  mediaType:
    | "mainImage"
    | "additionalImage"
    | "trailer"
    | "fullPlay"
    | "poster"; // Descriptive media type
  url: string; // URL to the media content
};

export type DownloadDTO = {
  downloadType: "text" | "dossier" | "technicalRider"; // Type of downloadable file
  url: string; // URL to the downloadable file
};

export type TechnicalDetailsDTO = {
  premiereYear?: number | null; // Year the show premiered
  durationMinutes: number | undefined | null; // Duration of the show in minutes
  company?: string | null; // Name of the theater company
  artists: ArtistDTO[]; // Array of artists (cast and production team) with their roles
  genre: string | null; // Genre of the show
  language: string | null; // Language of the show
  importantNotice?: string; // Optional notice for attendees
};

export type ArtistDTO = {
  name: string; // Artist's name
  role: string | undefined; // Role name (actor, director, etc.)
  context?: string | null; // Context will come before the role name (e.g., context: "Versión libre de la obra de", name: "Marco Antonio de la Parra")
  roleType: "cast" | "production"; // Type of role (cast or production)
};

export type ReviewDTO = {
  author?: string; // Name of the author
  publication: string | null; // Name of the publication
  excerpt: string; // Short excerpt from the review
  url: string; // Link to the full review
};

export type AwardDTO = {
  name: string; // Name of the award
  description: string; // Description of the award
  context?: string; // Context will come before the award name (e.g., context: "Premio a la mejor obra de teatro")
  year: number; // Year the award was received
  organization: string; // Awarding organization
};

export type GrantDTO = {
  name: string; // Name of the grant
  description: string; // Description of the grant
  context?: string; // Context will come before the grant name (e.g., context: "Beca a la mejor obra de teatro")
  year: number; // Year the grant was awarded
  organization: string; // Granting organization
};

export type ShowFromDB = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  important_notice: string | null;
  genre: string | null;
  language: string | null;
  premiere_year: number | null;
  duration_minutes: number | null;
  company: string | null;
  slug: string;
  reviews: ReviewFromDB[];
  media: MediaFromDB[];
  downloads: {
    download_type: "text" | "dossier" | "technicalRider";
    url: string;
  }[];
  artists: {
    context: string | null;
    artists: {
      name: string;
    };
    roles: {
      name: string;
      role_type: "cast" | "production";
    };
  }[];
  grants: {
    grants: {
      name: string;
      organizations: {
        name: string;
      };
      description: string;
    };
    context: string | null;
    year: number;
  }[];
  awards: {
    awards: {
      name: string;
      organizations: {
        name: string;
      };
      description: string;
    };
    context: string | null;
    year: number;
  }[];
};

export type ReviewFromDB = {
  excerpt: string;
  url: string;
  publications: {
    name: string;
  };
  authors: {
    name: string;
  };
};

export type MediaFromDB = {
  media_type:
    | "mainImage"
    | "additionalImage"
    | "trailer"
    | "fullPlay"
    | "poster";
  url: string;
};

export type DownloadFromDB = {
  download_type: "text" | "dossier" | "technicalRider";
  url: string;
};

export type ArtistFromDB = {
  context: string | null;
  artists: {
    name: string;
  };
  roles: {
    name: string;
    role_type: "cast" | "production";
  };
};

export type GrantFromDB = {
  grants: {
    name: string;
    organizations: {
      name: string;
    };
    description: string;
  };
  context: string | null;
  year: number;
};

export type AwardFromDB = {
  awards: {
    name: string;
    organizations: {
      name: string;
    };
    description: string;
  };
  context: string | null;
  year: number;
};
