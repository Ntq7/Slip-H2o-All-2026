let currentVerificationModeIsSuccess = true; 
let currentActionName = '';
let currentSystemMode = 'premium';

const imgPremium = "assets/images/logopk.png"; 

const menuItems = [
    { name: "บันทึกช่วยจำ", status: "✅" }, { name: "บันทึกช่วยจำ", status: "❌" },
    { name: "หมายเหตุถอน", status: "✅" }, { name: "หมายเหตุถอน", status: "❌" },
    { name: "ถอน 3%", status: "✅" }, { name: "ถอน 3%", status: "❌" },
    { name: "ถอน 2 ยอด", status: "✅" }, { name: "ถอน 2 ยอด", status: "❌" },
    { name: "ถอนเกินเวลา", status: "✅" }, { name: "ถอนเกินเวลา", status: "❌" }
];

function switchSystemMode(mode) {
    currentSystemMode = mode;
    

    ['premium', 'document'].forEach(btnMode => {
        const btn = document.getElementById(`btn-mode-${btnMode}`);
        if(btn) btn.classList.remove('bg-indigo-600', 'border-indigo-400', 'shadow-[0_0_15px_rgba(99,102,241,0.5)]');
    });

    const activeBtn = document.getElementById(`btn-mode-${mode}`);
    if(activeBtn) activeBtn.classList.add('bg-indigo-600', 'border-indigo-400', 'shadow-[0_0_15px_rgba(99,102,241,0.5)]');

    const headerTitle = document.getElementById('dashboard-header-title');
    if(headerTitle) {
        headerTitle.innerHTML = mode === 'document' 
            ? "<span class='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400'>รายการเอกสารของระบบ</span>" 
            : "<span class='text-transparent bg-clip-text bg-gradient-to-r from-[#9F8CFF] to-[#D5B8FF]'>เลือกระบบที่ต้องการดำเนินการ</span>";
    }
    renderDashboardGrid(); 
}

function renderDashboardGrid() {
    let grid = document.getElementById('dashboard-grid');
    if(!grid) return;
    grid.innerHTML = '';

    grid.className = "grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-[1000px] mx-auto w-full"; 
    let displayImage = imgPremium; 

    menuItems.forEach((item) => {
        const isGreen = item.status === "✅";
        
        const badgeBg = isGreen ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30";
        const btnClass = isGreen 
            ? "bg-[#059669] hover:bg-[#047857] shadow-[0_0_15px_rgba(5,150,105,0.4)]" 
            : "bg-[#E11D48] hover:bg-[#BE123C] shadow-[0_0_15px_rgba(225,29,72,0.4)]";
        
        grid.innerHTML += `
            <div class="bg-[#1A2234] border border-slate-700/60 rounded-[14px] p-4 flex items-center justify-between transition-all duration-300 hover:border-slate-500 hover:-translate-y-1">
                <div class="flex items-center gap-4">
                    <div class="w-[52px] h-[52px] bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                        <img src="${displayImage}" class="max-w-full max-h-full object-contain">
                    </div>
                    <div class="flex flex-col gap-1 text-left">
                        <h3 class="text-white font-semibold text-[15px] tracking-wide">${item.name}</h3>
                        <span class="inline-block px-2.5 py-0.5 rounded-md text-[10.5px] font-medium w-fit ${badgeBg}">
                            สถานะ ${item.status}
                        </span>
                    </div>
                </div>
                <button onclick="openVerification('${item.status}', '${item.name}')" class="text-white font-medium py-2.5 px-6 rounded-xl transition-all duration-300 text-[13px] flex items-center gap-1.5 shrink-0 active:scale-95 ${btnClass}">
                    <i class="bi bi-lightning-fill"></i> เปิด
                </button>
            </div>`;
    });
}

