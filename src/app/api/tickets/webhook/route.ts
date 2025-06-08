import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import {
  getReservation,
  getReservationItemsByReservationId,
  updateReservationStatusAndPaymentId,
} from "@/services/reservationService";
import { reservation_status } from "@prisma/client";
import { getPerformanceByReservationId } from "@/services/performanceService";
import { getISODate, getISOTime } from "@/utils/eventUtils";
import { getShowTitleByEventId } from "@/services/showService";
import { getUser } from "@/services/userService";
import { createTickets } from "@/services/ticketService";
import { sendTicketsEmail } from "@/services/emailService";

// const BOLD_SECRET_KEY = process.env.BOLD_PRUEBA_LLAVE_SECRETA!;
const BOLD_MERCHANT_ID = process.env.BOLD_MERCHANT_ID!;
const TICKET_SUFIX = process.env.TICKET_SUFIX!;

type BoldNotification = {
  id: string;
  type: "SALE_APPROVED" | "SALE_REJECTED" | "VOID_APPROVED" | "VOID_REJECTED";
  subject: string;
  source: string;
  spec_version: string;
  time: number;
  datacontenttype: "application/json";
  data: {
    payment_id: string;
    merchant_id: string;
    created_at: string;
    amount: {
      total: number;
      taxes: Array<{
        base: number;
        type: string;
        value: number;
      }>;
      tip: number;
    };
    card: {
      capture_mode: string;
      franchise:
        | "VISA"
        | "VISA_ELECTRON"
        | "MASTERCARD"
        | "MAESTRO"
        | "AMERICAN_EXPRESS"
        | "CODENSA"
        | "DINERS"
        | "DISCOVER"
        | "TUYA"
        | "SODEXO"
        | "OLIMPICA"
        | "UNKOWN";
      cardholder_name: string;
      terminal_id: string;
      masked_pan?: string;
    };
    user_id: string;
    payment_method:
      | "CARD"
      | "SOFT_POS"
      | "CARD_WEB"
      | "PSE"
      | "NEQUI"
      | "BOTON_BANCOLOMBIA";
    metadata: {
      reference: string;
    };
  };
};

export async function POST(req: NextRequest) {
  console.log("[Webhook] Received POST request");

  // ✅ Respond fast to avoid 2s timeout
  const response = NextResponse.json({ received: true });

  // Clone request for async processing
  const clone = req.clone();
  processWebhook(clone).catch((err) => {
    console.error("[Webhook] ❌ Processing failed:", err);
  });

  return response;
}

