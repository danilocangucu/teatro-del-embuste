import { Decimal } from "@prisma/client/runtime/library";

export type EventDTO = {
  id?: string; // Unique identifier for the event
  startDate: string; // Start date of the event (YYYY-MM-DD)
  endDate: string; // End date of the event (YYYY-MM-DD)
  isPremiere: boolean; // Indicates if this event is the premiere
  defaultTime: string; // Default time for the event (HH:mm)
  performances: PerformanceDTO[]; // Array of dates, times, and seat availability for the event
  totalSeats: number; // Total number of seats available per performance
  pricings: PricingDTO[]; // Array of pricing type IDs linked to this event
  discountRules?: DiscountRuleDTO[]; // Optional array of discount rule IDs linked to this event
};

export type EventMetadataDTO = {
  startDate: string;
  endDate: string;
};

export type PerformanceDTO = {
  date: string; // Specific date for the performance (YYYY-MM-DD)
  time?: string; // Optional time if different from the default time
  availableSeats: number; // Number of seats currently available for this performance
};

type TicketType = "standard" | "student" | "senior"; // Enum-like union type

export type PricingDTO = {
  type: TicketType;
  price: number; // Price for this ticket type
};

export type DiscountRuleDTO = {
  type: "time_based" | "day_based" | "ticket_type"; // Type of discount
  criteria: DiscountCriteriaDTO; // The criteria for the discount
  discount: DiscountDTO; // Discount details
};

type DiscountCriteriaDTO = {
  daysBeforeEvent?: number; // Applicable for time-based discounts
  daysOfWeek?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[]; // Specific days for day-based discounts
  ticketTypes?: TicketType[];
};

type DiscountDTO = {
  type: "percentage" | "flat"; // Type of discount value
  value: number; // Discount value (percentage or flat amount)
  description: string; // Description of the discount
};

export type ReservationDTO = {
  id: string;
  performanceId: string;
  ticketType: TicketType;
  quantity: number;
  status: ReservationStatus;
  createdAt: string;
  expiresAt?: string;
  userId?: string; // Optional, if the reservation is linked to a user
  appliedDiscounts?: DiscountDTO[]; // Optional, if discounts are applied
  totalPrice: number; // Total price after applying discounts
};

type ReservationStatus = "pending" | "confirmed" | "expired" | "cancelled";

export type EventFromDB = {
  id: string;
  start_date: Date;
  end_date: Date;
  total_seats: number;
  is_premiere: boolean | null;
  default_time: Date;
  performances: PerformanceFromDB[];
  event_pricings: {
    pricings: PricingFromDB;
  }[];
  event_discount_rules: {
    discount_rules: {
      type: "time_based" | "day_based" | "ticket_type";
      discounts: DiscountFromDB;
      discount_criteria: DiscountCriteriaFromDB | null;
    };
  }[];
};

export type EventMetadataFromDB = {
  start_date: Date;
  end_date: Date;
};

export type PerformanceFromDB = {
  date: Date;
  time: Date | null;
  available_seats: number;
};

export type PricingFromDB = {
  type: "standard" | "student" | "senior";
  price: Decimal;
};

export type DiscountRuleFromDB = {
  type: "time_based" | "day_based" | "ticket_type";

  discounts: DiscountFromDB[];

  discount_criteria: DiscountCriteriaFromDB | null;
};

export type DiscountFromDB = {
  type: "percentage" | "flat";
  value: Decimal;
  description: string;
};

export type DiscountCriteriaFromDB = {
  days_before_event: number | null;
  days_of_week: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[];
  ticket_types: ("standard" | "student" | "senior")[];
};
