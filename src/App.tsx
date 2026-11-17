// src/App.tsx
// import { useState, useEffect, type JSX } from "react";
// import type { User } from "firebase/auth";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { auth } from "./services/firebase";
// import { RegisterPage } from "./pages/RegisterPage";
// import { LoginPage } from "./pages/LoginPage";
// import { TasksPage } from "./pages/TasksPage"; // <-- Importamos TasksPage en lugar de DashboardPage

// function App(): JSX.Element {
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
  
//   // Estado para controlar qué vista mostrar si no está logueado: "login" o "register"
//   const [currentView, setCurrentView] = useState<"login" | "register">("login");

//   // Mantener la sesión persistente con el observador de Firebase
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setCurrentUser(user);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async (): Promise<void> => {
//     try {
//       await signOut(auth);
//       setCurrentUser(null);
//       setCurrentView("login");
//     } catch (error) {
//       console.error("Error al cerrar sesión:", error);
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
//         <p>Cargando aplicación...</p>
//       </div>
//     );
//   }

//   return (
//     <div style={{ minHeight: "100vh", width: "100%" }}>
//       {currentUser ? (
//         <TasksPage uid={currentUser.uid} /> // <-- Renderizamos TasksPage enviando el uid del usuario actual
//       ) : currentView === "register" ? (
//         <RegisterPage
//           onSuccess={(user) => {
//             setCurrentUser(user);
//           }}
//           onNavigateToLogin={() => {
//             setCurrentView("login");
//           }}
//         />
//       ) : (
//         <LoginPage
//           onSuccess={(user) => {
//             setCurrentUser(user);
//           }}
//           onNavigateToRegister={() => {
//             setCurrentView("register");
//           }}
//         />
//       )}
//     </div>
//   );
// }

// export default App;
//src/App.tsx
import type { JSX } from "react";
import { AppRouter } from "./routes/AppRouter";

export function App(): JSX.Element {
  return <AppRouter />;
}

export default App;