function openVerification(status, actionTitle) {
    currentVerificationModeIsSuccess = (status === '✅');
    currentActionName = actionTitle.replace(".", "");
    
    const stateDashboard = document.getElementById('state-dashboard');
    const stateVerification = document.getElementById('state-verification');

    const verifyLogo = document.getElementById('verify-logo');
    const resultFormLogo = document.getElementById('result-form-logo');
    if(verifyLogo) verifyLogo.src = imgPremium;
    if(resultFormLogo) resultFormLogo.src = imgPremium;
    
    let titleTextDisplay = "AI SMART CONTRACT";
    const formTitle = document.getElementById('form-title');
    const resultHeadTitle = document.getElementById('result-head-title');
    if(formTitle) formTitle.textContent = titleTextDisplay;
    if(resultHeadTitle) resultHeadTitle.textContent = titleTextDisplay;

    if(stateDashboard) {
        stateDashboard.classList.add('hidden');

    }
    if(stateVerification) {
        stateVerification.classList.remove('hidden');
        stateVerification.classList.add('flex');
    }
}

function goToDashboard() {
    const stateDashboard = document.getElementById('state-dashboard');
    const stateVerification = document.getElementById('state-verification');

    if(stateVerification) {
        stateVerification.classList.add('hidden');
        stateVerification.classList.remove('flex');
    }
    if(stateDashboard) {
        stateDashboard.classList.remove('hidden');
  
    }
}

const form = document.getElementById('verification-form');
const fileInput = document.getElementById('file-upload');
const dropZoneContent = document.getElementById('drop-zone-content');
const formPreviewImage = document.getElementById('form-preview-image');
const appLoadingOverlay = document.getElementById('loading-overlay');
const resultOverlay = document.getElementById('result-overlay');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

function processFile(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if(dropZoneContent) dropZoneContent.classList.add('hidden');
            if(formPreviewImage) {
                formPreviewImage.src = e.target.result;
                formPreviewImage.classList.remove('hidden');
            }
        }
        reader.readAsDataURL(file);
    }
}

document.addEventListener('paste', function(e) {
    const stateVerification = document.getElementById('state-verification');
    if(stateVerification && stateVerification.classList.contains('hidden')) return; 
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            processFile(file);
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            if(fileInput) fileInput.files = dataTransfer.files;
            break;
        }
    }
});

if(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault(); 
        const shopId = document.getElementById('shop-id').value;
        const file = fileInput ? fileInput.files[0] : null;
        if(!shopId || !file) return alert('กรุณาวางรูปภาพ Slip ก่อนดำเนินการตรวจสอบ');

        const reader = new FileReader();
        reader.onload = function(e) { 
            const resImg = document.getElementById('result-image');
            if(resImg) resImg.src = e.target.result; 
        }
        reader.readAsDataURL(file);

        const resShopId = document.getElementById('result-shop-id');
        if(resShopId) resShopId.textContent = shopId;
        startAIVerification();
    });
}

function startAIVerification() {
    if(appLoadingOverlay) appLoadingOverlay.classList.remove('hidden');
    
    let progress = 0;
    if(progressBar) progressBar.style.width = `0%`;
    if(progressText) progressText.textContent = `0%`;
    
    function simulateProcessing() {
        const jump = Math.floor(Math.random() * 15) + 3;
        progress += jump;

        if (progress >= 100) {
            progress = 100;
            if(progressBar) progressBar.style.width = `100%`;
            if(progressText) progressText.textContent = `100%`;
            
            setTimeout(() => { showResult(); }, 500);
            return; 
        }

        if(progressBar) progressBar.style.width = `${progress}%`;
        if(progressText) progressText.textContent = `${progress}%`;

        const nextDelay = Math.floor(Math.random() * 500) + 100;
        setTimeout(simulateProcessing, nextDelay);
    }

    setTimeout(simulateProcessing, 300);
}

