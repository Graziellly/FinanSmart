import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCbXdFNqvOwz_P1U5aWuRqmMIJIgX9dFxI",
  authDomain: "finansmart-ai-3cbce.firebaseapp.com",
  projectId: "finansmart-ai-3cbce",
  storageBucket: "finansmart-ai-3cbce.firebasestorage.app",
  messagingSenderId: "204731763060",
  appId: "1:204731763060:web:d4811500e10842b9454421",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;