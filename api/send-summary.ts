
//api/send-summary.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0];

  const localPath = path.resolve(process.cwd(), "service-account.json");
  if (fs.existsSync(localPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(localPath, "utf8"));
    return initializeApp({ credential: cert(serviceAccount) });
  }

  let privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
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

// Ajustamos el tipo para soportar los estados/carpetas o la propiedad de progreso
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

    // Clasificación en 3 estados tal como lo muestra tu panel web
    const pending = tasks.filter((t) => !t.completed && t.folder !== "En Proceso");
    const inProgress = tasks.filter((t) => !t.completed && t.folder === "En Proceso");
    const done = tasks.filter((t) => t.completed);

    // Listados con diseño limpio y tarjetas alineadas
    const renderList = (arr: typeof tasks, badgeColor: string, badgeText: string) => {
      if (arr.length === 0) {
        return `<p style="color: #6b7280; font-size: 14px; font-style: italic; margin: 8px 0;">No hay tareas en esta categoría.</p>`;
      }
      return arr
        .map(
          (t) => `
          <div style="display: flex; align-items: center; justify-content: space-between; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px;">
            <span style="color: #1e293b; font-size: 15px; font-weight: 500;">${escapeHtml(t.title)}</span>
            <span style="background-color: ${badgeColor}; color: white; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${badgeText}</span>
          </div>`
        )
        .join("");
    };

    // Plantilla HTML con el azul institucional y sección "En Proceso"
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; padding: 40px 0; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Encabezado con el Azul Institucional y Logo de MateCode -->
          <div style="background-color: #1e40af; background-image: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
            <div style="margin-bottom: 8px;">
              <span style="display: inline-block; width: 42px; height: 42px; background-color: #ffffff; color: #1e40af; font-weight: 800; font-size: 20px; line-height: 42px; border-radius: 10px; vertical-align: middle; margin-right: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">MC</span>
              <h1 style="display: inline-block; vertical-align: middle; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">MateCode</h1>
            </div>
            <p style="margin: 6px 0 0 0; font-size: 14px; color: #bfdbfe; font-weight: 400;">Tu espacio de trabajo y gestión de tareas</p>
          </div>

          <!-- Cuerpo Principal -->
          <div style="padding: 32px 24px;">
            <p style="color: #334155; font-size: 16px; margin-top: 0; margin-bottom: 24px;">Hola, aquí tienes el reporte detallado con el estado actual de tus actividades:</p>
            
            <!-- Sección Pendientes -->
            <div style="margin-bottom: 24px;">
              <h3 style="color: #d97706; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #fef3c7; padding-bottom: 8px; margin-bottom: 14px;">
                ⏳ Pendientes (${pending.length})
              </h3>
              ${renderList(pending, "#d97706", "Pendiente")}
            </div>

            <!-- Sección En Proceso -->
            <div style="margin-bottom: 24px;">
              <h3 style="color: #7c3aed; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #ede9fe; padding-bottom: 8px; margin-bottom: 14px;">
                🔄 En Proceso (${inProgress.length})
              </h3>
              ${renderList(inProgress, "#7c3aed", "En Proceso")}
            </div>

            <!-- Sección Completadas -->
            <div>
              <h3 style="color: #059669; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #d1fae5; padding-bottom: 8px; margin-bottom: 14px;">
                ✅ Completadas (${done.length})
              </h3>
              ${renderList(done, "#059669", "Completada")}
            </div>
          </div>

          <!-- Pie de página -->
          <div style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">MateCode — Aplicaciones Web para tu Empresa</p>
            <p style="margin: 0;">Este es un mensaje automático generado desde tu plataforma.</p>
          </div>

        </div>
      </div>`;

    const text =
      `=== RESUMEN DE TAREAS (MateCode) ===\n\n` +
      `Pendientes (${pending.length}):\n${pending.map((t) => "- " + t.title).join("\n") || "Ninguna"}\n\n` +
      `En Proceso (${inProgress.length}):\n${inProgress.map((t) => "- " + t.title).join("\n") || "Ninguna"}\n\n` +
      `Completadas (${done.length}):\n${done.map((t) => "- " + t.title).join("\n") || "Ninguna"}`;

    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: `"MateCode App" <${process.env.SES_FROM}>`,
        Destination: { ToAddresses: [email] },
        Content: {
          Simple: {
            Subject: { Data: "Tu resumen de tareas - MateCode", Charset: "UTF-8" },
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
// //src/api/send-summary.ts
// import type { VercelRequest, VercelResponse } from "@vercel/node";
// import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
// import { cert, getApps, initializeApp } from "firebase-admin/app";
// import { getAuth } from "firebase-admin/auth";
// import fs from "fs";
// import path from "path";

// function getFirebaseApp() {
//   if (getApps().length > 0) return getApps()[0];

//   const localPath = path.resolve(process.cwd(), "service-account.json");
//   if (fs.existsSync(localPath)) {
//     const serviceAccount = JSON.parse(fs.readFileSync(localPath, "utf8"));
//     return initializeApp({ credential: cert(serviceAccount) });
//   }

//   let privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
//   if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
//     privateKey = privateKey.slice(1, -1);
//   }

//   return initializeApp({
//     credential: cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey,
//     }),
//   });
// }

// const ses = new SESv2Client({ region: process.env.AWS_REGION });

// type SummaryTask = { title: string; completed: boolean };

// function escapeHtml(text = ""): string {
//   return String(text)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#39;");
// }

// export default async function handler(req: VercelRequest, res: VercelResponse) {
//   if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

//   try {
//     const token = req.headers.authorization?.replace("Bearer ", "");
//     if (!token) return res.status(401).json({ ok: false, error: "Falta el token" });

//     getFirebaseApp();

//     let email: string | undefined;
//     try {
//       const decoded = await getAuth().verifyIdToken(token);
//       email = decoded.email;
//     } catch (authErr) {
//       console.error("Error al verificar token:", authErr);
//       return res.status(401).json({ ok: false, error: "Sesión inválida" });
//     }

//     if (!email) return res.status(400).json({ ok: false, error: "El usuario no tiene email" });

//     const raw: unknown[] = Array.isArray(req.body?.tasks) ? req.body.tasks : [];
//     const tasks = raw.filter(
//       (t): t is SummaryTask =>
//         typeof (t as SummaryTask)?.title === "string" &&
//         typeof (t as SummaryTask)?.completed === "boolean"
//     );
//     const pending = tasks.filter((t) => !t.completed);
//     const done = tasks.filter((t) => t.completed);

//     const list = (arr: SummaryTask[]) =>
//       arr.map((t) => `<li>${escapeHtml(t.title)}</li>`).join("") || "<li>Ninguna</li>";

//     const html = `
//       <h2>Tu resumen de tareas</h2>
//       <h3>Pendientes (${pending.length})</h3><ul>${list(pending)}</ul>
//       <h3>Completadas (${done.length})</h3><ul>${list(done)}</ul>`;

//     const text =
//       `Pendientes:\n${pending.map((t) => "- " + t.title).join("\n") || "Ninguna"}\n\n` +
//       `Completadas:\n${done.map((t) => "- " + t.title).join("\n") || "Ninguna"}`;

//     await ses.send(
//       new SendEmailCommand({
//         FromEmailAddress: `"Tareas App" <${process.env.SES_FROM}>`,
//         Destination: { ToAddresses: [email] },
//         Content: {
//           Simple: {
//             Subject: { Data: "Tu resumen de tareas", Charset: "UTF-8" },
//             Body: {
//               Html: { Data: html, Charset: "UTF-8" },
//               Text: { Data: text, Charset: "UTF-8" },
//             },
//           },
//         },
//       })
//     );

//     return res.status(200).json({ ok: true, message: "Resumen enviado. Revisá tu email (y spam)." });
//   } catch (err: any) {
//     console.error("Error crítico en send-summary:", err);
//     if (err?.name === "MessageRejected") {
//       return res.status(400).json({
//         ok: false,
//         error: "Tu email todavía no está verificado en AWS. Buscá el mail de verificación en tu bandeja.",
//       });
//     }
//     return res.status(500).json({ ok: false, error: err?.message || "Error interno" });
//   }
// }