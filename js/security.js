// ==========================================
// ส่วนที่ 1: ระบบ รปภ. ดักจับคนเข้าแยก (เช็กการล็อกอิน)
// ==========================================
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.replace("index.html"); 
    }
});


// ==========================================
// ส่วนที่ 2: ป้องกันการคลิกขวาและปุ่มลัด DevTools (โค้ดเดิมของคุณ)
// ==========================================
document.addEventListener('contextmenu', event => {
    if (event.target.id === 'canvas' || event.target.id === 'right-click-overlay') {
        return true;
    }
    event.preventDefault();
});

document.onkeydown = function(e) {
    if(e.keyCode == 123) { return false; } // ดัก F12
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { return false; } // ดัก Ctrl+Shift+I
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) { return false; } // ดัก Ctrl+Shift+C
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) { return false; } // ดัก Ctrl+Shift+J
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { return false; } // ดัก Ctrl+U (View Source)
};