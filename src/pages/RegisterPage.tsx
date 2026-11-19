//src/pages/RegistrerPage.tsx
import {
  useState,
  useMemo,
  type FormEvent,
  type ChangeEvent,
  type JSX,
  type CSSProperties,
} from "react";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../services/firebase";
import { getFirebaseErrorMessage } from "../services/auth_error";
import type { RegisterPageProps } from "../features/types";
import { useNavigate } from "react-router-dom"; // <-- Importamos useNavigate
import logoImg from "../assets/logo.png"; // Importación de tu logo

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function RegisterPage({
  onSuccess,
  onNavigateToLogin,
}: RegisterPageProps): JSX.Element {
  const navigate = useNavigate(); // <-- Hook de navegación

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Criterios de seguridad en tiempo real de la contraseña
  const passwordCriteria = useMemo(() => {
    const pwd = formData.password;
    return {
      hasMinLength: pwd.length >= 8,
      hasLetter: /[A-Za-z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
    };
  }, [formData.password]);

  // Validación de errores
  const errors = useMemo(() => {
    const errs: { name?: string; lastName?: string; email?: string; password?: string } = {};
    
    if (!formData.name.trim()) {
      errs.name = "El nombre es obligatorio.";
    } else if (formData.name.trim().length < 2) {
      errs.name = "El nombre debe tener al menos 2 caracteres.";
    }

    if (!formData.lastName.trim()) {
      errs.lastName = "El apellido es obligatorio.";
    } else if (formData.lastName.trim().length < 2) {
      errs.lastName = "El apellido debe tener al menos 2 caracteres.";
    }

    if (!formData.email.trim()) {
      errs.email = "El correo electrónico es obligatorio.";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errs.email = "Ingresa un correo electrónico válido.";
    }

    if (!formData.password) {
      errs.password = "La contraseña es obligatoria.";
    } else if (formData.password.length < 8 || !/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      errs.password = "La contraseña debe tener al menos 8 caracteres, una letra y un número.";
    }

    return errs;
  }, [formData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (firebaseError) setFirebaseError(null);
  };

  // Registro con Email y Contraseña
 const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setHasSubmitted(true);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);
    setFirebaseError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );

      const fullName = `${formData.name.trim()} ${formData.lastName.trim()}`;
      await updateProfile(userCredential.user, { displayName: fullName });

      // <-- AQUÍ AGREGAS LA LLAMADA A VERIFY-EMAIL -->
      const idToken = await userCredential.user.getIdToken();
      await fetch("/api/verify-email", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      // -----------------------------------------------

      if (onSuccess) {
        onSuccess(userCredential.user);
      }
      
      // Redirigir automáticamente al dashboard al registrarse con éxito
      navigate("/tasks");
    } catch (err: unknown) {
      setFirebaseError(getFirebaseErrorMessage(err));
      setIsLoading(false); // Desactivamos el loading solo si hubo error
    }
  };
  const handleGoogle = async () => {
    setFirebaseError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (onSuccess) {
        onSuccess(result.user);
      }
      navigate("/tasks");
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") return;
      setFirebaseError("No se pudo registrar con Google.");
    }
  };
