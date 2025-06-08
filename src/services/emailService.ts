"use server";

import { SendMailClient } from "zeptomail";
import { zeptoMailFrom, zeptoMailToken, zeptoMailUrl } from "@/utils/constants";
import QRCode from "qrcode";
import { generateTicketPDF } from "@/lib/pdf/generateTicketPDF";
import util from "util";

type Attachment = {
  content: string; // base64 encoded
  name: string;
  mime_type: string;
  contentTransferEncoding?: string;
};

type SendZeptomailParams = {
  to: Array<{ address: string; name: string }>;
  subject: string;
  text: string;
  html?: string;
  attachments?: Attachment[];
};

export const sendZeptomail = async ({
  to,
  subject,
  text,
  html,
  attachments,
}: SendZeptomailParams): Promise<{
  success: boolean;
  message?: string;
  error?: unknown;
}> => {
  if (!zeptoMailUrl) throw new Error("ZEPTOMAIL_URL is not defined");
  if (!zeptoMailToken) throw new Error("ZEPTOMAIL_TOKEN is not defined");
  if (!zeptoMailFrom) throw new Error("ZEPTOMAIL_FROM is not defined");

  const client = new SendMailClient({
    url: zeptoMailUrl,
    token: zeptoMailToken,
  });

  try {
    await client.sendMail({
      from: zeptoMailFrom,
      to: to.map((recipient) => ({
        email_address: {
          address: recipient.address,
          name: recipient.name,
        },
      })),
      subject,
      textbody: text,
      ...(html ? { htmlbody: html } : {}),
      ...(attachments ? { attachments } : {}),
    });

    console.log("Email sent via ZeptoMail", {
      to: to.map((r) => r.address),
      subject,
    });

    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("❌ Failed to send email via sendZeptomail");

    if (error && typeof error === "object") {
      console.error(
        "Full error object:\n",
        util.inspect(error, { depth: null, colors: true, compact: false })
      );

      if ("error" in error && typeof error.error === "object") {
        console.error(
          "Nested 'error' property:\n",
          util.inspect(error.error, {
            depth: null,
            colors: true,
            compact: false,
          })
        );

        if (
          error.error &&
          typeof error.error === "object" &&
          "details" in error.error
        ) {
          console.error(
            "Error details:\n",
            util.inspect((error.error as { details?: unknown }).details, {
              depth: null,
              colors: true,
              compact: false,
            })
          );
        }
      }

      if ("response" in error && typeof error.response === "object") {
        console.error(
          "Response object:\n",
          util.inspect(error.response, {
            depth: null,
            colors: true,
            compact: false,
          })
        );
      }
    } else {
      console.error(error);
    }

    return { success: false, message: "Failed to send email", error };
  }
};

export const sendTicketsEmail = async (data: {
  email: string;
  fullName: string;
  showTitle: string;
  performanceDate: string;
  performanceTime: string;
  ticketIdsAndTypes: {
    id: string;
    type: string;
  }[];
}): Promise<{ success: boolean; message?: string; error?: unknown }> => {
  try {
    const attachments = await Promise.all(
      data.ticketIdsAndTypes.map(async (ticketIdAndType, index) => {
        const qrText = `https://teatrodelembuste.com/boletas/qr?id=${ticketIdAndType.id}&type=${ticketIdAndType.type}`;
        const qrDataUrl = await QRCode.toDataURL(qrText, { scale: 10 });

        const pdfBuffer = await generateTicketPDF(qrDataUrl, {
          name: data.fullName,
          show: data.showTitle,
          type: ticketIdAndType.type,
          date: data.performanceDate,
          time: data.performanceTime,
        });

        const base64Pdf = Buffer.from(pdfBuffer).toString("base64");

        return {
          content: base64Pdf,
          name: `boleta-${index + 1}-${data.showTitle}.pdf`,
          mime_type: "application/pdf",
          contentTransferEncoding: "base64",
        };
      })
    );

    const subject = `Tus entradas para ${data.showTitle}`;
    const text = `Hola ${data.fullName},

Adjuntamos tus entradas para la obra "${data.showTitle}".

Fecha: ${data.performanceDate}
Hora: ${data.performanceTime}

¡Nos vemos en el teatro!

— Teatro del Embuste`;

    const html = `
      <p>Hola ${data.fullName},</p>
      <p>Adjuntamos tus entradas para la obra <strong>${data.showTitle}</strong>.</p>
      <p>
        <strong>Fecha:</strong> ${data.performanceDate}<br/>
        <strong>Hora:</strong> ${data.performanceTime}
      </p>
      <p>¡Nos vemos en el teatro!</p>
      <p>— Teatro del Embuste</p>
    `;

    const emailPayload = {
      to: [
        {
          address: data.email,
          name: data.fullName,
        },
      ],
      subject,
      text,
      html,
      attachments,
    };

    const result = await sendZeptomail(emailPayload);

    return result;
  } catch (error) {
    console.error("❌ sendTicketsEmail failed:", error);
    return { success: false, message: "Failed to send tickets email", error };
  }
};

