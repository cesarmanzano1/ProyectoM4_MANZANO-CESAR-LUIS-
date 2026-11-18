//api/send-summary.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0];

  let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";

  // Normalizar la clave privada
  privateKey = privateKey
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "");

  // Comprobar que las credenciales estén completas
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
    !privateKey.includes("-----END PRIVATE KEY-----")
  ) {
    throw new Error(
      "Faltan credenciales de Firebase o la clave privada tiene un formato incorrecto"
    );
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const ses = new SESv2Client({ region: process.env.AWS_REGION });

type SummaryTask = { title: string; completed: boolean; folder?: string };

function escapeHtml(text = ""): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ ok: false, error: "Falta el token" });

    getFirebaseApp();

    let email: string | undefined;
    try {
      const decoded = await getAuth().verifyIdToken(token);
      email = decoded.email;
    } catch (authErr) {
      console.error("Error al verificar token:", authErr);
      return res.status(401).json({ ok: false, error: "Sesión inválida" });
    }

    if (!email) return res.status(400).json({ ok: false, error: "El usuario no tiene email" });

    const raw: unknown[] = Array.isArray(req.body?.tasks) ? req.body.tasks : [];
    const tasks = raw.map((t: any) => ({
      title: String(t?.title || ""),
      completed: Boolean(t?.completed),
      folder: String(t?.folder || "Pendientes"),
    }));

    // Clasificación en 3 estados
    const pending = tasks.filter((t) => !t.completed && t.folder !== "En Proceso");
    const inProgress = tasks.filter((t) => !t.completed && t.folder === "En Proceso");
    const done = tasks.filter((t) => t.completed);

    const totalTasks = tasks.length;
    const completedCount = done.length;
    const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    // Listados con diseño limpio basado en tarjetas y bordes laterales de color
    const renderList = (arr: typeof tasks, dotColor: string, badgeBg: string, badgeColor: string, badgeText: string) => {
      if (arr.length === 0) {
        return `
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border: 1px dashed #e5e7eb; border-radius: 8px;">
            <tr>
              <td style="padding: 12px 16px; text-align: center; color: #9ca3af; font-size: 13px; font-style: italic;">
                No hay actividades en esta sección
              </td>
            </tr>
          </table>`;
      }
      return arr
        .map(
          (t) => `
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid ${dotColor}; border-radius: 8px; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
            <tr>
              <td style="padding: 12px 16px; color: #1e293b; font-size: 14px; font-weight: 500;">
                ${escapeHtml(t.title)}
              </td>
              <td align="right" style="padding: 12px 16px; width: 1%; white-space: nowrap;">
                <span style="background-color: ${badgeBg}; color: ${badgeColor}; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">${badgeText}</span>
              </td>
            </tr>
          </table>`
        )
        .join("");
    };

    // Plantilla HTML Moderna con Barra de Progreso y Diseño Institucional Blue
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 0; margin: 0; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                
                <!-- Encabezado -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 36px 30px; text-align: center; color: #ffffff;">
                    <table align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px auto;">
                      <tr>
                        <td align="center" style="width: 48px; height: 48px; background-color: rgba(255,255,255,0.15); border-radius: 12px; font-weight: 800; font-size: 22px; color: #ffffff; letter-spacing: -1px;">
                          MC
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.3px;">MateCode</h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: #bfdbfe; font-weight: 400; text-transform: uppercase; letter-spacing: 1px;">Reporte de Actividad y Tareas</p>
                  </td>
                </tr>

                <!-- Contenido Principal -->
                <tr>
                  <td style="padding: 32px 30px;">
                    <p style="color: #334155; font-size: 15px; margin-top: 0; margin-bottom: 20px;">
                      Hola, <strong style="color: #0f172a;">${escapeHtml(email)}</strong>. Este es el reporte consolidado con el estado actual de tus actividades:
                    </p>

                    <!-- Tarjeta de Progreso General -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 28px;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size: 13px; font-weight: 600; color: #475569;">Progreso de completado</td>
                              <td align="right" style="font-size: 13px; font-weight: 700; color: #2563eb;">${progressPercent}% (${completedCount}/${totalTasks})</td>
                            </tr>
                          </table>
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 8px;">
                            <tr>
                              <td style="background-color: #e2e8f0; border-radius: 999px; height: 8px; width: 100%; overflow: hidden;">
                                <div style="background-color: #2563eb; width: ${progressPercent}%; height: 8px; border-radius: 999px;"></div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Sección Pendientes -->
                    <div style="margin-bottom: 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
                        <tr>
                          <td style="font-size: 14px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 0.5px;">
                            ⏳ Pendientes <span style="background-color: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-left: 4px;">${pending.length}</span>
                          </td>
                        </tr>
                      </table>
                      ${renderList(pending, "#f59e0b", "#fef3c7", "#b45309", "Pendiente")}
                    </div>

                    <!-- Sección En Proceso -->
                    <div style="margin-bottom: 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
                        <tr>
                          <td style="font-size: 14px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.5px;">
                            🔄 En Proceso <span style="background-color: #ede9fe; color: #6d28d9; padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-left: 4px;">${inProgress.length}</span>
                          </td>
                        </tr>
                      </table>
                      ${renderList(inProgress, "#8b5cf6", "#ede9fe", "#6d28d9", "En Proceso")}
                    </div>

                    <!-- Sección Completadas -->
                    <div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
                        <tr>
                          <td style="font-size: 14px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.5px;">
                            ✅ Completadas <span style="background-color: #d1fae5; color: #047857; padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-left: 4px;">${done.length}</span>
                          </td>
                        </tr>
                      </table>
                      ${renderList(done, "#10b981", "#d1fae5", "#047857", "Completada")}
                    </div>

                  </td>
                </tr>

                <!-- Pie de página -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155; font-size: 12px;">MateCode — Aplicaciones Web para tu Empresa</p>
                    <p style="margin: 0; color: #94a3b8; font-size: 11px;">Este mensaje se envió de forma automática desde tu gestor de tareas.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>`;

    const text =
      `=== RESUMEN DE TAREAS (MateCode) ===\n\n` +
      `Progreso: ${completedCount}/${totalTasks} (${progressPercent}%)\n\n` +
      `Pendientes (${pending.length}):\n${pending.map((t) => "- " + t.title).join("\n") || "Ninguna"}\n\n` +
      `En Proceso (${inProgress.length}):\n${inProgress.map((t) => "- " + t.title).join("\n") || "Ninguna"}\n\n` +
      `Completadas (${done.length}):\n${done.map((t) => "- " + t.title).join("\n") || "Ninguna"}`;

    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: `"MateCode App" <${process.env.SES_FROM}>`,
        Destination: { ToAddresses: [email] },
        Content: {
          Simple: {
            Subject: { Data: `📊 Tu resumen de tareas - MateCode (${progressPercent}% completado)`, Charset: "UTF-8" },
            Body: {
              Html: { Data: html, Charset: "UTF-8" },
              Text: { Data: text, Charset: "UTF-8" },
            },
          },
        },
      })
    );

    return res.status(200).json({ ok: true, message: "Resumen enviado. Revisá tu email (y spam)." });
  } catch (err: any) {
    console.error("Error crítico en send-summary:", err);
    if (err?.name === "MessageRejected") {
      return res.status(400).json({
        ok: false,
        error: "Tu email todavía no está verificado en AWS. Buscá el mail de verificación en tu bandeja.",
      });
    }
    return res.status(500).json({ ok: false, error: err?.message || "Error interno" });
  }
}