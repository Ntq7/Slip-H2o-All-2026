import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, updateDoc, setDoc, onSnapshot, deleteField } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let timerInterval;

// ==========================================
// 1. ระบบรักษาความปลอดภัย & ตรวจสอบการล็อกอิน
// ==========================================
onAuthStateChanged(auth, async (user) => {
    const isLoginPage = document.getElementById('login-btn') !== null;
    const isDashboard = document.getElementById('dash-username') !== null;

    if (user) {
        if (isLoginPage) {
            // อนุญาตให้เด้งไป Dashboard ก็ต่อเมื่อมี Session ฝังในเครื่องแล้วเท่านั้น
            if (localStorage.getItem("currentSessionId")) {
                window.location.replace("index.html"); 
            }
            return; 
        }

        if (isDashboard) {
            try {
                const userRef = doc(db, "users", user.uid);

                onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        
                        // อัปเดตตัวเลขจำนวนคนที่ออนไลน์
                        const activeSessions = userData.activeSessions || {};
                        const activeCountElem = document.getElementById('active-devices-count');
                        if (activeCountElem) {
                            activeCountElem.textContent = Object.keys(activeSessions).length;
                        }

                        // เช็คโดนเตะแบบทันที (ถ้าเครื่องเก่าโดนแย่งล็อกอิน ID จะหายไปจากระบบ)
                        const mySessionId = localStorage.getItem("currentSessionId");
                        if (mySessionId && !activeSessions[mySessionId]) {
                            alert("⚠️ เซสชั่นหมดอายุ หรือมีการล็อกอินจากอุปกรณ์อื่น กำลังออกจากระบบ...");
                            window.logoutUser(); 
                        }
                    }
                });

                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    document.getElementById('dash-username').textContent = userData.username || user.email;
                    
                    if (userData.expireAt) {
                        document.getElementById('dash-expire-date').textContent = formatDate(userData.expireAt);
                        startTimer(userData.expireAt); 
                    } else {
                        document.getElementById('dash-expire-date').textContent = "ตลอดชีพ";
                        document.getElementById('dash-countdown').textContent = "ไม่จำกัดเวลา";
                    }

                    setTimeout(() => {
                        const premiumBtn = document.getElementById('btn-mode-premium');
                        if (premiumBtn) premiumBtn.click(); 
                        else if (typeof switchSystemMode === 'function') switchSystemMode('premium'); 
                    }, 300); 

                }
            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
            }
        }
    } else {
        if (!isLoginPage) {
            localStorage.setItem('auth_error_alert', 'true');
            window.location.replace("login.html");
        }
    }
});

function startTimer(expireAt) {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const now = Date.now(); 
        const remainingTime = expireAt - now;

        if (remainingTime <= 0) {
            document.getElementById('dash-countdown').textContent = "หมดเวลาการใช้งาน";
            document.getElementById('dash-countdown').className = "text-sm font-bold font-mono text-red-500 animate-pulse";
            clearInterval(timerInterval);
            setTimeout(() => window.logoutUser(), 3000); 
        } else {
            const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
            
            let timeString = '';
            if (days > 0) timeString = `${days} วัน ${hours} ชม.`;
            else if (hours > 0) timeString = `${hours} ชม. ${minutes} นาที`;
            else timeString = `${minutes} นาที ${seconds} วินาที`;

            document.getElementById('dash-countdown').textContent = timeString;
        }
    }, 1000); 
}

function formatDate(timestamp) {
    const d = new Date(timestamp);
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}  ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')} น.`;
}

// ==========================================
// 3. ระบบสำหรับปุ่ม "เข้าสู่ระบบ" (หน้า Login)
// ==========================================
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorBox = document.getElementById('error-alert-box');
    const errorText = document.getElementById('error-text');

    const handleLogin = async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showError("กรุณากรอกอีเมลและรหัสผ่านให้ครบ");
            return;
        }

        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = "กำลังตรวจสอบ...";
        loginBtn.disabled = true;
        errorBox.classList.add('hidden');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.expireAt && Date.now() > userData.expireAt) {
                    showError("⚠️ วันใช้งานของคุณหมดอายุ ติดต่อผู้ดูแล");
                    await signOut(auth);
                } else {
                    let activeSessions = userData.activeSessions || {};
                    const maxSessions = userData.maxSessions || 1;

                    // ✨ [อัปเกรดใหม่: ระบบเตะเครื่องเก่าอัตโนมัติ]
                    let sessionEntries = Object.entries(activeSessions);
                    
                    // ถ้าจำนวนเครื่องออนไลน์ เท่ากับหรือเกินกว่าโควต้าสูงสุด
                    if (sessionEntries.length >= maxSessions) {
                        // เรียงลำดับจากเก่าสุด (น้อย) ไปหาใหม่สุด (มาก) โดยอ้างอิงจาก Timestamp
                        sessionEntries.sort((a, b) => a[1] - b[1]);
                        
                        // ลบเซสชั่นที่เก่าที่สุดออก จนกว่าจะมีพื้นที่ว่างให้เครื่องปัจจุบัน 1 ที่
                        while (sessionEntries.length >= maxSessions) {
                            const oldestSessionId = sessionEntries[0][0]; 
                            delete activeSessions[oldestSessionId]; 
                            sessionEntries.shift(); 
                        }
                    }

                    // สร้าง Session สำหรับคนกดเข้าสู่ระบบรอบนี้
                    const newSessionId = "SESSION_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
                    activeSessions[newSessionId] = Date.now(); 

                    // บันทึกทับขึ้น Firebase (ใครโดนเตะออก ตัว Snapshot ด้านบนจะทำงานแล้วเตะคนนั้นออกหน้าเว็บเอง)
                    await setDoc(userRef, { 
                        activeSessions: activeSessions,
                        currentSessionId: newSessionId 
                    }, { merge: true });
                    
                    localStorage.setItem("currentSessionId", newSessionId); 
                    
                    window.location.replace("index.html");
                }
            } else {
                showError("ไม่พบข้อมูล");
                await signOut(auth);
            }
        } catch (error) {
            console.error(error);
            showError("อีเมลหรือรหัสผ่านไม่ถูกต้อง!");
        } finally {
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    };

    loginBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    function showError(msg) {
        errorText.innerHTML = msg;
        errorBox.classList.remove('hidden');
    }
}

// ==========================================
// 4. ฟังก์ชันออกจากระบบ 
// ==========================================
window.logoutUser = async function() {
    try {
        const mySessionId = localStorage.getItem("currentSessionId");
        const user = auth.currentUser;
        
        // 1. สั่งลบข้อมูลออกจาก Firebase ให้เสร็จก่อน
        if (user && mySessionId) {
            const userRef = doc(db, "users", user.uid);
            const updateData = {};
            updateData[`activeSessions.${mySessionId}`] = deleteField();
            await updateDoc(userRef, updateData);
        }

        // 2. เคลียร์ข้อมูลในความจำเครื่อง
        localStorage.removeItem("currentSessionId"); 
        
        // 3. สั่งออกจากระบบ
        await signOut(auth);
        window.location.replace("login.html");
    } catch (error) {
        console.error("Error logging out:", error);
    }
};