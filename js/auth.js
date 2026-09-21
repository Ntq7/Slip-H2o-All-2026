import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, updateDoc, onSnapshot, deleteField } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let timerInterval;
window.isLoggingOut = window.isLoggingOut || false; 

onAuthStateChanged(auth, async (user) => {
    const isLoginPage = document.getElementById('login-btn') !== null;
    const isDashboard = document.getElementById('dash-username') !== null;

    if (user) {
        if (isLoginPage) {
            if (localStorage.getItem("H2O_SESSION_ID")) {
                window.location.replace("index.html"); 
            }
            return; 
        }

        const mySessionId = localStorage.getItem("H2O_SESSION_ID");
        if (!mySessionId) {
            window.location.replace("login.html");
            return;
        }

        document.body.style.display = '';
        const userRef = doc(db, "users", user.uid);

        if (!window.authListenerSetup) {
            window.authListenerSetup = true;

            onSnapshot(userRef, async (docSnap) => {
                if (docSnap.metadata.fromCache) return; 
                if (!docSnap.exists()) return;

                const data = docSnap.data();
                const activeSessions = data.activeSessions || {};

                if (mySessionId && !activeSessions[mySessionId]) {
                    try {
                        const checkSnap = await getDoc(userRef);
                        const checkData = checkSnap.data();
                        if (checkData && checkData.activeSessions && checkData.activeSessions[mySessionId]) return; 
                    } catch(e) { return; }

                    if (window.isLoggingOut) return; 
                    window.isLoggingOut = true;
                    
                    if (localStorage.getItem("H2O_SESSION_ID") === mySessionId) {
                        localStorage.removeItem("H2O_SESSION_ID");
                    }
                    
                    alert("⚠️ มีการล็อกอินเข้าสู่ระบบจากเครื่องอื่น ");
                    
                    localStorage.setItem('H2O_ALLOW_AUTOFILL', 'true');
                    window.location.replace("login.html");
                    return;
                }

                const activeCountElem = document.getElementById('active-devices-count');
                if (activeCountElem) activeCountElem.textContent = Object.keys(activeSessions).length;
            });
        }

        if (isDashboard) {
            try {
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    document.getElementById('dash-username').textContent = userData.username || user.email;
                    

                    if (userData.expireAt) {
                        const expireTimeMs = (typeof userData.expireAt.toDate === 'function') 
                            ? userData.expireAt.toDate().getTime() 
                            : Number(userData.expireAt);

                        document.getElementById('dash-expire-date').textContent = formatDate(expireTimeMs);
                        startTimer(expireTimeMs); 
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
            } catch (error) { console.error(error); }
        }
    } else {
        if (!isLoginPage) {
            localStorage.removeItem('H2O_SESSION_ID');
            window.location.replace("login.html");
        }
    }
});

function startTimer(expireTimeMs) {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const now = Date.now(); 
        const remainingTime = expireTimeMs - now;

        if (remainingTime <= 0) {
            document.getElementById('dash-countdown').textContent = "หมดเวลาการใช้งาน";
            document.getElementById('dash-countdown').className = "text-sm font-bold font-mono text-red-500 animate-pulse";
            clearInterval(timerInterval);
            
            localStorage.removeItem("H2O_SESSION_ID");
            
            localStorage.setItem('H2O_ALLOW_AUTOFILL', 'true');
            signOut(auth).then(() => window.location.replace("login.html"));
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
            showError("กรุณากรอกอีเมลและรหัสผ่านให้ถุกต้อง");
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
                
                let expireTimeMs = null;
                if (userData.expireAt) {
                    expireTimeMs = (typeof userData.expireAt.toDate === 'function') 
                        ? userData.expireAt.toDate().getTime() 
                        : Number(userData.expireAt);
                }

                if (expireTimeMs && Date.now() > expireTimeMs) {
                    showError("⚠️ วันใช้งานของคุณหมดอายุ");
                    await signOut(auth);
                } else {

                    let activeSessions = userData.activeSessions || {}; 

                    const allowMulti = userData.allowMultiSession === true; 

                    if (!allowMulti) {
                        activeSessions = {}; 
                    }

                    const newSessionId = "DEV_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
                    activeSessions[newSessionId] = Date.now(); 

                    localStorage.setItem("H2O_SESSION_ID", newSessionId); 

                    await updateDoc(userRef, { 
                        activeSessions: activeSessions,
                        currentSessionId: newSessionId
                    });
                    
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

window.logoutUser = async function() {
    try {
        if (window.isLoggingOut) return; 
        window.isLoggingOut = true; 

        const mySessionId = localStorage.getItem("H2O_SESSION_ID");
        const user = auth.currentUser;
        
        if (user && mySessionId) {
            const userRef = doc(db, "users", user.uid);
            const updateData = {};

            updateData[`activeSessions.${mySessionId}`] = deleteField();
            await updateDoc(userRef, updateData);
        }

        localStorage.removeItem("H2O_SESSION_ID"); 
        

        localStorage.setItem('H2O_ALLOW_AUTOFILL', 'true');
        await signOut(auth); 
        window.location.replace("login.html");
    } catch (error) { console.error("Error logging out:", error); }
};