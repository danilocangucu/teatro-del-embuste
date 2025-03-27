type ShowDTO = {
  id: string; // Unique identifier for the show
  title: string; // Title of the show
  tagline: string; // Tagline or brief description of the show
  description: string; // Full description or synopsis of the show
  media: MediaDTO[]; // Array of media content (images, trailers, etc.)
  downloads: DownloadDTO[]; // Array of downloadable content
  importantNotice?: string; // Optional notice for attendees
  technicalDetails: TechnicalDetailsDTO; // Store technical details in a separate object
  reviews?: ReviewDTO[]; // Array of reviews
  awards?: AwardDTO[]; // Array of awards
  grants?: GrantDTO[]; // Array of grants
};

type MediaDTO = {
  showId: string; // Reference to the ShowDTO
  mediaType:
    | "mainImage"
    | "additionalImage"
    | "trailer"
    | "fullPlay"
    | "poster"; // Descriptive media type
  url: string; // URL to the media content
};

type DownloadDTO = {
  showId: string; // Reference to the ShowDTO
  fileType: "text" | "dossier" | "technicalRider"; // Type of downloadable file
  url: string; // URL to the downloadable file
};

type TechnicalDetailsDTO = {
  premiereYear?: number; // Year the show premiered
  durationMinutes: number; // Duration of the show in minutes
  company?: string; // Name of the theater company
  artists: ArtistRoleDTO[]; // Array of artists (cast and production team) with their roles
  genre: string; // Genre of the show
  language: string; // Language of the show
};

type ArtistDTO = {
  id: string; // Unique identifier for the actor
  name: string; // Artist's name
};

type ArtistRoleDTO = {
  artistId: string; // Reference to the ArtistDTO
  showId: string; // Reference to the show
  role: string; // Role name (actor, director, etc.)
  context?: string; // Context will come before the role name (e.g., context: "Versión libre de la obra de", name: "Marco Antonio de la Parra")
  roleType: "cast" | "production"; // Type of role (cast or production)
};

type AuthorDTO = {
  id: string; // Unique identifier for the author
  name: string; // Name of the author
};

type PublicationDTO = {
  id: string; // Unique identifier for the publication
  name: string; // Name of the publication
};

type ReviewDTO = {
  id: string; // Unique identifier for the review
  authorId: string; // Reference to the AuthorDTO
  publicationId: string; // Reference to the PublicationDTO
  excerpt: string; // Short excerpt from the review
  url: string; // Link to the full review
  showId: string; // Reference to the show the review is associated with
};

type AwardDTO = {
  id: string; // Unique identifier for the award
  name: string; // Name of the award
  organization: string; // Awarding organization
  description: string; // Description of the award
};

type ShowAwardDTO = {
  awardId: string; // Reference to the AwardDTO
  showId: string; // Reference to the ShowDTO
  year: number; // Year the award was received
};

type GrantDTO = {
  id: string; // Unique identifier for the grant
  name: string; // Name of the grant
  organization: string; // Granting organization
  description: string; // Description of the grant
};

type ShowGrantDTO = {
  grantId: string; // Reference to the GrantDTO
  showId: string; // Reference to the ShowDTO
  year: number; // Year the grant was awarded
};

