// api/verify-email.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SESv2Client, CreateEmailIdentityCommand } from "@aws-sdk/client-sesv2";
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

  // Respaldo por si se usa en producción con variables individuales
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Falta el token" });

  let email: string | undefined;
  try {
    getFirebaseApp();
    email = (await getAuth().verifyIdToken(token)).email;
  } catch (err) {
    console.error("Error al verificar token:", err);
    return res.status(401).json({ error: "Sesión inválida" });
  }
  if (!email) return res.status(400).json({ error: "El usuario no tiene email" });

  try {
    await ses.send(new CreateEmailIdentityCommand({ EmailIdentity: email }));
  } catch (err) {
    const name = (err as { name?: string }).name;
    if (name !== "AlreadyExistsException") {
      console.error("Error SES:", name);
      return res.status(500).json({ error: "No se pudo iniciar la verificación" });
    }
  }
  return res.status(200).json({
    ok: true,
    message: "Te mandamos un mail de AWS para habilitar los resúmenes. Revisá tu bandeja (y spam).",
  });
}