import { auth, dbFirestore as db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, deleteField, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

window.currentUserUid = null;
window.maxSessions = 1; 

// ==========================================
// 🛡️ Helper Functions
// ==========================================
async function forceLogout(message) {
    if(message) alert(message);
    sessionStorage.removeItem('currentSessionId');
    try { await signOut(auth); } catch (e) {}
    window.location.replace('login.html');
}

// ==========================================
// 🔐 ระบบตรวจสอบสถานะผู้ใช้งาน (Real-Time Auto-Kick)
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        return forceLogout();
    }

    window.currentUserUid = user.uid; 
    const userRef = doc(db, "users", user.uid);
    
    let localSession = sessionStorage.getItem('currentSessionId');
    
    // ถ้าหน้าต่างนี้ยังไม่มี Session (เช่น การเปิดแท็บใหม่) ให้สร้างใหม่
    if (!localSession) {
        localSession = "SID_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('currentSessionId', localSession);
        
        // ⚡ กระบวนการแทรกแซงและเตะคนเก่า
        try {
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                let activeSessions = data.activeSessions || {};
                window.maxSessions = data.maxSessions || 1; 

                if (!activeSessions[localSession]) {
                    let sessionEntries = Object.entries(activeSessions);
                    if (sessionEntries.length >= window.maxSessions) {
                        sessionEntries.sort((a, b) => a[1] - b[1]); 
                        while (sessionEntries.length >= window.maxSessions) {
                            const oldestSessionId = sessionEntries[0][0]; 
                            delete activeSessions[oldestSessionId]; 
                            sessionEntries.shift(); 
                        }
                    }
                    activeSessions[localSession] = Date.now();
                    await updateDoc(userRef, { 
                        activeSessions: activeSessions,
                        currentSessionId: localSession
                    });
                }
            }
        } catch (e) {
            console.error("Setup Error:", e);
        }
    }

    onSnapshot(userRef, (docSnap) => {
        if (!docSnap.exists()) return forceLogout();

        const data = docSnap.data();
        const activeSessions = data.activeSessions || {};

        if (!activeSessions[localSession]) {
            return forceLogout("⚠️ โควต้าเต็ม! มีการล็อกอินจากเครื่องอื่น ล็อคอินใหม่เพื่อใช้งาน");
        }

        const activeCountElem = document.getElementById('active-devices-count');
        if (activeCountElem) {
            activeCountElem.textContent = Object.keys(activeSessions).length;
        }

        const isBanned = (data.status !== undefined && data.status !== 'active');
        if (isBanned) {
            return forceLogout("⚠️ บัญชีของคุณถูกระงับการใช้งาน");
        }

        const userNameElem = document.getElementById('userProfileName');
        if (userNameElem) {
            userNameElem.innerText = data.username || user.email;
        }

        // จัดการแสดงผลวันหมดอายุ
        const now = new Date();
        const dbExpireDate = data.expireAt || data.expiredAt || data.expireDate || data.expiryDate; 
        
        if (dbExpireDate) {
            let expVal = dbExpireDate;
            let realExpireDate = (typeof expVal.toDate === 'function') ? expVal.toDate() : new Date(Number(expVal));

            if (now > realExpireDate) return forceLogout("⚠️ ระยะเวลาใช้งานหมดอายุ");

            const diffMs = realExpireDate - now;
            const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
            const diffHours = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            
            ['userTimeLeft', 'timeLeftDisplay', 'dash-countdown'].forEach(id => {
                if(document.getElementById(id)) document.getElementById(id).innerText = `${diffDays} วัน ${diffHours} ชม.`;
            });
            
            const d = realExpireDate;
            ['userExpireDate', 'dash-expire-date', 'expireDisplay'].forEach(id => {
                if(document.getElementById(id)) document.getElementById(id).innerText = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear() + 543} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')} น.`;
            });
        }
        document.body.style.display = ''; 
    });
});

window.logoutApp = async () => {
    const localSession = sessionStorage.getItem('currentSessionId');
    if (window.currentUserUid && localSession) {
        try {
            const userRef = doc(db, "users", window.currentUserUid);
            const updateData = {};
            updateData[`activeSessions.${localSession}`] = deleteField();
            await updateDoc(userRef, updateData);
        } catch(e) {}
    }
    signOut(auth).then(() => {
        sessionStorage.removeItem('currentSessionId');
        window.location.replace('login.html');
    }).catch(() => {
        sessionStorage.removeItem('currentSessionId');
        window.location.replace('login.html');
    });
};

