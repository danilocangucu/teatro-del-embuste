type EventDTO = {
  id: string; // Unique identifier for the event
  showId: string; // ID of the associated show
  startDate: string; // Start date of the event (YYYY-MM-DD)
  endDate: string; // End date of the event (YYYY-MM-DD)
  isPremiere: boolean; // Indicates if this event is the premiere
  defaultTime: string; // Default time for the event (HH:mm)

  eventDates: {
    date: string; // Specific date for the event (YYYY-MM-DD)
    time?: string; // Optional time if different from the default time
  }[]; // Array of dates and times for the event

  totalSeats: number; // Total number of seats available
  availableSeats: number; // Number of seats currently available

  pricing: {
    type: string; // Ticket type (e.g., standard, student, senior)
    price: number; // Price for this ticket type
  }[]; // Array of ticket pricing options

  discountRules?: {
    type: "time_based" | "day_based" | "ticket_type"; // Type of discount
    criteria: {
      daysBeforeEvent?: number; // Applicable for time-based discounts
      daysOfWeek?: string[]; // Days of the week for day-based discounts
      ticketTypes?: string[]; // Ticket types for ticket-type discounts
    };
    discount: {
      type: "percentage" | "flat"; // Type of discount value
      value: number; // Discount value (percentage or flat amount)
      description: string; // Description of the discount
    };
  }[]; // Optional array of discount rules
};
