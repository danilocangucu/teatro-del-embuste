"use server";

import { SendMailClient } from "zeptomail";
import { zeptoMailFrom, zeptoMailToken, zeptoMailUrl } from "@/utils/constants";

type SendZeptomailParams = {
  to: Array<{ address: string; name: string }>;
  subject: string;
  text: string;
  html?: string;
};

export const sendZeptomail = async ({
  to,
  subject,
  text,
  html,
}: SendZeptomailParams) => {
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
    });

    console.log("Email sent via ZeptoMail", {
      to: to.map((r) => r.address),
      subject,
    });
  } catch (error) {
    console.log("Failed to send email via ZeptoMail", error);
  }
};

export const sendConfirmationOrder = async (data: {
  email: string;
  fullName: string;
  showTitle: string;
  performanceDate: string;
  performanceTime: string;
}) => {
  const subject = `Confirmación de tu compra – ${data.showTitle}`;
  const text = `Hola ${data.fullName},

Gracias por tu compra en Teatro del Embuste.

Obra: ${data.showTitle}
Fecha: ${data.performanceDate}
Hora: ${data.performanceTime}

Este correo confirma que hemos recibido tu pedido. Pronto recibirás más detalles o tu(s) entrada(s), si aplica.

¡Nos vemos en el teatro!

— Teatro del Embuste`;

  const html = `
    <p>Hola ${data.fullName},</p>
    <p>Gracias por tu compra en <strong>Teatro del Embuste</strong>.</p>
    <p>
      <strong>Obra:</strong> ${data.showTitle}<br />
      <strong>Fecha:</strong> ${data.performanceDate}<br />
      <strong>Hora:</strong> ${data.performanceTime}
    </p>
    <p>Este correo confirma que hemos recibido tu pedido. Pronto recibirás más detalles o tu(s) entrada(s), si aplica.</p>
    <p>¡Nos vemos en el teatro!</p>
    <p>— Teatro del Embuste</p>
  `;

  await sendZeptomail({
    to: [
      {
        address: data.email,
        name: data.fullName,
      },
    ],
    subject,
    text,
    html,
  });
};


