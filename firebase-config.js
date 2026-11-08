// 1. Firebase console → Project settings → General → "Your apps" → Web app → copy the config here.
const firebaseConfig = {
  apiKey: "AIzaSyC6gwDG4P5EMFEa6Kd2dwgcsGGQ0_3ZKmo",
  authDomain: "temple-a6941.firebaseapp.com",
  databaseURL: "https://temple-a6941-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "temple-a6941",
  storageBucket: "temple-a6941.firebasestorage.app",
  messagingSenderId: "227467898666",
  appId: "1:227467898666:web:5952019174079d7ede3853"
};
// 2. This config is safe to publish on GitHub: access is protected by database.rules.json, not by hiding these values.
export const firebaseConfig = {
  apiKey: "AIzaSyC6gwDG4P5EMFEa6Kd2dwgcsGGQ0_3ZKmo",
  authDomain: "temple-a6941.firebaseapp.com",
  databaseURL: "https://temple-a6941-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "temple-a6941",
  appId: "1:227467898666:web:5952019174079d7ede3853"
};

// Everyone in the same ROOM sees each other. Change it to run a separate temple (e.g. for testing).
export const ROOM = "main";