async function processWebhook(req: Request) {
  const signature = req.headers.get("x-bold-signature");
  if (!signature) throw new Error("Missing x-bold-signature header");

  const rawBody = await req.arrayBuffer();
  const rawBuffer = Buffer.from(rawBody);
  const encoded = rawBuffer.toString("base64");

  const generatedHmac = createHmac("sha256", "").update(encoded).digest("hex");

  const hmacBuffer = Buffer.from(generatedHmac, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  if (hmacBuffer.length !== signatureBuffer.length) {
    console.error("[Webhook] ❌ Signature length mismatch", {
      expectedLength: hmacBuffer.length,
      actualLength: signatureBuffer.length,
      generatedHmac,
      signature,
    });
    throw new Error("[Webhook] Signature length mismatch");
  }

  const isValid = timingSafeEqual(hmacBuffer, signatureBuffer);
  if (!isValid) {
    console.error("[Webhook] ❌ Invalid signature", {
      generatedHmac,
      signature,
      encodedBody: encoded,
      rawBody: rawBuffer.toString("utf8"),
    });
    throw new Error("[Webhook] Invalid signature");
  }

  const body = JSON.parse(rawBuffer.toString("utf8")) as BoldNotification;

  if (body.data.merchant_id !== BOLD_MERCHANT_ID) {
    console.error("[Webhook] ❌ Invalid merchant ID", {
      expectedMerchantId: BOLD_MERCHANT_ID,
      receivedMerchantId: body.data.merchant_id,
    });
    throw new Error("[Webhook] Invalid merchant ID");
  }

  if (!body.data.metadata.reference.endsWith(TICKET_SUFIX)) {
    console.error("[Webhook] ❌ Invalid reference format", {
      reference: body.data.metadata.reference,
      expectedSuffix: TICKET_SUFIX,
    });
    throw new Error("[Webhook] Invalid reference format");
  }

  const referenceWithoutSufix = body.data.metadata.reference.slice(
    0,
    -TICKET_SUFIX.length
  );

  console.log("[Webhook] ✅ Valid and processed event:", {
    type: body.type,
    reference: referenceWithoutSufix,
    total: body.data.amount.total,
    payment_id: body.data.payment_id,
  });

  const event = {
    paymentStatus: body.type,
    reservationId: referenceWithoutSufix,
    totalPrice: body.data.amount.total,
    boltPaymentId: body.data.payment_id,
  };

  console.log("[Webhook] 📦 Event to process:", event);

  const reservation = await getReservation(event.reservationId);
  if (!reservation) {
    console.error("[Webhook] ❌ Reservation not found", {
      reservationId: event.reservationId,
    });
    // TODO send e-mail to embuste admin with reservationId not found and body
    throw new Error("[Webhook] Reservation not found");
  }

  console.log("[Webhook] ✅ Reservation found:", reservation);

  // TODO attention: while testing, total from Bold is 0, should be changed in production
  if (0 !== event.totalPrice) {
    // if (reservation.total_price !== event.totalPrice) {
    console.error("[Webhook] ❌ Price mismatch", {
      expectedPrice: reservation.total_price,
      receivedPrice: event.totalPrice,
    });
    // TODO send e-mail to embuste admin with reservationId, expected price from DB, received price from webhook and body
    throw new Error("[Webhook] Price mismatch");
  }

  console.log("[Webhook] ✅ Price matches, processing event...");

  if (reservation.status !== reservation_status.reviewing) {
    console.warn(
      `[Webhook] ⚠️ Reservation received with status ${reservation.status}`,
      {
        reservationId: event.reservationId,
        status: reservation.status,
      }
    );
    // TODO send e-mail to embuste admin with reservationId, status from DB and status from webhook and body
    return;
  }

  console.warn(
    `[Webhook] ⚠️ Processing reservation ${event.reservationId} with status ${reservation.status}`
  );
  console.warn(`[Webhook] ⚠️ User id: ${reservation.user_id}`);

  const reservationStatus =
    event.paymentStatus === "SALE_APPROVED"
      ? reservation_status.confirmed
      : event.paymentStatus === "SALE_REJECTED"
      ? reservation_status.cancelled
      : event.paymentStatus === "VOID_APPROVED"
      ? reservation_status.cancellation_approved
      : reservation_status.cancellation_denied;

  if (
    reservationStatus !== reservation_status.cancelled &&
    reservationStatus !== reservation_status.confirmed
  ) {
    console.warn(
      `[Webhook] ⚠️ Updating reservation ${event.reservationId} status to ${reservationStatus}`
    );
  }

  const updatedReservation = await updateReservationStatusAndPaymentId(
    event.reservationId,
    reservationStatus,
    event.boltPaymentId
  );
  console.log("[Webhook] ✅ Reservation updated:", updatedReservation);

  if (reservationStatus === reservation_status.confirmed) {
    console.log(`[Webhook] ✅ Reservation ${event.reservationId} confirmed`);
    console.log("[Webhook] 📧 Preparing confirmation email...");

    const performance = await getPerformanceByReservationId(
      event.reservationId
    );

    if (!performance) {
      console.error("[Webhook] ❌ Performance not found for reservation", {
        reservationId: event.reservationId,
      });
    }

    const showTitle = await getShowTitleByEventId(performance.event_id);

    if (!showTitle) {
      console.error("[Webhook] ❌ Show title not found for event", {
        eventId: performance.event_id,
      });
      throw new Error("[Webhook] Show title not found for confirmation email");
    }

    if (!reservation.user_id) {
      console.error("[Webhook] ❌ User ID not found in reservation", {
        reservationId: event.reservationId,
      });
      throw new Error("[Webhook] User ID not found for confirmation email");
    }

    const user = await getUser(reservation.user_id);

    if (!user) {
      console.error("[Webhook] ❌ User not found for reservation", {
        userId: reservation.user_id,
      });
      throw new Error("[Webhook] User not found for confirmation email");
    }

    const reservationItems = await getReservationItemsByReservationId(
      reservation.id
    );

    if (!reservationItems || reservationItems.length === 0) {
      console.error("[Webhook] ❌ No reservation items found", {
        reservationId: reservation.id,
      });
      throw new Error("[Webhook] No reservation items found");
    }

    // TODO vm should be cleaning not valid reservation items from time to time
    const validReservationItems = reservationItems.filter(
      (item) => item.quantity > 0
    );

    if (validReservationItems.length === 0) {
      console.error("[Webhook] ❌ No valid reservation items found", {
        reservationId: reservation.id,
      });
      throw new Error(
        "[Webhook] No valid reservation items for confirmation email"
      );
    }

    const ticketIdsAndTypes = await createTickets(
      performance.event_id,
      performance.id,
      reservation.id,
      user.id,
      user.email,
      validReservationItems
    );

    if (ticketIdsAndTypes.length === 1) {
      console.log(
        "[Webhook] ✅ Ticket created with ID and type:",
        ticketIdsAndTypes[0]
      );
    } else {
      console.log(
        "[Webhook] ✅ Tickets created with IDs and types:",
        ticketIdsAndTypes
      );
    }

    console.log("[Webhook] 📧 Sending confirmation email...");

    const sentTicketsEmail = await sendTicketsEmail({
      email: user.email,
      fullName: user.full_name,
      showTitle,
      performanceDate: getISODate(performance.date),
      performanceTime: getISOTime(performance.time!),
      ticketIdsAndTypes,
    });

    if (!sentTicketsEmail.success) {
      console.error("[Webhook] ❌ Failed to send ticket email", {
        error: sentTicketsEmail.error,
      });
      throw new Error("[Webhook] Failed to send ticket email");
    }
    console.log("[Webhook] ✅ Ticket email sent successfully");
  }
}
