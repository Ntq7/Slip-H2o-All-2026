(function() {
    const fontPath = 'assets/fonts';
    let fontsLoaded = false;
    async function loadFonts() {
        const fonts = [
            new FontFace('SukhumvitSetSemiBold', `url(${fontPath}/SukhumvitSet-SemiBold.woff)`),
            new FontFace('SukhumvitSetExtraBold', `url(${fontPath}/SukhumvitSet-Extra%20Bold.woff)`),
            new FontFace('BangkokTime2', `url(${fontPath}/Bangkok-Time2.woff)`),
            new FontFace('BangkokMoneyMedium', `url(${fontPath}/Bangkok-Money-Medium.woff)`),
            new FontFace('CoreSansBold', `url(${fontPath}/Core-Sans-N-65-Bold.woff)`)
        ];

        return Promise.all(fonts.map(font => font.load().catch(e => console.warn('Font load error:', e)))).then(function(loadedFonts) {
            loadedFonts.forEach(function(font) {
                if (font) document.fonts.add(font);
            });
        });
    }

    function ensureFontsLoaded() {
        if (fontsLoaded) return Promise.resolve();
        return loadFonts().then(() => { fontsLoaded = true; });
    }
    function padZero(number) {
        return number < 10 ? '0' + number : number;
    }

    function formatDate(date) {
        if (!date || date === '-') return '-';
        const options = { day: 'numeric', month: 'short', year: '2-digit' };
        let formattedDate = new Date(date).toLocaleDateString('th-TH', options);
        formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const parts = formattedDate.split(' ');
        if (parts.length < 3) return formattedDate;
        const day = padZero(parts[0]);
        const month = months[new Date(date).getMonth()];
        const year = parts[2];
        return `${day} ${month} ${year}`;
    }

    function generateUniqueID() {
        const now = new Date(document.getElementById('datetime-input')?.value || new Date());
        const year = now.getFullYear().toString();
        const month = padZero(now.getMonth() + 1);
        const day = padZero(now.getDate());
        const hours = padZero(now.getHours());
        const minutes = padZero(now.getMinutes());
        const seconds = padZero(now.getSeconds());
        const randomNumber = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');
        return `${year}${month}${day}${hours}${minutes}${seconds}${randomNumber}`;
    }

    function generateRandomNumber() {
        return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    }

    function getInputValue(id, fallback = '') {
        const el = document.getElementById(id);
        return el && el.value ? el.value : fallback;
    }

    function loadImage(src) {
        return new Promise((resolve) => {
            if (!src) { resolve(null); return; }
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.shadowColor = shadowColor || 'transparent';
        ctx.shadowBlur = shadowBlur || 0;

        const paragraphs = text.split('<br>');
        let currentY = y;

        paragraphs.forEach(paragraph => {
            const lines = [];
            let currentLine = '';

            for (let i = 0; i < paragraph.length; i++) {
                const char = paragraph[i];
                const testLine = currentLine + char;
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

                if (testWidth > maxWidth) {
                    lines.push(currentLine.trim());
                    currentLine = char;
                } else {
                    currentLine = testLine;
                }
            }

            lines.push(currentLine.trim());

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

        characters.forEach((char, index) => {
            const charCode = char.charCodeAt(0);
            const prevChar = index > 0 ? characters[index - 1] : null;

            const isUpperVowel = (charCode >= 0x0E34 && charCode <= 0x0E37);
            const isToneMark = (charCode >= 0x0E48 && charCode <= 0x0E4C);
            const isBeforeVowel = (charCode === 0x0E31);
            const isBelowVowel = (charCode >= 0x0E38 && charCode <= 0x0E3A);

            let yOffset = 0;
            let xOffset = 0;

            if (isUpperVowel) { yOffset = -1; xOffset = 0; }
            if (isToneMark) {
                if (prevChar && ((prevChar.charCodeAt(0) >= 0x0E34 && prevChar.charCodeAt(0) <= 0x0E37) || prevChar.charCodeAt(0) === 0x0E31)) {
                    yOffset = -8; xOffset = 0;
                } else {
                    yOffset = 0; xOffset = -7;
                }
            }
            if (isBeforeVowel) { yOffset = -1; xOffset = 1; }
            if (isBelowVowel) { yOffset = 0; xOffset = -10; }

            ctx.fillText(char, currentPosition + xOffset, y + yOffset);

            if (!isToneMark && !isBeforeVowel && !isBelowVowel) {
                currentPosition += ctx.measureText(char).width + letterSpacing;
            } else {
                currentPosition += ctx.measureText(char).width;
            }
        });
    }

    async function renderSlipDisplay() {
        const sendername = getInputValue('sendername', '-');
        const senderaccount = getInputValue('senderaccount', '-');
        const receivername = getInputValue('receivername', '-');
        const receiveraccount = getInputValue('receiveraccount', '-');
        const bank = getInputValue('bank', '-');
        const amount11 = getInputValue('amount11', '-');
        
        const datetimeVal = document.getElementById('datetime-input')?.value || document.getElementById('datetime')?.value || '-';
        const datetime = datetimeVal;
        
        const QRCode = getInputValue('QRCode', '');
        const AideMemoire = getInputValue('AideMemoire', '');

        const noteToggleElem = document.getElementById('modeSwitch');
        const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;

        let selectedImage = getInputValue('imageSelect', '');

        let bankLogoUrl = '';
        switch (bank) {
            case 'ธนาคารกสิกรไทย': bankLogoUrl = 'assets/image/logo/KBANK.png'; break;
            case 'ธนาคารกรุงไทย': bankLogoUrl = 'assets/image/logo/KTB2.png'; break;
            case 'ธนาคารกรุงเทพ': bankLogoUrl = 'assets/image/logo/BBL2.png'; break;
            case 'ธนาคารไทยพาณิชย์': bankLogoUrl = 'assets/image/logo/SCB.png'; break;
            case 'ธนาคารกรุงศรีอยุธยา': bankLogoUrl = 'assets/image/logo/BAY1.png'; break;
            case 'ธนาคารทหารไทยธนชาต': bankLogoUrl = 'assets/image/logo/TTB.png'; break;
            case 'ธนาคารออมสิน': bankLogoUrl = 'assets/image/logo/O2.png'; break;
            case 'ธนาคารเพื่อการเกษตรและ': bankLogoUrl = 'assets/image/logo/T.png'; break;
            case 'ธนาคารอาคารสงเคราะห์': bankLogoUrl = 'assets/image/logo/C1.png'; break;
            case 'ธนาคารเกียรตินาคินภัทร': bankLogoUrl = 'assets/image/logo/K.png'; break;
            case 'ธนาคารซีไอเอ็มบี': bankLogoUrl = 'assets/image/logo/CIMB.png'; break;
            case 'ธนาคารยูโอบี': bankLogoUrl = 'assets/image/logo/UOB1.png'; break;
            case 'ธนาคารแลนด์ แอนด์ เฮ้าส์': bankLogoUrl = 'assets/image/logo/LHBANK.png'; break;
            case 'ธนาคารไอซีบีซี': bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
            case 'พร้อมเพย์': bankLogoUrl = 'assets/image/logo/P-Bangkok.png'; break;
            case 'พร้อมเพย์ e-Wallet TrueMoney': bankLogoUrl = 'assets/image/logo/P-Bangkok.png'; break;
            case 'พร้อมเพย์ e-Wallet Jaew': bankLogoUrl = 'assets/image/logo/P-Bangkok.png'; break;
            case 'พร้อมเพย์ e-Wallet K Plus Wallet': bankLogoUrl = 'assets/image/logo/P-Bangkok.png'; break;
            case 'MetaAds': bankLogoUrl = 'assets/image/logo/Meta2.png'; break;
            default: bankLogoUrl = '';
        }

        let baseBg = isNoteMode 
            ? (document.getElementById('bg_note')?.value || 'assets/image/bs/B1T.jpg') 
            : (document.getElementById('backgroundSelect')?.value || 'assets/image/bs/B1.jpg');
        
        const isNewTheme = baseBg.includes('2'); 

        let backgroundImageSrc = '';
        const themeNumber = isNewTheme ? '2' : '1';
        const noteSuffix = isNoteMode ? 'T' : '';

        if (bank === 'พร้อมเพย์ e-Wallet TrueMoney' || bank === 'พร้อมเพย์ e-Wallet Jaew' || bank === 'พร้อมเพย์ e-Wallet K Plus Wallet') {
            backgroundImageSrc = `assets/image/bs/BB${themeNumber}${noteSuffix}.jpg`;
        } else if (bank === 'MetaAds') {
            backgroundImageSrc = `assets/image/bs/BBB${themeNumber}${noteSuffix}.jpg`;
        } else {
            backgroundImageSrc = `assets/image/bs/B${themeNumber}${noteSuffix}.jpg`;
        }

        let coords = {};

        // =========================================================================
        // 🟢🟢 โซนแก้ไขพิกัด : ธีมใหม่ (B2) แยกละเอียดยิบทุกประเภทบัญชี 🟢🟢
        // =========================================================================
        if (isNewTheme) {
            if (isNoteMode) {
                // 📝 1. ธีมใหม่ + โหมดมีบันทึกช่วยจำ (Note Mode)
                coords = {
                    canvasW_normal: 572, canvasH_normal: 1315, 
                    canvasW_ewallet: 572, canvasH_ewallet: 1375,

                    // 🔵 ก. พิกัดสำหรับโอน "ธนาคารปกติ" 🔵
                    norm_logoMainX: -100, norm_logoMainY: -100, norm_logoMainSize: 0, 
                    norm_logoSenderX: 151.5, norm_logoSenderY: 673, norm_logoSenderSize: 40,
                    norm_logoBankX: 151.5, norm_logoBankY: 795, norm_logoBankSize: 40,
                    norm_dateX: 285, norm_dateY: 500, norm_dateSize: 21, norm_dateSpace: -0.50,
                    norm_amountY: 613, norm_amountSize: 34.94, norm_unitSize: 20.50,
                    norm_senderX: 210.5, norm_senderNameY: 700, norm_senderNameSize: 23.3, norm_senderAccY: 730, norm_senderAccSize: 22.5, norm_senderBankY: 760, norm_senderBankSize: 22.0,
                    norm_receiverX: 210.5, norm_recNameY: 823, norm_recBankY: 883, norm_recAccY: 853,
                    norm_noteX: 165.5, norm_noteY: 1040,
                    norm_randX: 56.5, norm_randY: 1184, norm_uniqX: 56.5, norm_uniqY: 1244.5,
                    norm_qrTextX: 238.9, norm_qrTextY: 1400, norm_qrSize: 33,

                    // 🟣 ข. พิกัดสำหรับโอน "พร้อมเพย์ / วอลเล็ท" 🟣
                    ewallet_logoMainX: -100, ewallet_logoMainY: -100, ewallet_logoMainSize: 0,
                    ewallet_logoSenderX: 151.5, ewallet_logoSenderY: 642, ewallet_logoSenderSize: 40,
                    ewallet_logoBankX: 151.5, ewallet_logoBankY: 758, ewallet_logoBankSize: 40,
                    ewallet_dateX: 285, ewallet_dateY: 480, ewallet_dateSize: 21, ewallet_dateSpace: -0.50,
                    ewallet_amountY: 586, ewallet_amountSize: 34.94, ewallet_unitSize: 20.50,
                    ewallet_senderX: 210.5, ewallet_senderNameY: 666.6, ewallet_senderNameSize: 23.3, ewallet_senderAccY: 698.6, ewallet_senderAccSize: 22.5, ewallet_senderBankY: 730.6, ewallet_senderBankSize: 22.0,
                    ewallet_receiverX: 210.5, ewallet_recNameY: 784.5, ewallet_recBankY: 846, ewallet_recAccY: 913,
                    ewallet_noteX: 159.3, ewallet_noteY: 1054.5,
                    ewallet_randX: 43.5, ewallet_randY: 1187, ewallet_uniqX: 43.5, ewallet_uniqY: 1246,
                    ewallet_qrTextX: 238.9, ewallet_qrTextY: 1400, ewallet_qrSize: 33,

                    // 🟢 ค. พิกัดสำหรับโอนจ่าย "MetaAds" 🟢
                    meta_logoMainX: -100, meta_logoMainY: -100, meta_logoMainSize: 0,
                    meta_logoSenderX: 151.5, meta_logoSenderY: 615, meta_logoSenderSize: 40,
                    meta_logoBankX: 151.5, meta_logoBankY: 728, meta_logoBankSize: 40,
                    meta_dateX: 285, meta_dateY: 456, meta_dateSize: 21, meta_dateSpace: -0.50,
                    meta_amountY: 556, meta_amountSize: 34.94, meta_unitSize: 20.50,
                    meta_senderX: 210.5, meta_senderNameY: 638, meta_senderNameSize: 23.3, meta_senderAccY: 668, meta_senderAccSize: 22.5, meta_senderBankY: 700, meta_senderBankSize: 22.0,
                    meta_receiverX: 211, meta_recNameY: 753, meta_recBankY: 783, meta_recAccY1: 845, meta_recAccY2: 900,
                    meta_noteX: 159.3, meta_noteY: 1050,
                    meta_randX: 44.5, meta_randY: 1180, meta_uniqX: 44.5, meta_uniqY: 1239,
                    meta_qrTextX: 238.9, meta_qrTextY: 1400, meta_qrSize: 33
                };
                if (selectedImage && selectedImage.includes('StickerslipBBL')) {
                    selectedImage = selectedImage.replace(/StickerslipBBL(\d+)\.png/, (match, p1) => { return `StickerslipBBL${parseInt(p1) + 10}.png`; });
                }

            } else {
                // 📄 2. ธีมใหม่ + โหมดปกติ (Normal Mode)
                coords = {
                    canvasW_normal: 607, canvasH_normal: 1315, 
                    canvasW_ewallet: 607, canvasH_ewallet: 1375,

                    // 🔵 ก. พิกัดสำหรับโอน "ธนาคารปกติ" 🔵
                    norm_logoMainX: -100, norm_logoMainY: -100, norm_logoMainSize: 0, 
                    norm_logoSenderX: 160.5, norm_logoSenderY: 700, norm_logoSenderSize: 40,
                    norm_logoBankX: 160.5, norm_logoBankY: 830, norm_logoBankSize: 40,
                    norm_dateX: 303.5, norm_dateY: 524, norm_dateSize: 21, norm_dateSpace: -0.5,
                    norm_amountY: 635, norm_amountSize: 36, norm_unitSize: 21,
                    norm_senderX: 224.1, norm_senderNameY: 730, norm_senderNameSize: 24, norm_senderAccY: 761, norm_senderAccSize: 23.5, norm_senderBankY: 791, norm_senderBankSize: 23.0,
                    norm_receiverX: 224.1, norm_recNameY: 860, norm_recBankY: 921, norm_recAccY: 891,
                    norm_noteX: 159.3, norm_noteY: 0,
                    norm_randX: 47, norm_randY: 1166, norm_uniqX: 47, norm_uniqY: 1238,
                    norm_qrTextX: 238.9, norm_qrTextY: 1400, norm_qrSize: 33,

                    // 🟣 ข. พิกัดสำหรับโอน "พร้อมเพย์ / วอลเล็ท" 🔵
                    ewallet_logoMainX: -100, ewallet_logoMainY: -100, ewallet_logoMainSize: 0,
                    ewallet_logoSenderX: 160.5, ewallet_logoSenderY: 663, ewallet_logoSenderSize: 40,
                    ewallet_logoBankX: 160.5, ewallet_logoBankY: 786, ewallet_logoBankSize: 40,
                    ewallet_dateX: 303.5, ewallet_dateY: 490, ewallet_dateSize: 21, ewallet_dateSpace: -0.5,
                    ewallet_amountY: 600, ewallet_amountSize: 36, ewallet_unitSize: 21,
                    ewallet_senderX: 224.1, ewallet_senderNameY: 687.5, ewallet_senderNameSize: 24, ewallet_senderAccY: 720, ewallet_senderAccSize: 23.5, ewallet_senderBankY: 752, ewallet_senderBankSize: 23.0,
                    ewallet_receiverX: 224.1, ewallet_recNameY: 812.5, ewallet_recBankY: 877, ewallet_recAccY: 951,
                    ewallet_noteX: 159.3, ewallet_noteY: 0,
                    ewallet_randX: 47, ewallet_randY: 1180, ewallet_uniqX: 47, ewallet_uniqY: 1240,
                    ewallet_qrTextX: 238.9, ewallet_qrTextY: 1400, ewallet_qrSize: 33,

                    // 🟢 ค. พิกัดสำหรับโอนจ่าย "MetaAds" 🟢
                    meta_logoMainX: -100, meta_logoMainY: -100, meta_logoMainSize: 0,
                    meta_logoSenderX: 160.5, meta_logoSenderY: 641, meta_logoSenderSize: 40,
                    meta_logoBankX: 160.5, meta_logoBankY: 761.5, meta_logoBankSize: 40,
                    meta_dateX: 303.5, meta_dateY: 480, meta_dateSize: 21, meta_dateSpace: -0.5,
                    meta_amountY: 582, meta_amountSize: 36, meta_unitSize: 21,
                    meta_senderX: 224.1, meta_senderNameY: 665.5, meta_senderNameSize: 24, meta_senderAccY: 697.5, meta_senderAccSize: 23.5, meta_senderBankY: 729.5, meta_senderBankSize: 23.0,
                    meta_receiverX: 224.1, meta_recNameY: 788, meta_recBankY: 817, meta_recAccY1: 880, meta_recAccY2: 936,
                    meta_noteX: 159.3, meta_noteY: 0,
                    meta_randX: 47, meta_randY: 1180, meta_uniqX: 47, meta_uniqY: 1240,
                    meta_qrTextX: 238.9, meta_qrTextY: 1400, meta_qrSize: 33
                };
            }
        } else {
            // =========================================================================
            // 🟡🟡 โซนพิกัดธีมเก่า (คงพิกัดเดิมของคุณไว้ 100%) 🟡🟡
            // =========================================================================
            if (isNoteMode) {
                coords = {
                    canvasW_normal: 572, canvasH_normal: 1200, 
                    canvasW_ewallet: 572, canvasH_ewallet: 1262,
                    logoMainX: 151.5, logoMainY: 503.0, logoMainSize: 39,
                    logoBankX: 151.5, logoBankSize: 39,
                    logoSenderX: 0, logoSenderSize: 0, 
                    dateX: 285, dateSize: 22.50, dateSpace: -0.50,
                    senderX: 210.5, senderNameSize: 23.3, senderBankSize: 22.0, senderAccSize: 22.5,
                    receiverX: 210.5, amountSize: 34.94, unitSize: 20.50,
                    qrTextX: 238.9, qrTextY: 599.0, qrSize: 33, randX: 44.8, uniqX: 44.8, noteX: 159.3,

                    // พิกัดธนาคารปกติ
                    norm_dateY: 333.8, norm_amountY: 433.3,
                    norm_logoSenderY: 0, norm_logoBankY: 625.5,
                    norm_senderNameY: 528.0, norm_senderAccY: 558.4, norm_senderBankY: 588.4,
                    norm_recNameY: 651.1, norm_recBankY: 712.0, norm_recAccY: 681.5,
                    norm_noteY: 865.3, norm_randY: 1004, norm_uniqY: 1064.5,

                    // พิกัดพร้อมเพย์
                    ewallet_dateY: 333.8, ewallet_amountY: 433.3,
                    ewallet_logoSenderY: 0, ewallet_logoBankY: 625.5,
                    ewallet_senderNameY: 528.0, ewallet_senderAccY: 558.4, ewallet_senderBankY: 588.4,
                    ewallet_recNameY: 651.1, ewallet_recBankY: 710.3, ewallet_recAccY: 778.5,
                    ewallet_noteY: 928.5, ewallet_randY: 1066, ewallet_uniqY: 1126,

                    // พิกัด MetaAds
                    meta_dateY: 333.8, meta_amountY: 433.3,
                    meta_logoSenderY: 0, meta_logoBankY: 625.5,
                    meta_senderNameY: 528.0, meta_senderAccY: 558.4, meta_senderBankY: 588.4,
                    meta_recNameY: 651.1, meta_recBankY: 681, meta_recAccY1: 742, meta_recAccY2: 802,
                    meta_noteY: 964, meta_randY: 1100, meta_uniqY: 1162
                };
                if (selectedImage && selectedImage.includes('StickerslipBBL')) {
                    selectedImage = selectedImage.replace(/StickerslipBBL(\d+)\.png/, (match, p1) => { return `StickerslipBBL${parseInt(p1) + 10}.png`; });
                }
            } else {
                coords = {
                    canvasW_normal: 607, canvasH_normal: 1200,
                    canvasW_ewallet: 607, canvasH_ewallet: 1280,
                    logoMainX: 160.5, logoMainY: 531.5, logoMainSize: 43,
                    logoBankX: 160.5, logoBankSize: 43,
                    logoSenderX: 0, logoSenderSize: 0, 
                    dateX: 303, dateSize: 23.50, dateSpace: -1,
                    senderX: 224.1, senderNameSize: 24.3, senderBankSize: 23.0, senderAccSize: 23.5,
                    receiverX: 224.1, amountSize: 35.44, unitSize: 21.00,
                    qrTextX: 238.9, qrTextY: 599.0, qrSize: 33, randX: 47.2, uniqX: 47.2, noteX: 159.3,

                    // พิกัดธนาคารปกติ
                    norm_dateY: 353.1, norm_amountY: 460.0,
                    norm_logoSenderY: 0, norm_logoBankY: 664.0,
                    norm_senderNameY: 560.4, norm_senderAccY: 593.3, norm_senderBankY: 625.2,
                    norm_recNameY: 691.3, norm_recBankY: 756.3, norm_recAccY: 723.5,
                    norm_noteY: 0, norm_randY: 993, norm_uniqY: 1057,

                    // พิกัดพร้อมเพย์
                    ewallet_dateY: 353.1, ewallet_amountY: 460.0,
                    ewallet_logoSenderY: 0, ewallet_logoBankY: 664.0,
                    ewallet_senderNameY: 560.4, ewallet_senderAccY: 593.3, ewallet_senderBankY: 625.2,
                    ewallet_recNameY: 691.3, ewallet_recBankY: 756.3, ewallet_recAccY: 828.5,
                    ewallet_noteY: 0, ewallet_randY: 1073, ewallet_uniqY: 1135,

                    // พิกัด MetaAds
                    meta_dateY: 353.1, meta_amountY: 460.0,
                    meta_logoSenderY: 0, meta_logoBankY: 664.0,
                    meta_senderNameY: 560.4, meta_senderAccY: 593.3, meta_senderBankY: 625.2,
                    meta_recNameY: 691.3, meta_recBankY: 719, meta_recAccY1: 785, meta_recAccY2: 845,
                    meta_noteY: 0, meta_randY: 1107, meta_uniqY: 1173
                };
            }
        }

        const formattedDate = formatDate(datetime);
        let formattedTime = '';
        if (datetime && datetime !== '-') {
            const d = new Date(datetime);
            if (!isNaN(d.getTime())) formattedTime = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        }

        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const [bgImg, bankLogoImg, customStickerImg, mainLogoImg] = await Promise.all([
            loadImage(backgroundImageSrc),
            loadImage(bankLogoUrl),
            loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null),
            loadImage('assets/image/logo/BBL2.png') 
        ]);

        if (isNewTheme) {
            canvas.width = coords.canvasW_normal;
            canvas.height = coords.canvasH_normal;
        } else {
            if (bank === 'พร้อมเพย์ e-Wallet TrueMoney' || bank === 'พร้อมเพย์ e-Wallet Jaew' || bank === 'พร้อมเพย์ e-Wallet K Plus Wallet' || bank === 'MetaAds') {
                canvas.width = coords.canvasW_ewallet;
                canvas.height = coords.canvasH_ewallet;
            } else {
                canvas.width = coords.canvasW_normal;
                canvas.height = coords.canvasH_normal;
            }
        }

        if (bgImg) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4d4f'; ctx.font = '20px SukhumvitSetExtraBold';
            ctx.fillText(`❌ หาไฟล์ ${backgroundImageSrc.split('/').pop()} ไม่เจอ!`, 50, canvas.height / 2);
        }

        // ========================================================
        // 🟢 ระบบดึงตัวแปรมาวาดแบบอัตโนมัติ (ไม่ต้องไปแก้ตรงนี้)
        // ========================================================
        let pfx = '';
        if (bank === 'พร้อมเพย์ e-Wallet TrueMoney' || bank === 'พร้อมเพย์ e-Wallet Jaew' || bank === 'พร้อมเพย์ e-Wallet K Plus Wallet') {
            pfx = 'ewallet_';
        } else if (bank === 'MetaAds') {
            pfx = 'meta_';
        } else {
            pfx = 'norm_';
        }

        // ฟังก์ชันช่วยดึงค่าตัวแปรตามหมวดหมู่
        const getCoord = (key) => coords[pfx + key] !== undefined ? coords[pfx + key] : coords[key];

        // ดึงพิกัดตามหมวดหมู่มาใส่ตัวแปร
        const c_logoMainX = getCoord('logoMainX');
        const c_logoMainY = getCoord('logoMainY');
        const c_logoMainSize = getCoord('logoMainSize');
        
        const c_logoSenderX = getCoord('logoSenderX');
        const c_logoSenderY = getCoord('logoSenderY');
        const c_logoSenderSize = getCoord('logoSenderSize');
        
        const c_logoBankX = getCoord('logoBankX');
        const c_logoBankY = getCoord('logoBankY');
        const c_logoBankSize = getCoord('logoBankSize');
        
        const c_dateX = getCoord('dateX');
        const c_dateY = getCoord('dateY');
        const c_dateSize = getCoord('dateSize');
        const c_dateSpace = getCoord('dateSpace');

        const c_amountY = getCoord('amountY');
        const c_amountSize = getCoord('amountSize');
        const c_unitSize = getCoord('unitSize');

        const c_senderX = getCoord('senderX');
        const c_senderNameY = getCoord('senderNameY');
        const c_senderNameSize = getCoord('senderNameSize');
        const c_senderAccY = getCoord('senderAccY');
        const c_senderAccSize = getCoord('senderAccSize');
        const c_senderBankY = getCoord('senderBankY');
        const c_senderBankSize = getCoord('senderBankSize');

        const c_receiverX = getCoord('receiverX');
        const c_recNameY = getCoord('recNameY');
        const c_recBankY = getCoord('recBankY');
        const c_recAccY = getCoord('recAccY');
        
        const c_noteX = getCoord('noteX');
        const c_noteY = getCoord('noteY');
        const c_randX = getCoord('randX');
        const c_randY = getCoord('randY');
        const c_uniqX = getCoord('uniqX');
        const c_uniqY = getCoord('uniqY');
        
        const c_qrTextX = getCoord('qrTextX');
        const c_qrTextY = getCoord('qrTextY');
        const c_qrSize = getCoord('qrSize');

        // วาดโลโก้ธนาคารผู้รับ
        if (bankLogoImg) {
            ctx.drawImage(bankLogoImg, c_logoBankX, c_logoBankY, c_logoBankSize, c_logoBankSize);
        }

        // วาดโลโก้ธนาคารผู้โอน (ถ้ามีตั้งค่าไว้)
        if (mainLogoImg && c_logoSenderSize > 0) {
            ctx.drawImage(mainLogoImg, c_logoSenderX, c_logoSenderY, c_logoSenderSize, c_logoSenderSize);
        }

        // วาดวันที่
        drawText(ctx, `${formattedDate}, ${formattedTime}`, c_dateX, c_dateY, c_dateSize, 'BangkokTime2', '#8a8a8a', 'center', 1.5, 3, 0, 0, 800, c_dateSpace);

        // วาดชื่อผู้โอน
        drawText(ctx, `${sendername}`, c_senderX, c_senderNameY, c_senderNameSize, 'SukhumvitSetExtraBold', '#101011', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `ธนาคารกรุงเทพ`, c_senderX, c_senderBankY, c_senderBankSize, 'SukhumvitSetSemiBold', '#101011', 'left', 1.5, 2, 0, 0, 500, 0);
        drawText(ctx, `${senderaccount}`, c_senderX, c_senderAccY, c_senderAccSize, 'CoreSansBold', '#101011', 'left', 1.5, 1, 0, 0, 500, 0);

        // วาดส่วนของผู้รับตามประเภทธนาคาร
        if (bank === 'พร้อมเพย์ e-Wallet TrueMoney' || bank === 'พร้อมเพย์ e-Wallet Jaew' || bank === 'พร้อมเพย์ e-Wallet K Plus Wallet') {
            drawText(ctx, `${receivername}<br>เติมเงินพร้อมเพย์ / G-Wallet`, c_receiverX, c_recNameY, c_senderNameSize, 'SukhumvitSetExtraBold', '#101011', 'left', (isNoteMode ? 31 : 34), 3, 0, 0, 800, 0);
            
            if (bank === 'พร้อมเพย์ e-Wallet TrueMoney') {
                drawText(ctx, `ทรูมันนี่`, c_receiverX, c_recBankY, 19, 'SukhumvitSetSemiBold', '#9d9da5', 'left', 1.5, 3, 0, 0, 800, 0);
            } else if (bank === 'พร้อมเพย์ e-Wallet K Plus Wallet') {
                drawText(ctx, `K Plus Wallet`, c_receiverX, c_recBankY, 19, 'SukhumvitSetSemiBold', '#9d9da5', 'left', 1.5, 3, 0, 0, 800, 0);
            } else if (bank === 'พร้อมเพย์ e-Wallet Jaew') {
                drawText(ctx, ``, c_receiverX, c_recBankY, 19, 'SukhumvitSetSemiBold', '#9d9da5', 'left', 1.5, 3, 0, 0, 800, 0);
            }

            drawText(ctx, `${receiveraccount}`, c_receiverX, c_recAccY, c_senderAccSize, 'BangkokTime2', '#101011', 'left', 1.5, 1, 0, 0, 500, 0);
            
            if (isNoteMode) drawText(ctx, `${AideMemoire}`, c_noteX, c_noteY, 18.10, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `${generateRandomNumber()}`, c_randX, c_randY, isNoteMode ? 19.80 : 20.63, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, -1);
            drawText(ctx, `${generateUniqueID()}`, c_uniqX, c_uniqY, isNoteMode ? 19.80 : 20.63, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, -1);

        } else if (bank === 'MetaAds') {
            const c_recAccY1 = getCoord('recAccY1');
            const c_recAccY2 = getCoord('recAccY2');

            drawText(ctx, `META ADS (KGP)`, c_receiverX, c_recNameY, c_senderNameSize, 'SukhumvitSetExtraBold', '#101011', 'left', (isNoteMode ? 31 : 34), 3, 0, 0, 800, 0);
            drawText(ctx, `Biller ID:${receivername}`, c_receiverX, c_recBankY, isNoteMode ? 21 : 20, 'SukhumvitSetMedium', '#9d9da5', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${receiveraccount}`, c_receiverX, c_recAccY1, c_senderAccSize, 'BangkokTime2', '#101011', 'left', 1.5, 1, 0, 0, 500, 0);
            drawText(ctx, `${receiveraccount}`, c_receiverX, c_recAccY2, c_senderAccSize, 'BangkokTime2', '#101011', 'left', 1.5, 1, 0, 0, 500, 0);

            if (isNoteMode) drawText(ctx, `${AideMemoire}`, c_noteX, c_noteY, 18.10, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `${generateRandomNumber()}`, c_randX, c_randY, isNoteMode ? 19.80 : 20.63, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, -1);
            drawText(ctx, `${generateUniqueID()}`, c_uniqX, c_uniqY, isNoteMode ? 19.80 : 20.63, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, -1);

        } else {
            drawText(ctx, `${receivername}`, c_receiverX, c_recNameY, c_senderNameSize, 'SukhumvitSetExtraBold', '#101011', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${bank}`, c_receiverX, c_recBankY, c_senderBankSize, 'SukhumvitSetSemiBold', '#101011', 'left', 1.5, 2, 0, 0, 500, 0);
            drawText(ctx, `${receiveraccount}`, c_receiverX, c_recAccY, c_senderAccSize, 'CoreSansBold', '#101011', 'left', 1.5, 1, 0, 0, 500, 0);
            
            if (isNoteMode) drawText(ctx, `${AideMemoire}`, c_noteX, c_noteY, 18.10, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `${generateRandomNumber()}`, c_randX, c_randY, isNoteMode ? 19.80 : 20.63, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, -1);
            drawText(ctx, `${generateUniqueID()}`, c_uniqX, c_uniqY, isNoteMode ? 19.80 : 20.63, 'BangkokTime2', '#101011', 'left', 1.5, 3, 0, 0, 500, -1);
        }

        // วาดจำนวนเงิน
        const amountText = `${amount11}`;
        const amountUnit = 'THB';
        const totalText = amountText + ' ' + amountUnit;
        const centerX = canvas.width / 2;
        // สูตรคำนวณแกน X ของจำนวนเงิน
        const amountX = centerX - (ctx.measureText(totalText).width / 1.30);
        
        drawText(ctx, amountText, amountX, c_amountY, c_amountSize, 'BangkokMoneyMedium', '#232121', 'left', 1.5, 3, 0, 0, 500, -1);
        const amountWidth = ctx.measureText(amountText).width;
        drawText(ctx, amountUnit, amountX + amountWidth + (isNoteMode ? -1 : 1), c_amountY, c_unitSize, 'BangkokMoneyMedium', '#232121', 'left', 1.5, 3, 0, 0, 500, 0);
        
        // วาด QR
        drawText(ctx, `${QRCode}`, c_qrTextX, c_qrTextY, c_qrSize, 'SukhumvitSetSemiBold', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
        
        // วาดโลโก้หลักด้านบนสุด (เฉพาะธีมเก่า)
        if (mainLogoImg && c_logoMainSize > 0) {
            ctx.drawImage(mainLogoImg, c_logoMainX, c_logoMainY, c_logoMainSize, c_logoMainSize);  
        }
        
        if (customStickerImg) {
            ctx.drawImage(customStickerImg, 0, 0, canvas.width, canvas.height);
        }
    }

    window.updateDisplayStandard = function() {
        ensureFontsLoaded().then(() => { renderSlipDisplay(); }).catch(() => { renderSlipDisplay(); });
    };

    window.updateDisplayNote = function() {
        ensureFontsLoaded().then(() => { renderSlipDisplay(); }).catch(() => { renderSlipDisplay(); });
    };

    window.downloadImage = function() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'slip_bbl.png';
        link.click();
    };

})();