// ดึงการตั้งค่า Firebase
import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let timerInterval;

// ==========================================
// 1. ระบบรักษาความปลอดภัย & ตรวจสอบการล็อกอิน
// ==========================================
onAuthStateChanged(auth, async (user) => {
    const isLoginPage = document.getElementById('login-btn') !== null;
    const isDashboard = document.getElementById('dash-username') !== null;

    if (user) {
        // ถ้าล็อกอินแล้ว แต่อยู่หน้า index ให้ส่งไป Dashboard
        if (isLoginPage) {
            window.location.replace("dashboard.html");
            return;
        }

        // ==========================================
        // ส่วนเสริมสำหรับหน้า Dashboard: ดึงข้อมูลและเริ่มจับเวลา
        // ==========================================
        if (isDashboard) {
            try {
                // ไปดึงข้อมูลจาก Firestore ตาม UID
                const userDoc = await getDoc(doc(db, "users", user.uid));
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    
                    // เอาข้อมูลมาโชว์บนหน้าจอ
                    document.getElementById('dash-username').textContent = userData.username || user.email;
                    
                    if (userData.expireAt) {
                        document.getElementById('dash-expire-date').textContent = formatDate(userData.expireAt);
                        startTimer(userData.expireAt); // เริ่มนับถอยหลัง
                    } else {
                        document.getElementById('dash-expire-date').textContent = "ไม่ได้กำหนดวันหมดอายุ";
                        document.getElementById('dash-countdown').textContent = "-";
                    }

                    // ----------------------------------------------------
                    // ✨ NEW: โค้ดสำหรับเปิดหน้า PREMIUM KIDS อัตโนมัติ ✨
                    // ----------------------------------------------------
                    setTimeout(() => {
                        const premiumBtn = document.getElementById('btn-mode-premium');
                        if (premiumBtn) {
                            premiumBtn.click(); // สั่งให้จำลองการกดปุ่ม
                        } else if (typeof switchSystemMode === 'function') {
                            switchSystemMode('premium'); // สำรองในกรณีที่หาปุ่มไม่เจอ
                        }
                    }, 300); // หน่วงเวลา 0.3 วินาทีให้หน้าเว็บโหลดโครงสร้างเสร็จก่อน

                } else {
                    document.getElementById('dash-username').textContent = user.email;
                    document.getElementById('dash-countdown').textContent = "⚠️ ไม่พบข้อมูลเวลา";
                }
            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูลเวลา:", error);
            }
        }

    } else {
        // ถ้ายังไม่ล็อกอิน แต่แอบเข้าหน้าอื่น ให้เตะกลับหน้าแรก
        if (!isLoginPage) {
            localStorage.setItem('auth_error_alert', 'true');
            window.location.replace("index.html");
        }
    }
});

// ==========================================
// 2. ฟังก์ชันจับเวลาถอยหลัง (ใช้เวลาจาก Server)
// ==========================================
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

// แปลงตัวเลขเป็นวันที่สวยๆ
function formatDate(timestamp) {
    const d = new Date(timestamp);
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}  ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
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
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.expireAt && Date.now() > userData.expireAt) {
                    showError("⚠️ วันใช้งานของคุณหมดอายุ ติดต่อผู้ดูแล");
                    await signOut(auth);
                } else {
                    window.location.replace("dashboard.html");
                }
            } else {
                showError("ไม่พบข้อมูลผู้ใช้งานในฐานข้อมูล");
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
// 4. ฟังก์ชันออกจากระบบ (Global)
// ==========================================
window.logoutUser = async function() {
    try {
        await signOut(auth);
        window.location.replace("index.html");
    } catch (error) {
        console.error("Error logging out:", error);
    }
};