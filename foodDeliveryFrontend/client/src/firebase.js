// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "blindspot-901d5.firebaseapp.com",
  projectId: "blindspot-901d5",
  storageBucket: "blindspot-901d5.appspot.com",
  messagingSenderId: "491636743045",
  appId: "1:491636743045:web:9e16682caf0601ab23c2ec"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
