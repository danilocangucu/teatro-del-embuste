import puppeteer from "puppeteer";

export async function generateTicketPDF(qrDataUrl: string, ticketInfo: { name: string; show: string, type: string, date: string, time: string }) {
  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: sans-serif;
            padding: 2rem;
          }
          .ticket {
            border: 1px solid #ccc;
            padding: 1rem;
            width: 300px;
            text-align: center;
          }
          img {
            margin-top: 1rem;
            width: 200px;
            height: 200px;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
        <h1>Boletas</h1>
          <h2>${ticketInfo.show}</h2>
          <p><strong>Teatro del Embuste</strong></p>
          <p><strong>Nombre:</strong> ${ticketInfo.name}</p>
          <p><strong>${ticketInfo.type}</strong></p>
          <p><strong>Fecha:</strong> ${ticketInfo.date}</p>
            <p><strong>Hora:</strong> ${ticketInfo.time}</p>
            <br />
            <p>Presenta este código QR en la entrada</p>
          <img src="${qrDataUrl}" alt="Código QR" />
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return pdfBuffer;
}
