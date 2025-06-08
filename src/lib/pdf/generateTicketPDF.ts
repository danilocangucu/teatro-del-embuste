import { PDFDocument, StandardFonts } from "pdf-lib";

export async function generateTicketPDF(
  qrDataUrl: string,
  ticketInfo: {
    name: string;
    show: string;
    type: string;
    date: string;
    time: string;
  }
) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 600]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { height } = page.getSize();

  page.drawText("Boleta", { x: 50, y: height - 50, size: 20, font });
  page.drawText(ticketInfo.show, { x: 50, y: height - 80, size: 16, font });
  page.drawText("Teatro del Embuste", {
    x: 50,
    y: height - 110,
    size: 12,
    font,
  });
  page.drawText(`Nombre: ${ticketInfo.name}`, {
    x: 50,
    y: height - 140,
    size: 12,
    font,
  });
  page.drawText(`${ticketInfo.type}`, {
    x: 50,
    y: height - 160,
    size: 12,
    font,
  });
  page.drawText(`Fecha: ${ticketInfo.date}`, {
    x: 50,
    y: height - 180,
    size: 12,
    font,
  });
  page.drawText(`Hora: ${ticketInfo.time}`, {
    x: 50,
    y: height - 200,
    size: 12,
    font,
  });

  const qrImageBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");
  const qrImage = await pdfDoc.embedPng(qrImageBytes);
  page.drawImage(qrImage, {
    x: 100,
    y: height - 400,
    width: 200,
    height: 200,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
