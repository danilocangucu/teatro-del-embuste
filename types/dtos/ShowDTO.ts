type ShowDTO = {
  id: string; // Unique identifier for the show
  title: string; // Title of the show
  tagline: string; // Tagline or brief description of the show
  description: string; // Full description or synopsis of the show
  mainImage: string; // URL to the main image for the show
  additionalImages: string[]; // Array of URLs for additional images
  importantNotice?: string; // Optional notice for attendees
  durationMinutes: number; // Duration of the show in minutes
  startDate: string; // Start date of the show (YYYY-MM-DD)
  endDate: string; // End date of the show (YYYY-MM-DD)

  technicalDetails: {
    company: string; // Name of the theater company
    director: string; // Director's name
    playwright: string; // Playwright's name
    cast: {
      name: string; // Actor's name
      role?: string; // Optional role they play
    }[]; // Array of cast members
    productionTeam: {
      role: string; // Role on the production team
      name: string; // Name of the team member
    }[]; // Array of production team members
    genre: string; // Genre of the show
    language: string; // Language of the show
  };

  reviews?: {
    author: string; // Name of the reviewer or publication
    excerpt: string; // Short excerpt from the review
    url: string; // Link to the full review
  }[]; // Optional array of reviews

  awards?: {
    name: string; // Name of the award
    organization: string; // Awarding organization
    year: number; // Year the award was received
    description: string; // Description of the award
  }[]; // Optional array of awards

  grants?: {
    name: string; // Name of the grant
    organization: string; // Granting organization
    year: number; // Year the grant was awarded
    description: string; // Description of the grant
  }[]; // Optional array of grants
};