return (
    <main style={styles.pageContainer}>
      {/* Panel izquierdo decorativo */}
      <div className="auth-left-panel" style={styles.leftPanel}>
        <div style={styles.brandContainer}>
          <img src={logoImg} alt="MateCode Logo" style={styles.logoImage} />
          <h1 style={styles.brandTitle}>MateCode</h1>
          <p style={styles.brandSubtitle}>Aplicaciones Web para tu Empresa</p>
        </div>
      </div>

      {/* Panel derecho con el formulario */}
      <div className="auth-right-panel" style={styles.rightPanel}>
        <section style={styles.card}>
          <header style={styles.header}>
            <h1 style={styles.title}>Crear una cuenta</h1>
            <p style={styles.subtitle}>Ingresa tus datos para registrarte en la plataforma</p>
          </header>

          {firebaseError && (
            <div style={styles.alertError} role="alert">
              <span>{firebaseError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form} noValidate>
            {/* Fila Nombre y Apellido (con clase responsiva para apilarse en móviles) */}
            <div className="register-name-row" style={styles.nameRow}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Nombre *</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Ej. Juan"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(hasSubmitted && errors.name ? styles.inputError : {}),
                  }}
                />
                {hasSubmitted && errors.name && (
                  <span style={styles.errorMessage}>{errors.name}</span>
                )}
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Apellido *</label>
                <input
                  name="lastName"
                  type="text"
                  placeholder="Ej. Pérez"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(hasSubmitted && errors.lastName ? styles.inputError : {}),
                  }}
                />
                {hasSubmitted && errors.lastName && (
                  <span style={styles.errorMessage}>{errors.lastName}</span>
                )}
              </div>
            </div>

            {/* Correo electrónico */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Correo electrónico *</label>
              <input
                name="email"
                type="text"
                autoComplete="off"
                placeholder="nombre@correo.com"
                value={formData.email}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(hasSubmitted && errors.email ? styles.inputError : {}),
                }}
              />
              {hasSubmitted && errors.email && (
                <span style={styles.errorMessage}>{errors.email}</span>
              )}
            </div>

            {/* Contraseña */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Contraseña *</label>
              <div style={styles.passwordWrapper}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    paddingRight: "3.5rem", // Espacio para que el texto no tape el botón
                    ...(hasSubmitted && errors.password ? styles.inputError : {}),
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="toggle-password-btn"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              <div style={styles.criteriaContainer}>
                <p style={styles.criteriaTitle}>Requisitos de seguridad:</p>
                <ul style={styles.criteriaList}>
                  <li style={{ color: passwordCriteria.hasMinLength ? "#10b981" : "#9ca3af", fontSize: "0.75rem" }}>
                    {passwordCriteria.hasMinLength ? "✓" : "○"} Mínimo 8 caracteres
                  </li>
                  <li style={{ color: passwordCriteria.hasLetter ? "#10b981" : "#9ca3af", fontSize: "0.75rem" }}>
                    {passwordCriteria.hasLetter ? "✓" : "○"} Al menos una letra
                  </li>
                  <li style={{ color: passwordCriteria.hasNumber ? "#10b981" : "#9ca3af", fontSize: "0.75rem" }}>
                    {passwordCriteria.hasNumber ? "✓" : "○"} Al menos un número
                  </li>
                </ul>
              </div>

              {hasSubmitted && errors.password && (
                <span style={styles.errorMessage}>{errors.password}</span>
              )}
            </div>

            <button type="submit" disabled={isLoading} style={styles.submitButton}>
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            <div style={{ textAlign: "center", margin: "0.25rem 0", color: "#6b7280" }}>
              <span>o</span>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              style={{
                ...styles.submitButton,
                backgroundColor: "#ffffff",
                color: "#374151",
                border: "1px solid #d1d5db",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: 0
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18c-.75 1.49-1.18 3.16-1.18 4.94s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Registrarse con Google
            </button>
          </form>

          <footer style={styles.footer}>
            <p style={styles.footerText}>
              ¿Ya tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToLogin) {
                    onNavigateToLogin();
                  } else {
                    navigate("/login");
                  }
                }}
                style={styles.linkButton}
              >
                Inicia sesión aquí
              </button>
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default RegisterPage;
const styles: Record<string, CSSProperties> = {
  pageContainer: {
    minHeight: "100vh",
    display: "flex",
    backgroundColor: "#ffffff",
    fontFamily: "sans-serif",
    width: "100%",
    boxSizing: "border-box",
  },
  leftPanel: {
    flex: 1,
    background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },
  brandContainer: {
    textAlign: "center",
    color: "#fff",
  },
  logoImage: {
    width: "120px",
    height: "120px",
    objectFit: "contain",
    marginBottom: "1rem",
  },
  brandTitle: {
    fontSize: "2.5rem",
    fontWeight: 700,
    margin: "0 0 0.5rem 0",
    letterSpacing: "-0.5px",
  },
  brandSubtitle: {
    fontSize: "0.95rem",
    color: "#bfdbfe",
    margin: 0,
    fontWeight: 400,
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "2rem",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: "1.25rem",
    textAlign: "center",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 0.4rem 0",
  },
  subtitle: {
    fontSize: "0.85rem",
    color: "#64748b",
    margin: 0,
  },
  alertError: {
    padding: "0.75rem",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#991b1b",
    fontSize: "0.85rem",
    marginBottom: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  },
  nameRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    textAlign: "left",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#334155",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.7rem 0.9rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.9rem",
    outline: "none",
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fffafa",
  },
  errorMessage: {
    fontSize: "0.75rem",
    color: "#dc2626",
    fontWeight: 500,
    marginTop: "0.1rem",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  togglePasswordButton: {
    position: "absolute",
    right: "0.75rem",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
  },
  criteriaContainer: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "0.5rem",
    marginTop: "0.25rem",
  },
  criteriaTitle: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#475569",
    margin: "0 0 0.2rem 0",
  },
  criteriaList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.1rem",
  },
  submitButton: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "0.2rem",
  },
  dividerContainer: {
    textAlign: "center",
    position: "relative",
    margin: "0.4rem 0",
    borderBottom: "1px solid #e2e8f0",
  },
  dividerText: {
    position: "relative",
    top: "10px",
    backgroundColor: "#ffffff",
    padding: "0 0.75rem",
    color: "#94a3b8",
    fontSize: "0.85rem",
  },
  googleButton: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  },
  footer: {
    marginTop: "1.25rem",
    paddingTop: "1rem",
    borderTop: "1px solid #f1f5f9",
    textAlign: "center",
  },
  footerText: {
    fontSize: "0.85rem",
    color: "#64748b",
    margin: 0,
  },
  linkButton: {
    background: "transparent",
    border: "none",
    color: "#2563eb",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline",
  },
};