const getVal = (id) => document.getElementById(id)?.value || '';
const getCheck = (id) => document.getElementById(id)?.checked || false;
const setVal = (id, value) => { const elem = document.getElementById(id); if (elem && value !== undefined) elem.value = value; };

function applyFavoriteDataToScreen(f) {
    if(f.noteMode !== undefined && document.getElementById('modeSwitch')) {
        document.getElementById('modeSwitch').checked = f.noteMode;
        if(typeof toggleMode === 'function') toggleMode();
    }
    setVal('AideMemoire', f.noteText); setVal('sendername', f.sName); setVal('senderaccount', f.sAccount);
    setVal('receivername', f.rName); setVal('receiveraccount', f.rAccount); setVal('bank', f.bank);
    setVal('amount11', f.amount); setVal('imageSelect', f.sticker); setVal('bg_note', f.bgNote);
    setVal('backgroundSelect', f.bgNormal); setVal('money01', f.money01); setVal('money02', f.money02);
    setVal('senderaccount1', f.sAcc1); setVal('senderaccount2', f.sAcc2); setVal('monthmonthyear', f.mMy);
    setVal('monthandyear', f.may); setVal('name1', f.name1); setVal('nametext1', f.nametext1);
    setVal('text1', f.text1); setVal('customImageDataUrl', f.customImageDataUrl); setVal('activeBgMode', f.activeBgMode);
    
    if(f.activeBgMode === 'custom' && f.customImageDataUrl) {
        if(typeof window.activateCustomMode === 'function') window.activateCustomMode();
    } else { if(typeof window.activateSystemMode === 'function') window.activateSystemMode(); }
    
    if(typeof window.triggerUpdate === 'function') window.triggerUpdate();
    if(typeof window.updateDisplay === 'function') window.updateDisplay();
}

window.saveFavoriteToCloud = async function() {
    if (!window.currentUserUid) return alert("⚠️ กรุณาเข้าสู่ระบบ");
    const bankKey = window.CURRENT_BANK || 'GENERAL'; 
    const favData = {
        noteMode: getCheck('modeSwitch'), noteText: getVal('AideMemoire'), sName: getVal('sendername'),
        sAccount: getVal('senderaccount'), rName: getVal('receivername'), rAccount: getVal('receiveraccount'),
        bank: getVal('bank'), amount: getVal('amount11'), sticker: getVal('imageSelect'),
        bgNote: getVal('bg_note'), bgNormal: getVal('backgroundSelect'), money01: getVal('money01'),
        money02: getVal('money02'), sAcc1: getVal('senderaccount1'), sAcc2: getVal('senderaccount2'),
        mMy: getVal('monthmonthyear'), may: getVal('monthandyear'), name1: getVal('name1'),
        nametext1: getVal('nametext1'), text1: getVal('text1'), activeBgMode: getVal('activeBgMode') || 'system',
        customImageDataUrl: getVal('customImageDataUrl')
    };

    if (window.maxSessions > 1) {
        sessionStorage.setItem(`slipFav_${bankKey}`, JSON.stringify(favData));
        alert("✅ บันทึกรายการโปรดแล้ว");
    } else {
        try {
            const userRef = doc(db, "users", window.currentUserUid);
            const updateData = {}; updateData[`slipFav_${bankKey}`] = favData;
            await setDoc(userRef, updateData, { merge: true });
            alert("✅ บันทึกรายการโปรดแล้ว");
        } catch (error) { 
            console.error(error); alert("❌ เกิดข้อผิดพลาด"); 
        }
    }
};

window.loadFavoriteFromCloud = async function() {
    if (!window.currentUserUid) return alert("⚠️ กรุณาเข้าสู่ระบบ");
    const bankKey = window.CURRENT_BANK || 'GENERAL'; 
    
    if (window.maxSessions > 1) {
        const localData = sessionStorage.getItem(`slipFav_${bankKey}`);
        if (localData) {
            applyFavoriteDataToScreen(JSON.parse(localData));
        } else {
            alert(`⚠️ ยังไม่ได้บันทึกรายการโปรด`);
        }
    } else {
        try {
            const userRef = doc(db, "users", window.currentUserUid);
            const docSnap = await getDoc(userRef);
            const favKey = `slipFav_${bankKey}`;
            if (docSnap.exists() && docSnap.data()[favKey]) {
                const f = docSnap.data()[favKey];
                applyFavoriteDataToScreen(f);
            } else { 
                alert(`⚠️ ยังไม่ได้บันทึกรายการโปรด`); 
            }
        } catch (error) { 
            console.error(error); alert("❌ เกิดข้อผิดพลาดในการโหลด"); 
        }
    }
};