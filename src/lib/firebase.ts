// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9dqMJ6zDQ_w43UzsuKat1Q1LsuM5Tw9Y",
  authDomain: "fir-palcreate.firebaseapp.com",
  projectId: "fir-palcreate",
  storageBucket: "fir-palcreate.firebasestorage.app",
  messagingSenderId: "744321280996",
  appId: "1:744321280996:web:b5f7624db4a7c44c1b75f1",
  measurementId: "G-GHP3Q9PJQH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);
export { auth,app,database,firestore };
