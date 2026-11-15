// src/services/auth_error.ts
import { FirebaseError } from "firebase/app";

export function mapFirebaseError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "Este correo electrónico ya está registrado. Intenta iniciar sesión o utiliza otro correo.";
    case "auth/invalid-email":
      return "El formato del correo electrónico ingresado no es válido.";
    case "auth/weak-password":
      return "La contraseña es considerada débil por Firebase. Añade más caracteres y variedad.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos. Verifica tus datos.";
    case "auth/network-request-failed":
      return "Error de red. Verifica tu conexión a internet e inténtalo nuevamente.";
    case "auth/too-many-requests":
      return "Demasiados intentos fallidos. Por seguridad, espera un momento antes de reintentar.";
    default:
      return "Ocurrió un error inesperado al procesar la solicitud. Intenta de nuevo.";
  }
}

export function getFirebaseErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    return mapFirebaseError(err.code);
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Ocurrió un error inesperado.";
}