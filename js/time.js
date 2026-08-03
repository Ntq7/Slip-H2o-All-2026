// --- ฟังก์ชันคัดลอกรูปภาพทันที (ใช้ html2canvas) ---
async function copyDocumentAsImage() {
    const paperElement = document.getElementById('document-paper');
    const btn = document.getElementById('btn-copy');
    
    if (!paperElement || !btn) return; 

    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ กำลังคัดลอก...';
    btn.disabled = true;

    try {
        const canvas = await html2canvas(paperElement, {
            scale: 2, 
            useCORS: true, 
            allowTaint: true,
            backgroundColor: "#ffffff"
        });

        canvas.toBlob(async function(blob) {
            try {
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]);
                
                const toast = document.getElementById('copy-toast');
                if (toast) {
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 3000);
                }

            } catch (err) {
                alert('⚠️ เบราว์เซอร์ของคุณไม่รองรับการคัดลอกรูปภาพอัตโนมัติ กรุณาใช้ Google Chrome / Edge / Safari');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }, 'image/png');

    } catch (err) {
        alert('เกิดข้อผิดพลาด');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}


window.addEventListener('DOMContentLoaded', () => {
    
    const thMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    
    const today = new Date();
    const d = today.getDate();
    const m = today.getMonth();
    const y = today.getFullYear() + 543; 

    const formattedDate = `${d} ${thMonths[m]} ${y}`;
    const dd = String(d).padStart(2, '0');
    const mm = String(m + 1).padStart(2, '0');
    const yy = String(y).slice(-2);
    const docNo = `${dd}${mm}${yy}/${y}`;

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const td = tomorrow.getDate();
    const tm = tomorrow.getMonth();
    const ty = tomorrow.getFullYear() + 543;
    const tomorrowFormatted = `${td} ${thMonths[tm]} ${ty}`;

    // ใส่ค่าลงในช่อง Input ฝั่งซ้าย
    const inDate = document.getElementById('in-date');
    const inDocNo = document.getElementById('in-doc-no');
    const inDeadlineDate = document.getElementById('in-deadline-date');

    if (inDate && inDocNo && inDeadlineDate) {
        inDate.value = formattedDate;
        inDocNo.value = docNo;
        inDeadlineDate.value = tomorrowFormatted;
    }

    const syncInputs = [
        { id: 'doc-no', outIds: ['out-doc-no'] },
        { id: 'date', outIds: ['out-date', 'out-sig-date'] },
        { id: 'customer', outIds: ['out-customer', 'out-customer2'] },
        { id: 'userid', outIds: ['out-userid'] },
        { id: 'action-text', outIds: ['out-action-text'] },
        { id: 'amount', outIds: ['out-amount'] },
        { id: 'deadline-date', outIds: ['out-deadline-date'] },
        { id: 'deadline-time', outIds: ['out-deadline-time'] }
    ];

    syncInputs.forEach(item => {
        const inputEl = document.getElementById(`in-${item.id}`);
        if (inputEl) {
            inputEl.addEventListener('input', () => {
                item.outIds.forEach(outId => {
                    const outEl = document.getElementById(outId);
                    if (outEl) outEl.innerText = inputEl.value;
                });
            });

            item.outIds.forEach(outId => {
                const outEl = document.getElementById(outId);
                if (outEl) {
                    outEl.addEventListener('input', () => {
                        inputEl.value = outEl.innerText;
                    });
                }
            });
        }
    });

    syncInputs.forEach(item => {
        const inputEl = document.getElementById(`in-${item.id}`);
        if (inputEl) {
            inputEl.dispatchEvent(new Event('input'));
        }
    });

    // 4. ระบบเมนูคลิกขวาจำลอง
    const paperElement = document.getElementById('document-paper');
    const menuEl = document.getElementById('custom-context-menu');

    if (paperElement && menuEl) {
        paperElement.addEventListener('contextmenu', (e) => {
            e.preventDefault(); 
            menuEl.style.top = `${e.clientY}px`;
            menuEl.style.left = `${e.clientX}px`;
            menuEl.style.display = 'block';
        });

        document.addEventListener('click', () => {
            menuEl.style.display = 'none';
        });
    }
    
    // ผูกปุ่มคัดลอกรูปภาพในเมนูคลิกขวา
    const copyViaMenu = document.getElementById('copy-via-menu');
    if (copyViaMenu) {
        copyViaMenu.addEventListener('click', copyDocumentAsImage);
    }
});