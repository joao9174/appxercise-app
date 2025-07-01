import { initializeApp } from "firebase/app";
import {
    initializeAuth,
    getReactNativePersistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from 'firebase/firestore';

const app = initializeApp({
    apiKey: "AIzaSyAvo3eVndYaWCxOhYXDKD-oUN3wWBHUqiE",
    authDomain: "pojetofinal-b5e57.firebaseapp.com",
    projectId: "pojetofinal-b5e57",
    storageBucket: "pojetofinal-b5e57.firebasestorage.app",
    messagingSenderId: "278864421806",
    appId: "1:278864421806:web:c8a7461daf76964c4b5e3f"
});

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
})

const db = getFirestore(app);

export {
    auth,
    db
};