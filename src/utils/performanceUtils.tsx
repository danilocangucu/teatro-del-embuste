export function parsePerformanceSlug(slug: string) {
    const parts = slug.split("-");
    if (parts.length < 4) throw new Error("Invalid slug format");
  
    const [day, month, year] = parts.slice(0, 3);
    const timePart = parts.slice(3).join("-");
  
    const match = timePart.match(/^(\d{1,2})(?:-(\d{2}))?(AM|PM)$/);
  
    if (!match) {
      throw new Error("Invalid time format in slug");
    }
  
    const [, hourStr, minuteStr, period] = match;
    let hour = parseInt(hourStr, 10);
    const minutes = minuteStr ?? "00";
  
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
  
    // Normalize to HH:mm:ss for DB
    const performanceTime = `${String(hour).padStart(2, "0")}:${minutes}:00`;
    const performanceDate = `20${year}-${month}-${day}`;
  
    return {   performanceDate: new Date(`${performanceDate}T00:00:00Z`),
    performanceTime: new Date(`1970-01-01T${performanceTime}Z`) }
  }
  