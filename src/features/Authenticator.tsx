//src/features/Authenticator.tsx
import type { JSX } from "react";
import { RegisterPage } from "../pages/RegisterPage";
import type { RegisterPageProps } from "./types";

/**
 * Componente contenedor de autenticación.
 * Proporciona el flujo de registro e inicio de sesión.
 */
export function Authenticator(props: RegisterPageProps): JSX.Element {
  return <RegisterPage {...props} />;
}

export default Authenticator;
