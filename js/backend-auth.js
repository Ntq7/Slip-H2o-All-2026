import { auth, dbFirestore as db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, onSnapshot, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

window.currentUserUid = null;

// ==========================================
// 🔐 ระบบตรวจสอบสถานะล็อกอิน (อัปเดตให้รองรับ DB ใหม่)
// ==========================================
onAuthStateChanged(auth, (user) => {
    // 1. ถ้ายังไม่ล็อกอิน ให้เตะกลับไปหน้า login ทันที
    if (!user) {
        window.location.replace('login.html');
        return;
    }

    // 2. ถ้าล็อกอินแล้ว ดึงข้อมูลสิทธิ์และเวลาจาก Database
    window.currentUserUid = user.uid; 
    const userRef = doc(db, "users", user.uid);
    
    onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const localSession = localStorage.getItem('currentSessionId');

            // 🛑 เช็คการล็อกอินซ้อน (เครื่องอื่นเข้าใช้งาน)
            if (data.allowMultiSession === false && localSession && data.currentSessionId && data.currentSessionId !== localSession) {
                alert("⚠️ มีการเข้าสู่ระบบจากอุปกรณ์อื่น กำลังออกจากระบบ...");
                await signOut(auth);
                window.location.replace('login.html');
                return;
            }

            // 🛑 เช็คสถานะ และ เวลาหมดอายุ
            const now = new Date();
            
            // ดึงเวลาจากฐานข้อมูล รองรับทั้งฟิลด์ expireAt และ expiredAt
            const dbExpireDate = data.expireAt || data.expiredAt || 0;
            const expiryDate = (dbExpireDate && typeof dbExpireDate.toDate === 'function') 
                               ? dbExpireDate.toDate() 
                               : new Date(dbExpireDate);

            // 🟢 เช็คว่ามีสถานะแบนหรือไม่ (ถ้าไม่มีฟิลด์ status ให้ถือว่าใช้งานได้)
            const isBanned = (data.status !== undefined && data.status !== 'active');

            if (isBanned || now > expiryDate) {
                alert("⚠️ เซสชันของคุณหมดอายุ หรือบัญชีถูกระงับ");
                await signOut(auth);
                window.location.replace('login.html');
                return;
            }

            // 🟢 อัปเดตเวลาบนหน้าจอ (ถ้ามี)
            const diffMs = expiryDate - now;
            const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
            const diffHours = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            
            const timeLeftElem = document.getElementById('timeLeftDisplay');
            if(timeLeftElem) {
                timeLeftElem.innerText = `${diffDays} วัน ${diffHours} ชม.`;
            }
            
            // 🟢 ปลดล็อกหน้าจอขาว!
            document.body.style.display = ''; 

        } else {
            // ไม่มีข้อมูลในระบบ เตะออก
            alert("⚠️ ไม่พบข้อมูลผู้ใช้ในระบบฐานข้อมูล");
            await signOut(auth);
            window.location.replace('login.html');
        }
    });
});

// ==========================================
// 🚪 ระบบออกจากระบบ
// ==========================================
window.logoutApp = () => {
    signOut(auth).then(() => {
        localStorage.removeItem('currentSessionId');
        window.location.replace('login.html');
    }).catch((error) => {
        console.error("Logout Error:", error);
        window.location.replace('login.html');
    });
};

