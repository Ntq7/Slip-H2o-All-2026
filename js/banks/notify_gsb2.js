function loadFonts() {
    const fonts = [
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)')
    ];

    return Promise.allSettled(fonts.map(font => font.load())).then(function(loadedFonts) {
        loadedFonts.forEach(function(result) {
            if (result.status === 'fulfilled') {
                document.fonts.add(result.value);
            }
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
    
    const formattedDateTime = localDateTime.substring(0, 16); 
    const dt = document.getElementById('datetime');
    if(dt) dt.value = formattedDateTime;

    const oneMinuteLater = new Date(now.getTime() + 60000); 
    const hours = oneMinuteLater.getHours().toString().padStart(2, '0');
    const minutes = oneMinuteLater.getMinutes().toString().padStart(2, '0');
    const formattedTimePlusOne = `${hours}:${minutes}`;
    const dtPlusOne = document.getElementById('datetime_plus_one');
    if(dtPlusOne) dtPlusOne.value = formattedTimePlusOne;
}

function padZero(number) {
    return number < 10 ? '0' + number : number;
}

function formatDateWithDay(date) {
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    
    const dayName = days[new Date(date).getDay()];
    const day = new Date(date).getDate();
    const month = months[new Date(date).getMonth()];

    return `${dayName}ที่ ${day} ${month}`;
}

function formatDate(date) {
    const day = padZero(new Date(date).getDate());
    const month = padZero(new Date(date).getMonth() + 1);
    const year = new Date(date).getFullYear().toString().substr(-2);
    return `${day}/${month}/${year}`;
}

let qrCodeImage = null;
let powerSavingMode = false;

window.handlePaste = function(event) {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    qrCodeImage = img;
                    updateDisplay();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(blob);
        }
    }
}

window.updateDisplay = function() {
    const datetime = document.getElementById('datetime')?.value || '-';
    const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const money01 = document.getElementById('money01')?.value || '-';
    const senderaccount2 = document.getElementById('senderaccount2')?.value || '-';
    
    const formattedTimePlusOne = datetimePlusOne;

    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawAllContent = (bgImg) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (bgImg) {
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#fce7f3';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#be185d';
            ctx.font = '20px Kanit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('❌ หาภาพพื้นหลังไม่เจอ', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillStyle = '#831843';
            ctx.font = '16px Kanit, sans-serif';
            ctx.fillText('ตรวจสอบไฟล์: assets/image/bs/backgroundEnter-O2.jpg', canvas.width / 2, canvas.height / 2 + 10);
        }

        // เวลาบนแถบสถานะมุมซ้ายบน
        drawText(ctx, `${formattedTimePlusOne}`, 80, 46.5, 25, 'SFThonburiBold', '#ffffff', 'center', 1.5, 3, 0, 0, 800, -0.50);

        // หัวข้อแจ้งเตือน Mymo (ปรับขนาดและตำแหน่งให้ตรงกับกรอบและไอคอน)
        drawText(ctx, `Mymo`, 134.7, 144.0, 22.5, 'SFThonburiBold', '#000000', 'left', 1.5, 1, 0, 0, 420, -0.2);

        // รายละเอียดแจ้งเตือน (ใช้ SFThonburiRegular ขนาด 21.5px ให้สมจริง ไม่ล้นกรอบ)
        drawText(ctx, `ยอดเงินจำนวน ${money01} บาท ได้ฝากไปที่บัญชี ${senderaccount2}`, 134.7, 176.0, 21.5, 'SFThonburiRegular', '#000000', 'left', 31, 3, 0, 0, 415, -0.2);

        if (qrCodeImage) {
            ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951); 
        }

        drawBattery(ctx, batteryLevel, powerSavingMode);
    };

    const backgroundImage = new Image();
    backgroundImage.src = 'assets/image/bs/backgroundEnter-O2.jpg';
    
    backgroundImage.onload = function() {
        drawAllContent(backgroundImage);
    };

    backgroundImage.onerror = function() {
        drawAllContent(null);
    }
}

