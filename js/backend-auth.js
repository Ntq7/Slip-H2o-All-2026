import { auth, dbFirestore as db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, onSnapshot, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

window.currentUserUid = null;

// ==========================================
// 🛡️ Helper Functions สำหรับระบบความปลอดภัย
// ==========================================


function parseExpiryDate(dbExpireDate) {
    if (dbExpireDate && typeof dbExpireDate.toDate === 'function') {
        return dbExpireDate.toDate(); 
    }
    return new Date(dbExpireDate); 
}


async function handleAuthError(message) {
    alert(message);

    localStorage.removeItem('currentSessionId');
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Signout error during auth failure:", error);
    }
    window.location.replace('login.html');
}

// ==========================================
// 🔐 ระบบตรวจสอบสถานะล็อกอินแบบ Real-time
// ==========================================
onAuthStateChanged(auth, (user) => {

    if (!user) {
        localStorage.removeItem('currentSessionId');
        window.location.replace('login.html');
        return;
    }

    window.currentUserUid = user.uid; 
    const userRef = doc(db, "users", user.uid);
    
    onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const localSession = localStorage.getItem('currentSessionId');

            if (data.allowMultiSession === false && localSession && data.currentSessionId && data.currentSessionId !== localSession) {
                await handleAuthError("⚠️ มีการล็อคอินซ้อน กำลังออกจากระบบ...");
                return;
            }

            const now = new Date();

            const dbExpireDate = data.expireAt || data.expiredAt || 0;
            const expiryDate = parseExpiryDate(dbExpireDate);

            const isBanned = (data.status !== undefined && data.status !== 'active');

            if (isBanned) {
                await handleAuthError("⚠️ บัญชีของคุณถูกระงับการใช้งาน ติดต่อผู้ดูแลระบบ");
                return;
            }

            if (now > expiryDate) {
                await handleAuthError("⚠️ ระยะเวลาใช้งานของคุณหมดอายุแล้ว กรุณาต่ออายุ");
                return;
            }

            const timeLeftElem = document.getElementById('timeLeftDisplay');
            if(timeLeftElem) {
                const diffMs = expiryDate - now;
                const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
                const diffHours = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
                timeLeftElem.innerText = `${diffDays} วัน ${diffHours} ชม.`;
            }

            document.body.style.display = ''; 

        } else {

            await handleAuthError("⚠️ ไม่พบข้อมูลสิทธิ์การใช้งานของคุณในระบบ");
        }
    }, (error) => {

        console.error("onSnapshot Security Error:", error);
        handleAuthError("⚠️ เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์แบบ Real-time");
    });
});

// ==========================================
// 🚪 ระบบออกจากระบบ (Manual Logout)
// ==========================================
window.logoutApp = () => {
    signOut(auth).then(() => {
        localStorage.removeItem('currentSessionId');
        window.location.replace('login.html');
    }).catch((error) => {
        console.error("Logout Error:", error);
        localStorage.removeItem('currentSessionId');
        window.location.replace('login.html');
    });
};

// ==========================================
// ☁️ Helper Functions สำหรับ Save/Load รายการโปรด
// ==========================================

const getVal = (id) => document.getElementById(id)?.value || '';
// ดึงค่า checked จาก checkbox
const getCheck = (id) => document.getElementById(id)?.checked || false;

const setVal = (id, value) => {
    const elem = document.getElementById(id);
    if (elem && value !== undefined) elem.value = value;
};

const setCheck = (id, value) => {
    const elem = document.getElementById(id);
    if (elem && value !== undefined) elem.checked = value;
};

