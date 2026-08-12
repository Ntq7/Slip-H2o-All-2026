import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { app, dbFirestore as db } from "./firebase-config.js";

const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.replace("index.html"); 
        return;
    }

    const userRef = doc(db, "users", user.uid);
    
    onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const localSession = localStorage.getItem('currentSessionId');

            if (data.allowMultiSession === false && localSession && data.currentSessionId && data.currentSessionId !== localSession) {
                
                alert("⚠️ มีการล็อคอินซ้อน กำลังออกจากระบบ...");
                
                signOut(auth).then(() => {
                    localStorage.removeItem('currentSessionId');
                    window.location.replace("index.html");
                }).catch((error) => {
                    console.error("Force Logout Error:", error);
                    window.location.replace("index.html");
                });
            }
        }
    });
});


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