function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px "${fontFamily}", sans-serif`;
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
            lines.push(currentLine.trimStart());
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
            if (maxLines && index >= maxLines - 1) {
                return;
            }
        });
    });
}

function drawTextLine(ctx, text, x, y, letterSpacing) {
    if (!letterSpacing) {
        ctx.fillText(text, x, y);
        return;
    }

    const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
    const characters = [...segmenter.segment(text)].map(segment => segment.segment);
    let currentPosition = x;

    characters.forEach((char, index) => {
        const code = char.charCodeAt(0);
        const prevChar = index > 0 ? characters[index - 1].charCodeAt(0) : null;

        let yOff = 0, xOff = 0;
        if (code >= 0x0E34 && code <= 0x0E37) yOff = -1;
        if (code >= 0x0E48 && code <= 0x0E4C) {
            if (prevChar && ((prevChar >= 0x0E34 && prevChar <= 0x0E37) || prevChar === 0x0E31)) yOff = -8;
            else xOff = -7;
        }
        if (code === 0x0E31) { yOff = -1; xOff = 1; }
        if (code >= 0x0E38 && code <= 0x0E3A) { xOff = -10; }

        ctx.fillText(char, currentPosition + xOff, y + yOff);

        if (![0x0E48,0x0E49,0x0E4A,0x0E4B,0x0E4C,0x0E31,0x0E34,0x0E35,0x0E36,0x0E37,0x0E38,0x0E39,0x0E3A].includes(code)) {
            currentPosition += ctx.measureText(char).width + letterSpacing;
        } else {
            currentPosition += ctx.measureText(char).width;
        }
    });
}

function drawBattery(ctx, batteryLevel, powerSavingMode) {
    ctx.save();

    // พิกัดและขนาดที่ครอบทับรอยเดิมของรูปพื้นหลังอย่างพอดี
    const x = 524.0;
    const y = 26.5;
    const maxBarWidth = 37.5;
    const height = 21.0;
    const radius = 6.0;

    // 1. ดูดสีพื้นหลังบริเวณข้างก้อนแบต เพื่อนำมาลบขอบใสๆ ของภาพต้นฉบับและใช้เป็นสีตัวเลข
    let bgPixelColor = '#939da6';
    try {
        const pixel = ctx.getImageData(Math.floor(x - 6), Math.floor(y + height / 2), 1, 1).data;
        if (pixel[3] > 0) {
            bgPixelColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        }
    } catch (e) {}

    // ลบรอยกรอบแบตเตอรี่เดิมที่ติดมากับรูปพื้นหลังออกให้เกลี้ยง
    ctx.fillStyle = bgPixelColor;
    ctx.fillRect(x - 2, y - 2, maxBarWidth + 8, height + 4);

    // ฟังก์ชันช่วยวาดสี่เหลี่ยมขอบมน
    const drawRoundedRect = (rx, ry, rw, rh, rad) => {
        const r = Math.min(rad, rw / 2, rh / 2);
        ctx.beginPath();
        ctx.moveTo(rx + r, ry);
        ctx.lineTo(rx + rw - r, ry);
        ctx.arcTo(rx + rw, ry, rx + rw, ry + r, r);
        ctx.lineTo(rx + rw, ry + rh - r);
        ctx.arcTo(rx + rw, ry + rh, rx + rw - r, ry + rh, r);
        ctx.lineTo(rx + r, ry + rh);
        ctx.arcTo(rx, ry + rh, rx, ry + rh - r, r);
        ctx.lineTo(rx, ry + r);
        ctx.arcTo(rx, ry, rx + r, ry, r);
        ctx.closePath();
        ctx.fill();
    };

    // 2. วาดฐานก้อนแบตเตอรี่ทั้งหมด (สีขาวโปร่งแสงตามสไตล์ iOS เวลาแบตลดจะเห็นฐานนี้)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    drawRoundedRect(x, y, maxBarWidth, height, radius);

    // วาดขั้วแบตเตอรี่เล็กๆ ด้านขวาสุด
    ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
    ctx.beginPath();
    ctx.arc(x + maxBarWidth + 2.2, y + (height / 2), 2.3, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // 3. วาดแถบปริมาณแบตเตอรี่ตาม %
    let batteryColor = '#ffffff';
    if (batteryLevel <= 20) {
        batteryColor = '#ff3b30'; // สีแดง iOS
    } else if (powerSavingMode) {
        batteryColor = '#ffcc00'; // สีเหลืองโหมดประหยัดพลังงาน iOS
    }

    const fillWidth = Math.max(4, (batteryLevel / 100) * maxBarWidth);
    ctx.fillStyle = batteryColor;
    drawRoundedRect(x, y, fillWidth, height, radius);

    // 4. วาดตัวเลข % แบตเตอรี่ตรงกลางก้อนแบต
    ctx.font = '800 15.5px "SFThonburiBold", sans-serif';
    if (batteryLevel <= 20) {
        ctx.fillStyle = '#ffffff';
    } else if (powerSavingMode) {
        ctx.fillStyle = '#1c1c1e';
    } else {
        // ใช้สีพื้นหลังจริงผสมความเข้มนิดหน่อย เพื่อให้ดูเหมือนตัวเลขเจาะทะลุเห็นพื้นหลัง
        ctx.fillStyle = '#5c6670';
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${batteryLevel}`, x + (maxBarWidth / 2), y + (height / 2) + 0.5);

    ctx.restore();
}

window.togglePowerSavingMode = function() {
    powerSavingMode = !powerSavingMode;
    const powerSavingButton = document.getElementById('powerSavingMode');
    if(powerSavingButton) powerSavingButton.classList.toggle('active', powerSavingMode);
    updateDisplay();
}

window.updateBatteryDisplay = function() {
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const bl = document.getElementById('battery-level');
    if(bl) bl.innerText = batteryLevel;
}

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'slip_gsb2.png';
    link.click();
}

const genBtn = document.getElementById('generate');
if(genBtn) {
    genBtn.addEventListener('click', updateDisplay);
}

function drawImage(ctx, imageUrl, x, y, width, height) {
    const image = new Image();
    image.src = imageUrl;
    image.onload = function() {
        ctx.drawImage(image, x, y, width, height);
    };
}