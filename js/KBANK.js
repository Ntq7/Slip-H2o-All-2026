function loadFonts() {
    const fonts = [
        new FontFace('THSarabunRegular', 'url(assets/fonts/THSarabun.woff)'),
        new FontFace('THSarabunBold', 'url(assets/fonts/THSarabun-Bold.woff)'),
        new FontFace('THSarabunItalic', 'url(assets/fonts/THSarabun-Italic.woff)'),
        new FontFace('THSarabunBoldItalic', 'url(assets/fonts/THSarabun-BoldItalic.woff)'),
        new FontFace('THSarabunNew', 'url(assets/fonts/THSarabunNew.woff)'),
        new FontFace('THSarabunNewBold', 'url(assets/fonts/THSarabunNew-Bold.woff)'),
        new FontFace('THSarabunNewItalic', 'url(assets/fonts/THSarabunNew-Italic.woff)'),
        new FontFace('THSarabunNewBoldItalic', 'url(assets/fonts/THSarabunNew-BoldItalic.woff)')
    ];

    return Promise.all(fonts.map(font => font.load().catch(e => {
        console.warn("ข้ามฟอนต์ที่ไม่พบ:", font.family);
        return null;
    }))).then(function(loadedFonts) {
        loadedFonts.forEach(function(font) {
            if(font) document.fonts.add(font);
        });
    });
}

window.onload = function() {
    setCurrentDateTime();
    loadFonts().then(function() {
        document.fonts.ready.then(function() {
            updateDisplay(); 
        });
    }).catch(function() {
        updateDisplay();
    });
};

function setCurrentDateTime() {
    const now = new Date();
    const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
    const formattedDateTime = localDateTime.replace(' ', 'T');
    const dtField = document.getElementById('datetime');
    if(dtField && !dtField.value) dtField.value = formattedDateTime;
}

function padZero(number) {
    return number < 10 ? '0' + number : number;
}

function formatDate(date) {
    const day = padZero(new Date(date).getDate());
    const month = padZero(new Date(date).getMonth() + 1);
    const year = ((new Date(date).getFullYear()) + 543).toString().substr(-2);
    return `${day}/${month}/${year}`;
}

let qrCodeImage = null;
let powerSavingMode = false;

function updateDisplay() {
    const User = document.getElementById('User').value || '-';
    const accountNumber = document.getElementById('accountNumber').value || '-';
    const Payeeaccount = document.getElementById('Payeeaccount').value || '-';
    const savings = document.getElementById('savings').value || '-';
    const datetime = document.getElementById('datetime').value || new Date();
    const notes = document.getElementById('notes').value || 'บัญชีของสมาชิกไม่ตรงกับข้อมูลในระบบ ธนาคารทำการโอนซ้ำหลายรอบ ไม่สามารถโอนเงิน เข้าได้ ตามกฎระเบียบของธนาคาร กฎหมายความมั่นคงของกองทุนผู้กู้ ถูกอายัดชั่วคราว';
   
    const formattedDate = formatDate(datetime);
    const formattedTime = new Date(datetime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' , second: '2-digit' });

    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const backgroundImage = new Image();
    backgroundImage.src = 'assets/image/bs/A-KBANK.jpg';
    
    backgroundImage.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        drawText(ctx, `${User}`, 794, 247.8, 32, 'THSarabunNew', '#656565', 'left', 25, 3, 0, 0, 800, 0);
        drawText(ctx, `${accountNumber}`, 794, 311.1, 32, 'THSarabunNew', '#656565', 'left', 25, 3, 0, 0, 800, 0);
        drawText(ctx, `${Payeeaccount}`, 794, 374.4, 32, 'THSarabunNew', '#656565', 'left', 25, 3, 0, 0, 800, 0);
        drawText(ctx, `${savings} บาท`, 794, 436.7, 32, 'THSarabunNew', '#656565', 'left', 25, 3, 0, 0, 800, 0);
        drawText(ctx, `${formattedDate} ${formattedTime}`, 794, 499, 32, 'THSarabunNew', '#656565', 'left', 25, 3, 0, 0, 800, 0);
        drawText(ctx, `${notes}`, 592.5, 565.2, 30, 'THSarabunNew', '#ff0000', 'left', 35, 3, 0, 0, 730, 0);
    };

    backgroundImage.onerror = function() {
        console.warn("ไม่พบรูปภาพพื้นหลัง A-KBANK.jpg");
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ef4444";
        ctx.font = "30px sans-serif";
        ctx.fillText("⚠️ ไม่พบรูปภาพพื้นหลัง (A-KBANK.jpg)", 400, 400);
    };
}

