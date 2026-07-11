import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2kzRlrvm0TU6weQERcpCt5JNGDN8VB3o",
  authDomain: "catalogo-c1c67.firebaseapp.com",
  projectId: "catalogo-c1c67",
  storageBucket: "catalogo-c1c67.firebasestorage.app",
  messagingSenderId: "1044738610092",
  appId: "1:1044738610092:web:df3e829c47c2666aaca009",
  measurementId: "G-70MYW6677Y"
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
