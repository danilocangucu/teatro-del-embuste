import { DiscountRuleDTO } from "@/types/Event";

export function isDiscountActive(discountRule: DiscountRuleDTO, eventStartDateStr: string) {
  if (discountRule.type !== "time_based") return false;

  console.log(1)

  const daysBeforeEvent = discountRule.criteria.daysBeforeEvent;
  if (typeof daysBeforeEvent !== "number") return false;
console.log(2)
  
  // Parse event start date (assuming ISO yyyy-mm-dd)
  const eventStartDate = new Date(eventStartDateStr + "T00:00:00");

  // Current date, zero time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate the last day discount applies
  const discountLastDay = new Date(eventStartDate);
  discountLastDay.setDate(eventStartDate.getDate() - daysBeforeEvent);

  return today < discountLastDay && today < eventStartDate;
}

export async function generateIntegritySignature(concatenatedString: string): Promise<string> {
  // Codificar la cadena en UTF-8
  const encodedText = new TextEncoder().encode(concatenatedString);
 
  // Generar el hash SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedText);
 
  // Convertir el buffer del hash en un array de bytes
  const hashArray = Array.from(new Uint8Array(hashBuffer));
 
  // Convertir cada byte en una representación hexadecimal y unirlos en una sola cadena
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
 
  return hashHex;
}