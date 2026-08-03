// ==========================================
// 1. ระบบจัดการและโหลดฟอนต์
// ==========================================
function loadFonts() {
    const fonts = [
        new FontFace('THSarabunRegular', 'url(assets/fonts/THSarabun.woff)'),
        new FontFace('THSarabunBold', 'url(assets/fonts/THSarabun-Bold.woff)'),
        new FontFace('THSarabunNew', 'url(assets/fonts/THSarabunNew.woff)'),
        new FontFace('THSarabunNewBold', 'url(assets/fonts/THSarabunNew-Bold.woff)')
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
    loadFonts().then(function() {
        document.fonts.ready.then(function() {
            updateDisplay(); 
        });
    }).catch(function(err) {
        console.error("ไม่สามารถโหลดฟอนต์ได้:", err);
        updateDisplay(); 
    });
};

// ==========================================
// 2. ระบบจัดการรูปภาพและ Canvas
// ==========================================
window.updateDisplay = function() {
    const Companyaccount = document.getElementById('Companyaccount').value || '-';
    const Companymoney = document.getElementById('Companymoney').value || '-';
    const accountNumber1 = document.getElementById('accountNumber1').value || '-';
    const savings = document.getElementById('savings').value || '-';
    const Dateandtime = document.getElementById('Dateandtime').value || '-';
    const notes = document.getElementById('notes').value || '-';

    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const backgroundImage = new Image();
    // พาธรูปภาพพื้นหลัง
    backgroundImage.src = 'assets/image/bs/A-SCB.jpg'; 
    
    backgroundImage.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        // พิกัดข้อความ
        drawText(ctx, `${Companyaccount}`, 460, 529, 22, 'THSarabunNew', '#656565', 'left', 25, 3, 0, 0, 800, 0);
        drawText(ctx, `${Companymoney}`, 460, 553.5, 22, 'THSarabunNew', '#656565', 'left', 25, 3, 0, 0, 800, 0);
        drawText(ctx, `${accountNumber1}`, 460, 607, 22, 'THSarabunNew', '#656565', 'left', 25, 3, 0, 0, 800, 0);
        
        // ตรวจสอบว่าเติมคำว่า บาท ไปแล้วหรือยัง
        let savingsText = savings.includes('บาท') ? savings : `${savings} บาท`;
        if(savings === '-') savingsText = '- บาท';
        drawText(ctx, savingsText, 460, 677.6, 22, 'THSarabunNew', '#656565', 'left', 25, 3, 0, 0, 800, 0);
        
        drawText(ctx, `0.00 บาท`, 460, 703.8, 22, 'THSarabunNew', '#656565', 'left', 25, 3, 0, 0, 800, 0);
        drawText(ctx, `${Dateandtime}`, 460, 729, 22, 'THSarabunNew', '#656565', 'left', 25, 3, 0, 0, 800, 0);
        drawText(ctx, `${notes}`, 186.5, 784.5, 22, 'THSarabunNew', '#e10707', 'left', 25, 3, 0, 0, 800, 0);
    };

    backgroundImage.onerror = function() {
        console.warn("ไม่พบรูปภาพพื้นหลัง เช็กโฟลเดอร์ assets/image/bs/A-SCB.jpg");
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ef4444";
        ctx.font = "30px sans-serif";
        ctx.fillText("⚠️ ไม่พบรูปภาพพื้นหลัง (A-SCB.jpg)", 400, 450);
    };
}

// ==========================================
// 3. ระบบจัดการฟอนต์และการตัดคำภาษาไทย
// ==========================================
function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor || 'transparent';
    ctx.shadowBlur = shadowBlur || 0;

    const paragraphs = text.split('<br>');
    const processedParagraphs = [];
    paragraphs.forEach(p => processedParagraphs.push(...p.split('\n')));

    let currentY = y;

    processedParagraphs.forEach(paragraph => {
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

// ==========================================
// 4. ระบบดาวน์โหลด
// ==========================================
window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'slip_scb_generated.png';
    link.click();
}

const generateBtn = document.getElementById('generate');
if (generateBtn) {
    generateBtn.addEventListener('click', updateDisplay);
}