// ฟังก์ชันเพื่อโหลดฟอนต์
function loadFonts() {
    const fontPath = 'assets/fonts'; 
    const fonts = [
        new FontFace('SukhumvitSetThin', `url(${fontPath}/SukhumvitSet-Thin.woff)`),
        new FontFace('SukhumvitSetText', `url(${fontPath}/SukhumvitSet-Text.woff)`),
        new FontFace('SukhumvitSetLight', `url(${fontPath}/SukhumvitSet-Light.woff)`),
        new FontFace('SukhumvitSetMedium', `url(${fontPath}/SukhumvitSet-Medium.woff)`),
        new FontFace('SukhumvitSetSemiBold', `url(${fontPath}/SukhumvitSet-SemiBold.woff)`),
        new FontFace('SukhumvitSetBold', `url(${fontPath}/SukhumvitSet-Bold.woff)`),
        new FontFace('SukhumvitSetExtraBold', `url(${fontPath}/SukhumvitSet-Extra%20Bold.woff)`),
        //THSarabunNew
        new FontFace('THSarabunRegular', `url(${fontPath}/THSarabun.woff)`),
        new FontFace('THSarabunBold', `url(${fontPath}/THSarabun-Bold.woff)`),
        new FontFace('THSarabunItalic', `url(${fontPath}/THSarabun-Italic.woff)`),
        new FontFace('THSarabunBoldItalic', `url(${fontPath}/THSarabun-BoldItalic.woff)`),
        new FontFace('THSarabunNew', `url(${fontPath}/THSarabunNew.woff)`),
        new FontFace('THSarabunNewBold', `url(${fontPath}/THSarabunNew-Bold.woff)`),
        new FontFace('THSarabunNewItalic', `url(${fontPath}/THSarabunNew-Italic.woff)`),
        new FontFace('THSarabunNewBoldItalic', `url(${fontPath}/THSarabunNew-BoldItalic.woff)`)
    ];

    return Promise.all(fonts.map(font => font.load().catch(e => console.warn('Font load warning:', e)))).then(function(loadedFonts) {
        loadedFonts.forEach(function(font) {
            if (font) document.fonts.add(font);
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
    const formattedDateTime = localDateTime.replace(' ', 'T').substring(0, 16); 
    const datetimeEl = document.getElementById('datetime');
    if (datetimeEl) {
        datetimeEl.value = formattedDateTime;
    }
}

function padZero(number) {
    return number < 10 ? '0' + number : number;
}

function formatDate(date) {
    if (!date || date === '-') return '-';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';

    const options = { day: 'numeric', month: 'short', year: '2-digit' };
    let formattedDate = d.toLocaleDateString('th-TH', options);
    formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    
    const day = padZero(formattedDate.split(' ')[0]);
    const month = months[d.getMonth()];
    let year = formattedDate.split(' ')[2];
    
    if (!year) year = String(d.getFullYear() + 543).slice(-2);
    year = `25${year}`;
    
    return `${day} ${month} ${year}`;
}

function calculateAmounts(amount1, Percent) {
    const percentValue = parseFloat(Percent.replace('%', '')) / 100;
    const helpAmount = amount1 * percentValue;
    const remainingAmount = amount1 - helpAmount;
    return { helpAmount, remainingAmount };
}

window.updateDisplay = function() {
    try {
        const user1 = document.getElementById('user1')?.value || '-';
        const amount1 = document.getElementById('amount1')?.value || '0';
        const Percent = document.getElementById('Percent')?.value || '0';
        const sendername = document.getElementById('sendername')?.value || '-';
        const datetime = document.getElementById('datetime')?.value || '-';

        const notes = document.getElementById('notes')?.value || '-';
        const footnote = document.getElementById('footnote')?.value || '-';
        let backgroundSelect = document.getElementById('backgroundSelect')?.value || '';
        
        backgroundSelect = backgroundSelect.replace('../', '');

        const companyName = document.getElementById('companyName')?.value || '-';
        const companyNameEng = document.getElementById('companyNameEng')?.value || '-';
        const companyAddress = document.getElementById('companyAddress')?.value || '-';
        const companyName1 = document.getElementById('companyName1')?.value || '-';

        const formattedDate = formatDate(datetime);

        let buddhistYear = '-';
        if (datetime && datetime !== '-') {
            buddhistYear = new Date(datetime).getFullYear() + 543;
        }

        const amount1Value = parseFloat(amount1.toString().replace(/,/g, '')) || 0;
        let percentNum = Percent;
        if (percentNum === '-' || percentNum === '') percentNum = '0';
        const calculatedAmounts = calculateAmounts(amount1Value, percentNum);

        const currencyFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
        const helpAmountFormatted = calculatedAmounts.helpAmount.toLocaleString('th-TH', currencyFormatOptions);
        const remainingAmountFormatted = calculatedAmounts.remainingAmount.toLocaleString('th-TH', currencyFormatOptions);
        const amount1Formatted = amount1Value.toLocaleString('th-TH', currencyFormatOptions);

        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const backgroundImage = new Image();
        backgroundImage.src = backgroundSelect;
        
        backgroundImage.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

            drawText(ctx, `เลขที่ 12659/${buddhistYear}`, 60,110.0,30,'THSarabunNew', '#000000', 'left', 40, 0, 0, 0, 800, 0);
            drawText(ctx, `${companyName}`, 452,190,30,'THSarabunNew', '#000000', 'center', 40, 0, 0, 0, 800, 0);
            drawText(ctx, `${companyNameEng}`, 452,220,30,'THSarabunNew', '#000000', 'center', 40, 0, 0, 0, 800, 0);
            drawText(ctx, `${companyAddress}`, 452,250,30, 'THSarabunNew', '#000000', 'center', 40, 0, 0, 0, 800, 0);
            drawText(ctx, `${formattedDate}`, 844,300,30, 'THSarabunNew', '#000000', 'right', 25, 0, 0, 0, 800, 0);

            const headerInfo = `เรื่อง การยื่นเรื่องเข้าระบบเพื่อ${notes}<br>เรียน ${sendername}<br>ยูสเซอร์ ${user1}`;
            drawText(ctx, headerInfo, 60, 340, 30, 'THSarabunNew', '#000000', 'left', 35, 0, 0, 0, 800, 0);

            const indent = "        "; 
            
            const p1 = `${indent}เนื่องจากการตรวจสอบพบความผิดพลาดในระบบของสมาชิก จึงขอให้สมาชิกยื่นเรื่องเข้าระบบ จำนวนเงิน ${amount1Formatted} บาท เพื่อทำการ${notes} อย่างไรก็ตามเพื่อเป็นการช่วยเหลือสมาชิก ทางบริษัทฯ ได้จัดสรรเงินกองทุนช่วยเหลือสมาชิกจำนวน ${Percent}% หรือประมาณ ${helpAmountFormatted} บาท เพื่อให้สมาชิกได้ดำเนินการด้วยจำนวนเงินที่น้อยลง และดำเนินการให้เสร็จสิ้น`;
            const p2 = `รายละเอียดการดำเนินการ:<br>- จำนวนเงินที่ต้องยื่นเรื่องเข้าระบบ: ${amount1Formatted} บาท<br>- จำนวนเงินช่วยเหลือจากกองทุน: ${Percent}% (${helpAmountFormatted} บาท)<br>- จำนวนเงินที่ต้องดำเนินการ: ${remainingAmountFormatted} บาท`;
            const p3 = `หมายเหตุ: ${footnote}`;
            
            const bodyText = `${p1}<br><br>${p2}<br>${p3}`;
            drawText(ctx, bodyText, 60, 460, 30, 'THSarabunNew', '#000000', 'left', 35, 0, 0, 0, 800, 0);
            
            const sigText = `ขอแสดงความนับถือ<br><br><br>(${companyName1})<br>ผู้จัดการ ${companyName}<br>ออก ณ วันที่ ${formattedDate}`;
            drawText(ctx, sigText, 640, 1037, 30, 'THSarabunNew', '#000000', 'center', 35, 0, 0, 0, 490, 0);
        };
        
        backgroundImage.onerror = function() {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการวาด Canvas: ", error);
    }
}

// ฟังก์ชันวาดตัวหนังสือที่แก้ไขเรื่องเว้นบรรทัดแล้ว
function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor || 'transparent';
    ctx.shadowBlur = shadowBlur || 0;

    const paragraphs = text.split('<br>');
    let currentY = y;

    paragraphs.forEach(paragraph => {
        if (paragraph === '') {
            currentY += lineHeight;
            return;
        }

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
            let displayLine = index > 0 ? line.trimStart() : line;

            if (align === 'center') {
                currentX = x - (ctx.measureText(displayLine).width / 2) - ((displayLine.length - 1) * letterSpacing) / 2;
            } else if (align === 'right') {
                currentX = x - ctx.measureText(displayLine).width - ((displayLine.length - 1) * letterSpacing);
            }

            drawTextLine(ctx, displayLine, currentX, currentY, letterSpacing);
            currentY += lineHeight;
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

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'slip_document.png';
    link.click();

    const toast = document.getElementById('copy-toast');
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}