import { auth, dbFirestore as db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, onSnapshot, setDoc, getDoc, updateDoc, deleteField } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

window.currentUserUid = null;
window.allowMultiSession = false; 
let presenceInterval = null; 

// ==========================================
// 🛡️ Helper Functions
// ==========================================
function parseExpiryDate(dbExpireDate) {
    if (dbExpireDate && typeof dbExpireDate.toDate === 'function') return dbExpireDate.toDate(); 
    if (typeof dbExpireDate === 'string' && !isNaN(dbExpireDate)) return new Date(Number(dbExpireDate));
    return new Date(dbExpireDate); 
}

async function handleAuthError(message) {
    if(message) alert(message);
    if (presenceInterval) clearInterval(presenceInterval);
    localStorage.removeItem('currentSessionId');
    try { await signOut(auth); } catch (error) {}
    window.location.replace('login.html');
}

// ==========================================
// 🔐 ระบบตรวจสอบสถานะแบบ Real-time
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (!user) {
        localStorage.removeItem('currentSessionId');
        window.location.replace('login.html');
        return;
    }

    window.currentUserUid = user.uid; 
    const userRef = doc(db, "users", user.uid);
    
    // ------------------------------------------------
    // 💓 1. ระบบส่งสัญญาณว่าออนไลน์อยู่ (Heartbeat)
    // ------------------------------------------------
    let localSession = localStorage.getItem('currentSessionId');
    if (!localSession) {
        localSession = "SID_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('currentSessionId', localSession);
    }

    const updatePresence = async () => {
        try {
            await setDoc(userRef, {
                activeSessions: {
                    [localSession]: Date.now()
                }
            }, { merge: true });
        } catch(e) { console.error("Presence Error:", e); }
    };

    updatePresence(); 
    presenceInterval = setInterval(updatePresence, 60000); 
    
    // ------------------------------------------------
    // 📡 2. ตรวจสอบข้อมูล Real-time 
    // ------------------------------------------------
    onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();

            window.allowMultiSession = data.allowMultiSession === true;

            if (data.allowMultiSession === false && data.currentSessionId && data.currentSessionId !== localSession) {
                await handleAuthError("⚠️ มีการล็อคอินซ้อน กำลังออกจากระบบ...");
                return;
            }

            const isBanned = (data.status !== undefined && data.status !== 'active');
            if (isBanned) {
                await handleAuthError("⚠️ บัญชีของคุณถูกระงับการใช้งาน");
                return;
            }

            const userNameElem = document.getElementById('userProfileName');
            if (userNameElem) {
                userNameElem.innerText = data.username || user.email;
            }

            const now = new Date();
            const dbExpireDate = data.expireAt || data.expiredAt; 
            
            const expireDateElem = document.getElementById('userExpireDate') || document.getElementById('dash-expire-date'); 
            const countdownElem = document.getElementById('userTimeLeft') || document.getElementById('timeLeftDisplay') || document.getElementById('dash-countdown');

            if (dbExpireDate) {
                const expiryDate = parseExpiryDate(dbExpireDate);
                if (now > expiryDate) {
                    await handleAuthError("⚠️ ระยะเวลาใช้งานหมดอายุ");
                    return;
                }

                const diffMs = expiryDate - now;
                const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
                const diffHours = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
                
                if(countdownElem) countdownElem.innerText = `${diffDays} วัน ${diffHours} ชม.`;
                if(expireDateElem) {
                    const d = expiryDate;
                    expireDateElem.innerText = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear() + 543} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')} น.`;
                }
            } else {
                if(expireDateElem) expireDateElem.innerText = "กำลังโหลด...";
                if(countdownElem) countdownElem.innerText = "กำลังโหลด...";
            }

            // ------------------------------------------------
            // 👥 3. ระบบนับจำนวนคนออนไลน์
            // ------------------------------------------------
            if (data.activeSessions) {
                let activeCount = 0;
                for (const [sid, timestamp] of Object.entries(data.activeSessions)) {
                    if (now.getTime() - timestamp < 120000) { 
                        activeCount++;
                    }
                }
                const countElem = document.getElementById('active-devices-count');
                if (countElem) countElem.innerText = activeCount;
            }

            document.body.style.display = ''; 

        } else {
            await handleAuthError("⚠️ ไม่พบข้อมูลสิทธิ์การใช้งานของคุณในระบบ");
        }
    }, (error) => {});
});