window.saveFavoriteToCloud = async function() {
    if (!window.currentUserUid) {
        alert("⚠️ กรุณาเข้าสู่ระบบก่อนทำการบันทึก");
        return;
    }

    const bankKey = window.CURRENT_BANK || 'GENERAL'; 
    
    const favData = {

        noteMode: getCheck('modeSwitch'),
        noteText: getVal('AideMemoire'),
        sName: getVal('sendername'),
        sAccount: getVal('senderaccount'),
        rName: getVal('receivername'),
        rAccount: getVal('receiveraccount'),
        bank: getVal('bank'),
        amount: getVal('amount11'),
        sticker: getVal('imageSelect'),
        
        bgNote: getVal('bg_note'),
        bgNormal: getVal('backgroundSelect'),
        money01: getVal('money01'),
        money02: getVal('money02'),
        sAcc1: getVal('senderaccount1'),
        sAcc2: getVal('senderaccount2'),
        mMy: getVal('monthmonthyear'),
        may: getVal('monthandyear'),
        name1: getVal('name1'),
        nametext1: getVal('nametext1'),
        text1: getVal('text1'),
        
        activeBgMode: getVal('activeBgMode') || 'system',
        customImageDataUrl: getVal('customImageDataUrl')
    };

    try {
        const userRef = doc(db, "users", window.currentUserUid);
        const updateData = {};
        updateData[`slipFav_${bankKey}`] = favData;
        
        await setDoc(userRef, updateData, { merge: true });
        alert("✅ บันทึกรายการโปรดเรียบร้อยแล้ว!");
    } catch (error) {
        console.error("Error saving to cloud:", error);
        alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูลไปยังคลาวด์");
    }
};

// ==========================================
// ☁️ ระบบโหลดรายการโปรดจากคลาวด์
// ==========================================
window.loadFavoriteFromCloud = async function() {
    if (!window.currentUserUid) {
        alert("⚠️ กรุณาเข้าสู่ระบบก่อนทำการโหลดข้อมูล");
        return;
    }
    
    const bankKey = window.CURRENT_BANK || 'GENERAL'; 

    try {
        const userRef = doc(db, "users", window.currentUserUid);
        const docSnap = await getDoc(userRef);
        const favKey = `slipFav_${bankKey}`;
        
        if (docSnap.exists() && docSnap.data()[favKey]) {
            const favData = docSnap.data()[favKey];
            
            if(favData.noteMode !== undefined && document.getElementById('modeSwitch')) {
                document.getElementById('modeSwitch').checked = favData.noteMode;
                if(typeof toggleMode === 'function') toggleMode();
            }
            
            setVal('AideMemoire', favData.noteText);
            setVal('sendername', favData.sName);
            setVal('senderaccount', favData.sAccount);
            setVal('receivername', favData.rName);
            setVal('receiveraccount', favData.rAccount);
            setVal('bank', favData.bank);
            setVal('amount11', favData.amount);
            setVal('imageSelect', favData.sticker);
            
            setVal('bg_note', favData.bgNote);
            setVal('backgroundSelect', favData.bgNormal);
            setVal('money01', favData.money01);
            setVal('money02', favData.money02);
            setVal('senderaccount1', favData.sAcc1);
            setVal('senderaccount2', favData.sAcc2);
            setVal('monthmonthyear', favData.mMy);
            setVal('monthandyear', favData.may);
            setVal('name1', favData.name1);
            setVal('nametext1', favData.nametext1);
            setVal('text1', favData.text1);

            setVal('customImageDataUrl', favData.customImageDataUrl);
            setVal('activeBgMode', favData.activeBgMode);
            if(favData.activeBgMode === 'custom' && favData.customImageDataUrl) {
                if(typeof window.activateCustomMode === 'function') window.activateCustomMode();
            } else {
                if(typeof window.activateSystemMode === 'function') window.activateSystemMode();
            }

            if(typeof window.triggerUpdate === 'function') window.triggerUpdate();
            if(typeof window.updateDisplay === 'function') window.updateDisplay();
            
        } else {
            alert(`⚠️ ยังไม่ได้บันทึกรายการโปรดสำหรับรูปแบบธนาคาร ${bankKey}`);
        }
    } catch (error) {
        console.error("Error loading from cloud:", error);
        alert("❌ เกิดข้อผิดพลาดในการดึงข้อมูลจากคลาวด์");
    }
};