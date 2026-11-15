//src/features/types.ts
import type { User } from "firebase/auth";

/**
 * Datos del formulario de registro
 */
export interface RegisterFormData {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Errores de validación asociados a cada campo
 */
export interface RegisterFormErrors {
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  general?: string;
}

/**
 * Campos que han sido interactuados por el usuario
 */
export interface TouchedFields {
  name: boolean;
  lastName: boolean;
  email: boolean;
  password: boolean;
}

/**
 * Criterios individuales de seguridad de contraseña
 */
export interface PasswordCriteria {
  hasMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

/**
 * Propiedades del componente RegisterPage
 */
export interface RegisterPageProps {
  /**
   * Callback invocado al completar exitosamente el registro en Firebase
   */
  onSuccess?: (user: User) => void;
  /**
   * Callback opcional para navegar hacia la vista de inicio de sesión
   */
  onNavigateToLogin?: () => void;
}
