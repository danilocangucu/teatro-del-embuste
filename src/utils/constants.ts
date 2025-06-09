// STYLES
export const browserDefaultMargin = "8px";

// IMAGES & ICONS
export const arrowRightUp = "/arrow-up-right-1.svg";
export const arrowRightUpWhite = "/arrow-up-right-white.svg";
export const logo = "/logo.png";
export const logoFooter = "/logo_footer.png";

// ROUTES
export const ticketsPath = "/boletas";

// TICKETS
export const shopSteps = [
  "Boletas",
  "Identidad",
  "Revisión",
  "Pago",
  "Verificación",
  "Confirmación",
];

// BOLD
export const boldFixedFee = 900;
export const boldFeePercentage = 0.0349; // 3.49%

// EMAIL
export const zeptoMailUrl = process.env.ZEPTOMAIL_URL;
export const zeptoMailToken = process.env.ZEPTOMAIL_TOKEN;
export const zeptoMailFrom = {
  address: "notificaciones@teatrodelembuste.com",
  name: "Teatro del Embuste",
};

// JWT & COOKIES
export const RESERVATION_COOKIE_KEY = "ticket-reservation";
export const JWT_SECRET = process.env.JWT_SECRET!;