function showResult() {
    if(appLoadingOverlay) appLoadingOverlay.classList.add('hidden');
    if(resultOverlay) resultOverlay.classList.remove('hidden');
    
    const resultMsgBox = document.getElementById('result-message-box');
    const resultTitle = document.getElementById('result-title');

    let titleText = "ผลการตรวจสอบรหัสสำคัญ";
    let msgSuccess = "หมายเหตุ: ระบบดำเนินการอ่านข้อมูลรหัสสำคัญ สำเร็จ.";
    let msgFail = "หมายเหตุ: ระบบไม่สามารถดำเนินการอ่านข้อมูลรหัสสำคัญในการทำรายการได้.";

    if (currentActionName === "หมายเหตุถอน") {
        titleText = "ผลการตรวจสอบถอนเงิน";
        msgSuccess = "หมายเหตุ: ระบบ AI SMART CONTRACT ดำเนินการอ่านหมายเหตุถอนเงิน สำเร็จ.";
        msgFail = "หมายเหตุ: ระบบ ไม่สามารถดำเนินการอ่านหมายเหตุถอนเงินได้.";
    } else if (currentActionName === "ถอน 3%") {
        titleText = "ผลการตรวจสอบค่าดำเนินการ 3%";
        msgSuccess = "หมายเหตุ: ระบบตรวจสอบค่าดำเนินการ 3% สำเร็จ.";
        msgFail = "หมายเหตุ: ระบบ ไม่สามารถดำเนินการตรวจสอบค่าดำเนินการ 3% ได้.";
    } else if (currentActionName === "ถอน 2 ยอด") {
        titleText = "ผลการตรวจสอบถอนเงินสองยอด";
        msgSuccess = "หมายเหตุ: ระบบตรวจสอบค่าดำเนินการ 3% สำเร็จ.";
        msgFail = "หมายเหตุ: ระบบ ไม่สามารถดำเนินการตรวจสอบ การเบิกถอนสองยอดได้.";
    } else if (currentActionName === "ถอนเกินเวลา") {
        titleText = "ผลการตรวจสอบถอนเงินตามเวลาที่กำหนด";
        msgSuccess = "หมายเหตุ: ระบบ ตรวจสอบเวลาในการเบิกถอนเงินที่กำหนด สำเร็จ.";
        msgFail = "หมายเหตุ: ระบบไม่สามารถตรวจสอบ การเบิกถอนเวลาที่กำหนดได้.";
    }

    if(resultTitle) resultTitle.textContent = titleText;

    if (currentVerificationModeIsSuccess) {
        if(resultTitle) resultTitle.className = "text-lg font-bold text-[#0F767D] mb-3";
        if(resultMsgBox) {
            resultMsgBox.className = "mt-4 text-[#0F767D] text-[14px] font-medium text-center w-full px-5 py-4 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm leading-relaxed";
            resultMsgBox.textContent = msgSuccess;
        }
    } else {
        if(resultTitle) resultTitle.className = "text-lg font-bold text-red-600 mb-3";
        if(resultMsgBox) {
            resultMsgBox.className = "mt-4 text-red-600 text-[14px] font-medium text-center w-full px-5 py-4 bg-red-50 rounded-xl border border-red-200 shadow-sm leading-relaxed";
            resultMsgBox.textContent = msgFail;
        }
    }

    setTimeout(() => { 
        if(progressBar) progressBar.style.width = '0%'; 
        if(progressText) progressText.textContent = '0%'; 
    }, 500);
}

function closeResult() {
    if(resultOverlay) resultOverlay.classList.add('hidden');
    if(fileInput) fileInput.value = '';
    if(formPreviewImage) {
        formPreviewImage.classList.add('hidden');
        formPreviewImage.src = '';
    }
    if(dropZoneContent) dropZoneContent.classList.remove('hidden');
}

if(resultOverlay) {
    resultOverlay.addEventListener('click', function(e) {
        if (e.target === resultOverlay) closeResult();
    });
}

window.addEventListener('DOMContentLoaded', () => {
    renderDashboardGrid();
});