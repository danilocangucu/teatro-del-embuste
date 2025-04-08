// type PerformanceDTO = {
//   eventId: string; // ID of the associated event
//   date: string; // Specific date for the performance (YYYY-MM-DD)
//   time?: string; // Optional time if different from the default time
//   availableSeats: number; // Number of seats currently available for this performance
// };

// type TicketType = "standard" | "student" | "senior"; // Enum-like union type

// type PricingDTO = {
//   id: string; // ID of this pricing option
//   type: TicketType;
//   price: number; // Price for this ticket type
// };

// type DiscountRuleDTO = {
//   id: string; // ID of this discount rule
//   type: "time_based" | "day_based" | "ticket_type"; // Type of discount
//   criteria: DiscountCriteriaDTO; // The criteria for the discount
//   discount: DiscountDTO; // Discount details
// };

// type DiscountCriteriaDTO = {
//   daysBeforeEvent?: number; // Applicable for time-based discounts
//   daysOfWeek?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[]; // Specific days for day-based discounts
//   ticketTypes?: TicketType[];
// };

// type DiscountDTO = {
//   type: "percentage" | "flat"; // Type of discount value
//   value: number; // Discount value (percentage or flat amount)
//   description: string; // Description of the discount
// };

// type EventDTO = {
//   id: string; // Unique identifier for the event
//   showId: string; // ID of the associated show
//   startDate: string; // Start date of the event (YYYY-MM-DD)
//   endDate: string; // End date of the event (YYYY-MM-DD)
//   isPremiere: boolean; // Indicates if this event is the premiere
//   defaultTime: string; // Default time for the event (HH:mm)
//   performances: PerformanceDTO[]; // Array of dates, times, and seat availability for the event
//   totalSeats: number; // Total number of seats available per performance
//   pricingIds: string[]; // Array of pricing type IDs linked to this event
//   discountRuleIds?: string[]; // Optional array of discount rule IDs linked to this event
// };
