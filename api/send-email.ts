//api/send-email.ts
// import type { VercelRequest, VercelResponse } from "@vercel/node";
// import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
// import { config } from "dotenv";

// config({ path: ".env" });

// interface EmailRequestBody {
//     to?: string;
//     subject?: string;
//     body?: string;
// }

// const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// const ses = new SESClient({
//     region: process.env.AWS_REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
//     },
// });

// export default async function handler(req: VercelRequest, res: VercelResponse) {
//     // 1. Validar que el método sea estrictamente POST
//     if (req.method !== "POST") {
//         return res.status(405).json({ ok: false, error: "method_not_allowed", message: "Método no permitido." });
//     }

//     const bodyData = req.body as EmailRequestBody | undefined;
//     const to = typeof bodyData?.to === "string" ? bodyData.to.trim() : "";
//     const subject = typeof bodyData?.subject === "string" ? bodyData.subject.trim() : "";
//     const body = typeof bodyData?.body === "string" ? bodyData.body.trim() : "";

//     // 2. Validar campos requeridos y formato de correo electrónico
//     if (!to || !subject || !body || !emailPattern.test(to)) {
//         return res.status(400).json({ 
//             ok: false, 
//             error: "bad_request", 
//             message: "Faltan campos obligatorios o el correo del destinatario no es válido." 
//         });
//     }

//     try {
//         const command = new SendEmailCommand({
//             Source: process.env.SES_FROM_EMAIL || process.env.AWS_SES_FROM_EMAIL,
//             Destination: { ToAddresses: [to] },
//             Message: {
//                 Subject: { Data: subject, Charset: "UTF-8" },
//                 Body: { 
//                     Text: { Data: body, Charset: "UTF-8" },
//                 },
//             },
//         });

//         const result = await ses.send(command);
//         return res.status(200).json({ ok: true, messageId: result.MessageId, message: "Resumen enviado correctamente." });
//     } catch (err: unknown) {
//         const errorMessage = err instanceof Error ? err.message : "Error desconocido";
//         const errorName = err instanceof Error ? err.name : "send_failed";
        
//         console.error("AWS SES error:", errorName, errorMessage);
        
//         return res.status(500).json({ 
//             ok: false, 
//             error: errorName, 
//             message: "No se pudo enviar el email debido a un error en el servidor." 
//         });
//     }
// }
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { config } from "dotenv";

config({ path: ".env" });

interface TaskItem {
    title: string;
    completed: boolean;
    folder?: string;
    priority?: string;
}

interface EmailRequestBody {
    to?: string;
    subject?: string;
    tasks?: TaskItem[];
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ses = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "method_not_allowed", message: "Método no permitido." });
    }

    const bodyData = req.body as EmailRequestBody | undefined;
    const to = typeof bodyData?.to === "string" ? bodyData.to.trim() : "";
    const subject = typeof bodyData?.subject === "string" ? bodyData.subject.trim() : "Reporte de Tareas";
    const tasks = Array.isArray(bodyData?.tasks) ? bodyData.tasks : [];

    if (!to || !emailPattern.test(to)) {
        return res.status(400).json({ ok: false, error: "bad_request", message: "Correo del destinatario inválido." });
    }

    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = tasks.length - completedCount;

    // Construcción de las filas de la tabla de tareas en HTML elegante
    const taskRows = tasks.length > 0 
        ? tasks.map(t => `
            <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px;">
                    ${t.completed ? '✅' : '⏳'} <strong>${t.title}</strong>
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">
                    ${t.folder || 'Pendientes'}
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">
                    <span style="padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; background-color: ${t.completed ? '#ecfdf5' : '#eff6ff'}; color: ${t.completed ? '#059669' : '#1d4ed8'};">
                        ${t.completed ? 'Completada' : 'Pendiente'}
                    </span>
                </td>
            </tr>
        `).join('')
        : `<tr><td colspan="3" style="padding: 20px; text-align: center; color: #64748b;">No hay tareas registradas.</td></tr>`;

    // Plantilla HTML con diseño profesional corporativo
    const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                
                <!-- Cabecera institucional -->
                <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 24px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 20px; font-weight: bold;">MateCode</h1>
                    <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Gestor Estratégico de Tareas</p>
                </div>

                <!-- Contenido principal -->
                <div style="padding: 24px;">
                    <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Resumen de Actividades</h2>
                    <p style="color: #64748b; font-size: 14px;">Hola, aquí tienes el reporte actualizado del estado de tus tareas:</p>

                    <!-- Tarjetas de Estadísticas -->
                    <div style="display: flex; gap: 12px; margin: 20px 0;">
                        <div style="flex: 1; background: #f1f5f9; padding: 12px; border-radius: 8px; text-align: center;">
                            <span style="display: block; font-size: 11px; color: #64748b; font-weight: bold;">TOTAL</span>
                            <strong style="font-size: 18px; color: #1e293b;">${tasks.length}</strong>
                        </div>
                        <div style="flex: 1; background: #ecfdf5; padding: 12px; border-radius: 8px; text-align: center;">
                            <span style="display: block; font-size: 11px; color: #059669; font-weight: bold;">COMPLETADAS</span>
                            <strong style="font-size: 18px; color: #059669;">${completedCount}</strong>
                        </div>
                        <div style="flex: 1; background: #fffbeb; padding: 12px; border-radius: 8px; text-align: center;">
                            <span style="display: block; font-size: 11px; color: #d97706; font-weight: bold;">PENDIENTES</span>
                            <strong style="font-size: 18px; color: #d97706;">${pendingCount}</strong>
                        </div>
                    </div>

                    <!-- Tabla de Tareas -->
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <thead>
                            <tr style="background-color: #f8fafc; text-align: left;">
                                <th style="padding: 10px 12px; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #64748b;">Tarea</th>
                                <th style="padding: 10px 12px; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #64748b;">Carpeta</th>
                                <th style="padding: 10px 12px; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: right;">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${taskRows}
                        </tbody>
                    </table>
                </div>

                <!-- Pie de página -->
                <div style="background: #f1f5f9; padding: 16px; text-align: center; color: #94a3b8; font-size: 11px;">
                    Este reporte fue generado automáticamente por MateCode App.
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const command = new SendEmailCommand({
            Source: process.env.SES_FROM_EMAIL || process.env.AWS_SES_FROM_EMAIL,
            Destination: { ToAddresses: [to] },
            Message: {
                Subject: { Data: subject, Charset: "UTF-8" },
                Body: { 
                    Html: { Data: htmlBody, Charset: "UTF-8" },
                },
            },
        });

        const result = await ses.send(command);
        return res.status(200).json({ ok: true, messageId: result.MessageId, message: "Reporte enviado correctamente." });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error desconocido";
        console.error("AWS SES error:", errorMessage);
        return res.status(500).json({ ok: false, error: "send_failed", message: "No se pudo enviar el correo." });
    }
}