function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor || 'transparent';
    ctx.shadowBlur = shadowBlur || 0;

    const paragraphs = text.split('<br>');
    let currentY = y;

    paragraphs.forEach(paragraph => {
        const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
        const words = [...segmenter.segment(paragraph)].map(segment => segment.segment);

        let lines = [];
        let currentLine = '';

        words.forEach((word) => {
            const testLine = currentLine + word;
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

            if (testWidth > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) {
            lines.push(currentLine);
        }

        lines.forEach((line, index) => {
            let currentX = x;
            if (align === 'center') {
                currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
            } else if (align === 'right') {
                currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
            }
            drawTextLine(ctx, line, currentX, currentY, letterSpacing);
            currentY += lineHeight;
            if (maxLines && index >= maxLines - 1) return;
        });
        currentY += lineHeight;
    });
}

function drawTextLine(ctx, text, x, y, letterSpacing) {
    if (!letterSpacing) {
        ctx.fillText(text, x, y);
        return;
    }
    const characters = text.split('');
    let currentPosition = x;
    characters.forEach((char) => {
        ctx.fillText(char, currentPosition, y);
        const charWidth = ctx.measureText(char).width;
        currentPosition += charWidth + letterSpacing;
    });
}

function downloadImage() {
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'slip_kbank_generated.png';
    link.click();
}

// ระบบบันทึก/โหลด ข้อมูลชั่วคราว (Local Storage)
function saveTemporaryData() {
    const formContainer = document.querySelector('.form-container');
    if (!formContainer) return;
    const formData = {};
    const inputs = formContainer.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type === 'file') return;
        const value = input.type === 'checkbox' ? input.checked : input.value;
        if (input.id || input.name) {
            const key = input.id || input.name;
            formData[key] = value;
        }
    });
    const pageName = window.location.pathname.split('/').pop().replace('.html', '');
    const dataToSave = { data: formData, timestamp: Date.now(), pageName: pageName };
    try {
        localStorage.setItem('temp_data_' + pageName, JSON.stringify(dataToSave));
        alert('บันทึกข้อมูลชั่วคราวเรียบร้อยแล้ว (เก็บไว้ 30 นาที)');
    } catch (e) {
        console.error('Error saving temporary data:', e);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
}

function loadTemporaryData() {
    try {
        const pageName = window.location.pathname.split('/').pop().replace('.html', '');
        const savedData = localStorage.getItem('temp_data_' + pageName);
        if (!savedData) return;
        const parsed = JSON.parse(savedData);
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        if (now - parsed.timestamp > thirtyMinutes) {
            localStorage.removeItem('temp_data_' + pageName);
            return;
        }
        const formContainer = document.querySelector('.form-container');
        if (!formContainer) return;
        const formData = parsed.data;
        const inputs = formContainer.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'file') return;
            const key = input.id || input.name;
            if (key && formData.hasOwnProperty(key)) {
                if (input.type === 'checkbox') {
                    input.checked = formData[key];
                } else {
                    input.value = formData[key];
                }
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        if (typeof updateDisplay === 'function') {
            setTimeout(updateDisplay, 100);
        }
    } catch (e) {
        console.error('Error loading temporary data:', e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTemporaryData);
} else {
    loadTemporaryData();
}