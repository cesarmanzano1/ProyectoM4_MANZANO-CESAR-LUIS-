// src/pages/LoginPage.tsx
import { useState, type FormEvent, type JSX, type CSSProperties } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import logoImg from "../assets/logo.png"; // Importación de tu logo

interface LoginPageProps {
  onSuccess?: (user: any) => void;
  onNavigateToRegister?: () => void;
}

export function LoginPage({ onSuccess, onNavigateToRegister }: LoginPageProps): JSX.Element {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (onSuccess) onSuccess(result.user);
      navigate("/tasks");
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") return;
      setError("No se pudo iniciar sesión con Google.");
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (onSuccess) onSuccess(result.user);
      navigate("/tasks");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Correo o contraseña incorrectos. Verifica tus datos.");
      } else {
        setError("Ocurrió un error al iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para enviar el correo de recuperación de contraseña
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Por favor, ingresa tu correo electrónico arriba para restablecer tu contraseña.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setError(null);
      alert("¡Correo enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.");
    } catch (err: any) {
      console.error(err);
      setError("No se pudo enviar el correo de recuperación. Verifica que el email sea correcto.");
    }
  };

 return (
    <div style={styles.pageContainer}>
      {/* Panel izquierdo con la clase auth-left-panel para ocultarse en móviles */}
      <div className="auth-left-panel" style={styles.leftPanel}>
        <div style={styles.brandContainer}>
          <img src={logoImg} alt="MateCode Logo" style={styles.logoImage} />
          <h1 style={styles.brandTitle}>MateCode</h1>
          <p style={styles.brandSubtitle}>Aplicaciones Web para tu Empresa</p>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="auth-right-panel" style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>Iniciar Sesión</h2>
            <p style={styles.subtitle}>Ingresa a tu gestor de tareas</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Correo electrónico</label>
              <input
                type="email"
                required
                placeholder="nombre@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Contraseña</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...styles.input, paddingRight: "3rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={styles.togglePasswordButton}
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              {/* Enlace para restablecer contraseña alineado a la derecha */}
              <div style={{ textAlign: "right", marginTop: "0.25rem" }}>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  style={styles.forgotPasswordButton}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {error && <p style={styles.errorText}>{error}</p>}

            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

            <div style={styles.dividerContainer}>
              <span style={styles.dividerText}>or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              style={styles.googleButton}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18c-.75 1.49-1.18 3.16-1.18 4.94s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Continuar con Google
            </button>
          </form>

          <footer style={styles.footer}>
            <p style={styles.footerText}>
              ¿No tenés cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToRegister) {
                    onNavigateToRegister();
                  } else {
                    navigate("/register");
                  }
                }}
                style={styles.linkButton}
              >
                Registrate gratis
              </button>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
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
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "2rem",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "1.5rem",
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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
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
  forgotPasswordButton: {
    background: "transparent",
    border: "none",
    color: "#2563eb",
    fontSize: "0.8rem",
    fontWeight: 500,
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
  },
  errorText: {
    color: "#dc2626",
    fontSize: "0.85rem",
    margin: 0,
    textAlign: "center",
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
    marginTop: "1.5rem",
    textAlign: "center",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "1rem",
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
