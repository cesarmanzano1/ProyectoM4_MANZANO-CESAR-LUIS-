//src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Exportamos auth para usarlo en TODOS los flujos de autenticación

export const auth = getAuth(app);//get auth optiene el servicio de autenticación de firebase y lo exporta para que pueda ser utilizado en otros archivos del proyecto.
export const db = getFirestore(app);//getFirestore obtiene el servicio de base de datos de firebase y lo exporta para que pueda ser utilizado en otros archivos del proyecto.