import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

export const firebaseReady = true;

const firebaseConfig = {
  apiKey: "AIzaSyDYarp03CwJNoeSHu79LkGoTQAZfE0ukeQ",
  authDomain: "matchwork-51e7a.firebaseapp.com",
  databaseURL: "https://matchwork-51e7a-default-rtdb.firebaseio.com",
  projectId: "matchwork-51e7a",
  storageBucket: "matchwork-51e7a.firebasestorage.app",
  messagingSenderId: "147109940451",
  appId: "1:147109940451:web:d8739e4b69df074be349d6",
  measurementId: "G-2NGJ9HBL4G"
};

// Inicializamos la app y la base de datos antes de exportarlas
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);