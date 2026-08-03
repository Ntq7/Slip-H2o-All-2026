import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBX4Ohc17a-HUKAaOtWCAZSz7DJF4rCVks",
    authDomain: "ai-smart-987db.firebaseapp.com",
    projectId: "ai-smart-987db",
    storageBucket: "ai-smart-987db.firebasestorage.app",
    messagingSenderId: "350442779731",
    appId: "1:350442779731:web:3821926e65265da8d1c2a6",
    measurementId: "G-XRGZMQ8655"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const dbFirestore = getFirestore(app); 
export const dbRealtime = getDatabase(app); 

window.saveSlipToFirebase = async (bankName, slipData) => {
    try {
        const dbRef = ref(dbRealtime, `slip_logs/${bankName}`);
        await push(dbRef, {
            ...slipData,
            timestamp: new Date().toISOString()
        });
        console.log(`✅ บันทึกข้อมูลของ ${bankName} สำเร็จ`);
    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการบันทึก:", error);
    }
};