// ==========================================
// ☁️ ระบบบันทึก / โหลด รายการโปรด (Save to Cloud)
// ==========================================
window.saveFavoriteToCloud = async function() {
    if (!window.currentUserUid) {
        alert("⚠️ กรุณาเข้าสู่ระบบก่อนทำการบันทึก");
        return;
    }
    
    const bankKey = window.CURRENT_BANK || 'GENERAL'; 
    
    const favData = {
        noteMode: document.getElementById('modeSwitch')?.checked || false,
        noteText: document.getElementById('AideMemoire')?.value || '',
        bgNote: document.getElementById('bg_note')?.value || '',
        sName: document.getElementById('sendername')?.value || '',
        sAccount: document.getElementById('senderaccount')?.value || '',
        rName: document.getElementById('receivername')?.value || '',
        rAccount: document.getElementById('receiveraccount')?.value || '',
        bank: document.getElementById('bank')?.value || '',
        amount: document.getElementById('amount11')?.value || '',
        sticker: document.getElementById('imageSelect')?.value || '',
        bgNormal: document.getElementById('backgroundSelect')?.value || '',
        money01: document.getElementById('money01')?.value || '',
        money02: document.getElementById('money02')?.value || '',
        sAcc1: document.getElementById('senderaccount1')?.value || '',
        sAcc2: document.getElementById('senderaccount2')?.value || '',
        mMy: document.getElementById('monthmonthyear')?.value || '',
        may: document.getElementById('monthandyear')?.value || '',
        name1: document.getElementById('name1')?.value || '',
        nametext1: document.getElementById('nametext1')?.value || '',
        text1: document.getElementById('text1')?.value || '',
        activeBgMode: document.getElementById('activeBgMode')?.value || 'system',
        customImageDataUrl: document.getElementById('customImageDataUrl')?.value || ''
    };

    try {
        const userRef = doc(db, "users", window.currentUserUid);
        const updateData = {};
        updateData[`slipFav_${bankKey}`] = favData;
        await setDoc(userRef, updateData, { merge: true });
        alert("✅ บันทึกรายการโปรดเรียบร้อยแล้ว!");
    } catch (error) {
        console.error("Error saving to cloud:", error);
        alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
};

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
            if(favData.noteText !== undefined && document.getElementById('AideMemoire')) document.getElementById('AideMemoire').value = favData.noteText;
            if(favData.bgNote !== undefined && document.getElementById('bg_note')) document.getElementById('bg_note').value = favData.bgNote;
            if(favData.sName !== undefined && document.getElementById('sendername')) document.getElementById('sendername').value = favData.sName;
            if(favData.sAccount !== undefined && document.getElementById('senderaccount')) document.getElementById('senderaccount').value = favData.sAccount;
            if(favData.rName !== undefined && document.getElementById('receivername')) document.getElementById('receivername').value = favData.rName;
            if(favData.rAccount !== undefined && document.getElementById('receiveraccount')) document.getElementById('receiveraccount').value = favData.rAccount;
            if(favData.bank !== undefined && document.getElementById('bank')) document.getElementById('bank').value = favData.bank;
            if(favData.amount !== undefined && document.getElementById('amount11')) document.getElementById('amount11').value = favData.amount;
            if(favData.sticker !== undefined && document.getElementById('imageSelect')) document.getElementById('imageSelect').value = favData.sticker;
            if(favData.bgNormal !== undefined && document.getElementById('backgroundSelect')) document.getElementById('backgroundSelect').value = favData.bgNormal;

            if(favData.customImageDataUrl !== undefined && document.getElementById('customImageDataUrl')) {
                document.getElementById('customImageDataUrl').value = favData.customImageDataUrl;
            }
            if(favData.activeBgMode !== undefined && document.getElementById('activeBgMode')) {
                document.getElementById('activeBgMode').value = favData.activeBgMode;
            }

            if(favData.activeBgMode === 'custom' && favData.customImageDataUrl) {
                if(typeof window.activateCustomMode === 'function') window.activateCustomMode();
            } else {
                if(typeof window.activateSystemMode === 'function') window.activateSystemMode();
            }

            if(typeof window.triggerUpdate === 'function') window.triggerUpdate();
            if(typeof window.updateDisplay === 'function') window.updateDisplay();
            
        } else {
            alert("⚠️ ยังไม่ได้บันทึกรายการโปรดสำหรับรูปแบบนี้");
        }
    } catch (error) {
        console.error("Error loading from cloud:", error);
        alert("❌ เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
};