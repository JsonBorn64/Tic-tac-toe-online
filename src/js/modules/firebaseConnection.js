import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, off, get, push, onDisconnect } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDeFAdB3GFB42kQ7SAHtKkV3-zrFGNZhVY",
    authDomain: "snake-49526.firebaseapp.com",
    databaseURL: "https://snake-49526-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "snake-49526",
    storageBucket: "snake-49526.appspot.com",
    messagingSenderId: "332569583266",
    appId: "1:332569583266:web:3b047050ea19f9280541fb",
    measurementId: "G-8VPYTMEFEG"
};
const app = initializeApp(firebaseConfig)
const db = getDatabase()

export { db, ref, onValue, set, off, get, push, onDisconnect }