// ==========================================
// 🚪 ระบบออกจากระบบ 
// ==========================================
window.logoutApp = async () => {
    const localSession = localStorage.getItem('currentSessionId');
    if (window.currentUserUid && localSession) {
        try {
            const userRef = doc(db, "users", window.currentUserUid);
            const updateData = {};
            updateData[`activeSessions.${localSession}`] = deleteField();
            await updateDoc(userRef, updateData);
        } catch (error) {}
    }
    if (presenceInterval) clearInterval(presenceInterval);
    signOut(auth).then(() => {
        localStorage.removeItem('currentSessionId');
        window.location.replace('login.html');
    }).catch(() => {
        localStorage.removeItem('currentSessionId');
        window.location.replace('login.html');
    });
};


const getVal = (id) => document.getElementById(id)?.value || '';
const getCheck = (id) => document.getElementById(id)?.checked || false;
const setVal = (id, value) => { const elem = document.getElementById(id); if (elem && value !== undefined) elem.value = value; };
const setCheck = (id, value) => { const elem = document.getElementById(id); if (elem && value !== undefined) elem.checked = value; };

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

    if (window.allowMultiSession) {
        try {
            const favKey = `slipFavLocal_${bankKey}`;
            localStorage.setItem(favKey, JSON.stringify(favData));
            alert("✅ บันทึกรายการโปรดแล้ว");
        } catch (error) { 
            console.error(error); alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล"); 
        }
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
    
    if (window.allowMultiSession) {
        try {
            const favKey = `slipFavLocal_${bankKey}`;
            const localData = localStorage.getItem(favKey);
            if (localData) {
                const f = JSON.parse(localData); 
                applyFavoriteDataToScreen(f);
            } else { 
                alert(`⚠️ ยังไม่ได้บันทึกรายการโปรด`); 
            }
        } catch (error) { 
            console.error(error); alert("❌ เกิดข้อผิดพลาด"); 
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
            console.error(error); alert("❌ เกิดข้อผิดพลาด"); 
        }
    }
};
// ==========================================
// 📢 ระบบแจ้งเตือนอัปเดต (เด้งทุกครั้งที่เข้าสู่ระบบใหม่)
// ==========================================
setTimeout(() => {

    const currentSession = localStorage.getItem('currentSessionId');

    if (currentSession && sessionStorage.getItem('popup_shown_for_session') !== currentSession) {
        
        const overlay = document.createElement('div');
        overlay.id = 'custom-update-popup';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(2px);
            display: flex; justify-content: center; align-items: center;
            z-index: 9999; opacity: 0; transition: opacity 0.3s ease;
            padding: 20px; box-sizing: border-box; font-family: 'Prompt', sans-serif;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #ffffff; width: 100%; max-width: 450px;
            border-radius: 16px; padding: 25px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            transform: translateY(-20px); transition: transform 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <span style="font-size: 22px;">📢</span>
                <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">อัปเดต!!!!!</h3>
            </div>
            
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
                อัปเดตล่าสุด: อัปเดตธีมใหม่ล่าสุดสำหรับธนาคารกรุงไทย ( KTB )
            </p>
            
            <div style="text-align: right;">
                <button id="close-popup-btn" style="
                    background: #4f46e5; color: white; border: none;
                    padding: 10px 25px; border-radius: 50px; font-size: 14px; font-weight: 500;
                    cursor: pointer; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
                    transition: background 0.2s; font-family: 'Prompt', sans-serif;
                ">ตกลง รับทราบ</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'translateY(0)';
        });

        document.getElementById('close-popup-btn').addEventListener('click', () => {
            overlay.style.opacity = '0';
            modal.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                overlay.remove();

                sessionStorage.setItem('popup_shown_for_session', currentSession);
            }, 300);
        });
    }
}, 1000);