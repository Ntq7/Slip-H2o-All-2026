(function() {
    const fontPath = 'assets/fonts';
    let fontsLoaded = false;

    // ==========================================
    // 1. ระบบโหลดฟอนต์ทั้งหมด
    // ==========================================
    async function loadFonts() {
        const fonts = [
            new FontFace('SukhumvitSetThin', `url(${fontPath}/SukhumvitSet-Thin.woff)`),
            new FontFace('SukhumvitSetText', `url(${fontPath}/SukhumvitSet-Text.woff)`),
            new FontFace('SukhumvitSetLight', `url(${fontPath}/SukhumvitSet-Light.woff)`),
            new FontFace('SukhumvitSetMedium', `url(${fontPath}/SukhumvitSet-Medium.woff)`),
            new FontFace('SukhumvitSetSemiBold', `url(${fontPath}/SukhumvitSet-SemiBold.woff)`),
            new FontFace('SukhumvitSetBold', `url(${fontPath}/SukhumvitSet-Bold.woff)`),
            new FontFace('SukhumvitSetExtraBold', `url(${fontPath}/SukhumvitSet-Extra%20Bold.woff)`),
            new FontFace('SFThonburiLight', `url(${fontPath}/SFThonburi.woff)`),
            new FontFace('SFThonburiRegular', `url(${fontPath}/SFThonburi-Regular.woff)`),
            new FontFace('SFThonburiSemiBold', `url(${fontPath}/SFThonburi-Semibold.woff)`),
            new FontFace('SFThonburiBold', `url(${fontPath}/SFThonburi-Bold.woff)`),
            new FontFace('KanitThin', `url(${fontPath}/Kanit-Thin.woff)`),
            new FontFace('KanitExtraLight', `url(${fontPath}/Kanit-ExtraLight.woff)`),
            new FontFace('KanitLight', `url(${fontPath}/Kanit-Light.woff)`),
            new FontFace('KanitRegular', `url(${fontPath}/Kanit-Regular.woff)`),
            new FontFace('KanitMedium', `url(${fontPath}/Kanit-Medium.woff)`),
            new FontFace('KanitSemiBold', `url(${fontPath}/Kanit-SemiBold.woff)`),
            new FontFace('KanitBold', `url(${fontPath}/Kanit-Bold.woff)`),
            new FontFace('KanitExtraBold', `url(${fontPath}/Kanit-ExtraBold.woff)`),
            new FontFace('KanitBlack', `url(${fontPath}/Kanit-Black.woff)`),
            new FontFace('BangkokTime1', `url(${fontPath}/Bangkok-Time1.woff)`),
            new FontFace('BangkokTime2', `url(${fontPath}/Bangkok-Time2.woff)`),
            new FontFace('BangkokMoney', `url(${fontPath}/Bangkok-Money.woff)`),
            new FontFace('BangkokTime', `url(${fontPath}/Bangkok-Time.woff)`),
            new FontFace('BangkokMoneyRegular', `url(${fontPath}/Bangkok-Money-Regular.woff)`),
            new FontFace('BangkokMoneyMedium', `url(${fontPath}/Bangkok-Money-Medium.woff)`),
            new FontFace('BangkokMoneySemiBold', `url(${fontPath}/Bangkok-Money-SemiBold.woff)`),
            new FontFace('BangkokMoneyBold', `url(${fontPath}/Bangkok-Money-Bold.woff)`),
            new FontFace('TTBMoneyRegular', `url(${fontPath}/TTB-Money-Regular.woff)`),
            new FontFace('TTBMoneyMedium', `url(${fontPath}/TTB-Money-Medium.woff)`),
            new FontFace('TTBMoneySemiBold', `url(${fontPath}/TTB-Money-SemiBold.woff)`),
            new FontFace('TTBMoneyBold', `url(${fontPath}/TTB-Money-Bold.woff)`),
            new FontFace('TTBMoneyExtraBold', `url(${fontPath}/TTB-Money-ExtraBold.woff)`),
            new FontFace('krungsriRegular', `url(${fontPath}/krungsri_con-webfont.woff)`),
            new FontFace('krungsriMedium', `url(${fontPath}/krungsri_con_med-webfont.woff)`),
            new FontFace('krungsriBold', `url(${fontPath}/krungsri_con_bol-webfont.woff)`),
            new FontFace('THSarabunRegular', `url(${fontPath}/THSarabun.woff)`),
            new FontFace('THSarabunBold', `url(${fontPath}/THSarabun-Bold.woff)`),
            new FontFace('THSarabunItalic', `url(${fontPath}/THSarabun-Italic.woff)`),
            new FontFace('THSarabunBoldItalic', `url(${fontPath}/THSarabun-BoldItalic.woff)`),
            new FontFace('THSarabunNew', `url(${fontPath}/THSarabunNew.woff)`),
            new FontFace('THSarabunNewBold', `url(${fontPath}/THSarabunNew-Bold.woff)`),
            new FontFace('THSarabunNewItalic', `url(${fontPath}/THSarabunNew-Italic.woff)`),
            new FontFace('THSarabunNewBoldItalic', `url(${fontPath}/THSarabunNew-BoldItalic.woff)`),
            new FontFace('DBHelvethaicaMonX', `url(${fontPath}/DBHelvethaicaMonX.woff)`),
            new FontFace('DBHelvethaicaMonXCond', `url(${fontPath}/DBHelvethaicaMonXCond.woff)`),
            new FontFace('DBHelvethaicaMonXMed', `url(${fontPath}/DBHelvethaicaMonXMed.woff)`),
            new FontFace('DBHelvethaicaMonXMedCond', `url(${fontPath}/DBHelvethaicaMonXMedCond.woff)`),
            new FontFace('DBHelvethaicaMonXBold', `url(${fontPath}/DBHelvethaicaMonXBd.woff)`),
            new FontFace('DBHelvethaicaMonXBoldCond', `url(${fontPath}/DBHelvethaicaMonXBdCond.woff)`),
            new FontFace('DBHelvethaicaMonXBlk', `url(${fontPath}/DBHelvethaicaMonXBlk.woff)`),
            new FontFace('DXKrungthaiSemiBold', `url(${fontPath}/DX-Krungthai-SemiBold.woff)`),
            new FontFace('DXKrungthaiThin', `url(${fontPath}/DX-Krungthai-Thin.woff)`),
            new FontFace('DXSCB', `url(${fontPath}/DX-SCB.woff)`),
            new FontFace('DXTTBBold', `url(${fontPath}/DX-TTB-bold.woff)`),
            new FontFace('DXTTBRegular', `url(${fontPath}/DX-TTB-regular.woff)`),
            new FontFace('DXKrungthaiBold', `url(${fontPath}/DX-Krungthai-Bold.woff)`),
            new FontFace('DXKrungthaiMedium', `url(${fontPath}/DX-Krungthai-Medium.woff)`),
            new FontFace('DXKrungthaiRegular', `url(${fontPath}/DX-Krungthai-Regular.woff)`),
            new FontFace('TTBMoney', `url(${fontPath}/TTB Money.woff)`),
            new FontFace('CoreSansLight', `url(${fontPath}/Core-Sans-E-W01-35-Light.woff)`),
            new FontFace('CoreSansBold', `url(${fontPath}/Core-Sans-N-65-Bold.woff)`),
            new FontFace('kuriousRegular', `url(${fontPath}/kurious-Regular.woff)`),
            new FontFace('kuriousSemiBold', `url(${fontPath}/kurious-semibold.woff)`)
        ];
        return Promise.all(fonts.map(font => font.load().catch(e => {}))).then(function(loadedFonts) {
            loadedFonts.forEach(function(font) { if (font) document.fonts.add(font); });
        });
    }

    function ensureFontsLoaded() {
        if (fontsLoaded) return Promise.resolve();
        return loadFonts().then(() => { fontsLoaded = true; });
    }

    // ==========================================
    // 2. ฟังก์ชันเครื่องมือ (Helpers)
    // ==========================================
    function padZero(num) { return num.toString().padStart(2, '0'); }

    function formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        const options = { day: 'numeric', month: 'short', year: '2-digit' };
        let formattedDate = d.toLocaleDateString('th-TH', options);
        formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const day = formattedDate.split(' ')[0];
        const month = months[d.getMonth()];
        const year = formattedDate.split(' ')[2];
        return `${day} ${month} ${year}`;
    }

    function generateUniqueID() {
        const dtEl = document.getElementById('datetime');
        const now = dtEl && dtEl.value ? new Date(dtEl.value) : new Date();
        const startDate = new Date("2024-07-24");
        const dayDifference = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const uniqueDay = (15475 + dayDifference).toString().padStart(6, '0');
        const timePart = `${padZero(now.getHours())}${padZero(now.getMinutes())}${padZero(now.getSeconds())}`;
        const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${uniqueDay}${timePart}COR0${randomPart}`; // กสิกรใช้ COR
    }

    function getInputValue(id, fallback = '') {
        const el = document.getElementById(id);
        return el && el.value ? el.value : fallback;
    }

    // ✨ ฟังก์ชันวาดข้อความอัปเกรดใหม่ (ใช้ระบบจัดชิดขวาของเบราว์เซอร์ แม่นยำ 100%)
    function drawText(ctx, text, x, y, fontSize, fontFamily, color, align) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = align; // 'left' หรือ 'right'
        ctx.fillText(text, x, y);
    }

    function drawImage(ctx, imageUrl, x, y, width, height) {
        const image = new Image();
        image.src = imageUrl;
        image.onload = function() { ctx.drawImage(image, x, y, width, height); };
    }

    function getBankInfo(bank) {
        let bankText = bank;
        let bankLogoUrl = '';
        switch (bank) {
            case 'ธ.กสิกรไทย':          bankText = 'ธ.กสิกรไทย'; bankLogoUrl = 'assets/image/logo/KBANK.png'; break;
            case 'ธ.กรุงไทย':           bankText = 'ธ.กรุงไทย'; bankLogoUrl = 'assets/image/logo/KTB.png'; break;
            case 'ธ.กรุงเทพ':           bankText = 'ธ.กรุงเทพ'; bankLogoUrl = 'assets/image/logo/BBL1.png'; break;
            case 'ธ.ไทยพาณิชย์':        bankText = 'ธ.ไทยพาณิชย์'; bankLogoUrl = 'assets/image/logo/SCB1.png'; break;
            case 'ธ.กรุงศรีอยุธยา':     bankText = 'ธ.กรุงศรีอยุธยา'; bankLogoUrl = 'assets/image/logo/BAY.png'; break;
            case 'ธ.ทหารไทยธนชาต':     bankText = 'ธ.ทหารไทยธนชาต'; bankLogoUrl = 'assets/image/logo/TTB1.png'; break;
            case 'ธ.ออมสิน':           bankText = 'ธ.ออมสิน'; bankLogoUrl = 'assets/image/logo/O.png'; break;
            case 'ธ.ก.ส.':             bankText = 'ธ.ก.ส.'; bankLogoUrl = 'assets/image/logo/T.png'; break;
            case 'ธ.อาคารสงเคราะห์':    bankText = 'ธ.อาคารสงเคราะห์'; bankLogoUrl = 'assets/image/logo/C.png'; break;
            case 'ธ.เกียรตินาคินภัทร':  bankText = 'ธ.เกียรตินาคินภัทร'; bankLogoUrl = 'assets/image/logo/K.png'; break;
            case 'ธ.ซีไอเอ็มบีไทย':        bankText = 'ธ.ซีไอเอ็มบี'; bankLogoUrl = 'assets/image/logo/CIMB.png'; break;
            case 'ธ.ยูโอบี':            bankText = 'ธ.ยูโอบี'; bankLogoUrl = 'assets/image/logo/UOB.png'; break;
            case 'ธ.แลนด์ แอนด์ เฮ้าส์': bankText = 'ธ.แลนด์ แอนด์ เฮ้าส์'; bankLogoUrl = 'assets/image/logo/LHBANK.png'; break;
            case 'ธ.ไอซีบีซี':          bankText = 'ธ.ไอซีบีซี'; bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
            case 'รหัสพร้อมเพย์':       bankText = 'รหัสพร้อมเพย์'; bankLogoUrl = 'assets/image/logo/P-KBANK.png'; break;
            case 'พร้อมเพย์วอลเล็ท':    bankLogoUrl = 'assets/image/logo/P-KBANK.png'; break;
            case 'MetaAds':             bankLogoUrl = 'assets/image/logo/Meta.png'; break;
        }
        return { bankText, bankLogoUrl };
    }

    function drawQRCode(ctx, x, y, size) {
        const qrInput = document.getElementById('QRCode');
        if (qrInput && qrInput.files && qrInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const qrImg = new Image();
                qrImg.src = e.target.result;
                qrImg.onload = function() { ctx.drawImage(qrImg, x, y, size, size); }
            }
            reader.readAsDataURL(qrInput.files[0]);
        }
    }

    // ==========================================
    // 3. โหมดปกติ (Standard) 
    // ==========================================
    function renderSlipStandard() {
        const sendername = getInputValue('sendername', '-');
        const senderaccount = getInputValue('senderaccount', '-');
        const receivername = getInputValue('receivername', '-');
        const receiveraccount = getInputValue('receiveraccount', '-');
        const bank = getInputValue('bank', '-');
        
        let amount11 = getInputValue('amount11', '-').replace(/\s*บาท/g, '').trim(); 
        
        const datetime = getInputValue('datetime', '');
        const selectedImage = getInputValue('imageSelect', '');
        const bgSelectEl = document.getElementById('backgroundSelect');
        let backgroundImageSrc = bgSelectEl ? bgSelectEl.value : 'assets/image/bs/N-K1.jpg';

        const bankInfo = getBankInfo(bank);
        const isMetaAds = bank === 'MetaAds';
        const formattedDate = formatDate(datetime);
        const d = new Date(datetime);
        const formattedTime = isNaN(d.getTime()) ? '' : d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // ✨ โค้ดสีตามสลิปจริง ✨
        const colorDark = '#414141'; // ดำเข้ม (ชื่อ, จำนวนเงิน)
        const colorGray = '#5a5a5a'; // เทา (ธนาคาร, บัญชี, วันที่, บาท, เลขที่รายการ)

        const backgroundImage = new Image();
        backgroundImage.src = backgroundImageSrc;
        backgroundImage.onload = function () {
            
            // ทำให้ Canvas กางออกเท่ารูปเป๊ะๆ (842x995)
            canvas.width = backgroundImage.width;
            canvas.height = backgroundImage.height;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

            const bankLogo = new Image();
            bankLogo.src = bankInfo.bankLogoUrl;
            bankLogo.onload = function() {
                
                // 1. โลโก้ขนาดพอดีขอบ (86x86)
                drawImage(ctx, 'assets/image/logo/KBANK.png', 34, 212, 86, 86); 
                ctx.drawImage(bankLogo, 34, 420, 86, 86); 
                
                // 2. วันที่และเวลา
                drawText(ctx, `${formattedDate}  ${formattedTime} น.`, 140, 137, 33, 'kuriousRegular', colorGray, 'left');
                
                // 3. ผู้โอน 
                drawText(ctx, `${sendername}`, 140, 265, 38, 'kuriousSemiBold', colorDark, 'left');
                drawText(ctx, `ธ.กสิกรไทย`, 140, 312, 32, 'kuriousRegular', colorGray, 'left');
                drawText(ctx, `${senderaccount}`, 140, 358, 32, 'kuriousRegular', colorGray, 'left');
                
                // 4. ผู้รับ
                if (isMetaAds) {
                    drawText(ctx, `Meta Ads (KGP)`, 140, 452, 38, 'kuriousSemiBold', colorDark, 'left');
                    drawText(ctx, `${receiveraccount}`, 140, 498, 32, 'kuriousRegular', colorGray, 'left');
                } else {
                    drawText(ctx, `${receivername}`, 140, 472, 38, 'kuriousSemiBold', colorDark, 'left');
                    
                    if (bank !== 'พร้อมเพย์วอลเล็ท') {
                        // กรณีธนาคารทั่วไป (แสดงชื่อธนาคาร และตามด้วยเลขบัญชีด้านล่าง)
                        drawText(ctx, bankInfo.bankText, 140, 520, 32, 'kuriousRegular', colorGray, 'left');
                        drawText(ctx, `${receiveraccount}`, 140, 565, 32, 'kuriousRegular', colorGray, 'left');
                    } else {
                        // กรณีพร้อมเพย์วอลเล็ท (ไม่มีบรรทัดธนาคาร ดึงเลขบัญชี/เบอร์ขึ้นมาตรงนี้แทน)
                        drawText(ctx, `${receiveraccount}`, 140, 520, 32, 'kuriousRegular', colorGray, 'left');
                    }
                }
                if (isMetaAds) {
                drawText(ctx, `Meta Ads (KGP)`, 140, 452, 38, 'kuriousSemiBold', colorDark, 'left');
                drawText(ctx, `${receiveraccount}`, 140, 498, 32, 'kuriousRegular', colorGray, 'left');
                drawText(ctx, `${receiveraccount}`, 140, 545, 32, 'kuriousRegular', colorGray, 'left'); // ✨ เพิ่มบรรทัดที่สองตรงนี้
            }
                
                // 5. โซนตัวเลข 
                const rightBaht = 800; 
                const rightNum = 550;   

                // จำนวนเงิน
                drawText(ctx, ``, rightBaht, 682, 34, 'kuriousRegular', colorGray, 'right');
                drawText(ctx, `${amount11}`, rightNum, 692, 50, 'kuriousSemiBold', colorDark, 'right');
                
                // ค่าธรรมเนียม
                drawText(ctx, ``, rightBaht, 782, 34, 'kuriousRegular', colorGray, 'right');
                drawText(ctx, `0.00`, rightNum, 800, 34, 'kuriousRegular', colorGray, 'right'); 
                
                // 6. เลขที่รายการ (จัดชิดขวา)
                drawText(ctx, `${generateUniqueID()}`, 612, 895, 30, 'kuriousRegular', colorGray, 'right');
                
                // 7. QR Code
                drawQRCode(ctx, 605, 680, 140);
                
                // 8. สติ๊กเกอร์
                if (selectedImage && selectedImage !== 'assets/image/st/NO.png') {
                    const customImage = new Image();
                    customImage.src = selectedImage;
                    customImage.onload = function() {
                        ctx.drawImage(customImage, 0, 0, canvas.width, canvas.height);
                    }
                }
            };
        };
    }

    // ==========================================
    // 4. โหมดบันทึกช่วยจำ (Note)
    // ==========================================
    function renderSlipNote() {
        const sendername = getInputValue('sendername', '-');
        const senderaccount = getInputValue('senderaccount', '-');
        const receivername = getInputValue('receivername', '-');
        const receiveraccount = getInputValue('receiveraccount', '-');
        const bank = getInputValue('bank', '-');
        
        let amount11 = getInputValue('amount11', '-').replace(/\s*บาท/g, '').trim(); 
        
        const datetime = getInputValue('datetime', '');
        const selectedImage = getInputValue('imageSelect', '');
        const AideMemoire = getInputValue('AideMemoire', '-');
        const bgNoteEl = document.getElementById('bg_note');
        const bgNoteValue = bgNoteEl ? bgNoteEl.value : 'assets/image/bs/N-K1T.jpg';

        const bankInfo = getBankInfo(bank);
        const isMetaAds = bank === 'MetaAds';
        const formattedDate = formatDate(datetime);
        const d = new Date(datetime);
        const formattedTime = isNaN(d.getTime()) ? '' : d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const colorDark = '#414141'; 
        const colorGray = '#5a5a5a'; 

        const backgroundImage = new Image();
        backgroundImage.src = bgNoteValue;
        backgroundImage.onload = function() {
            canvas.width = backgroundImage.width;
            canvas.height = backgroundImage.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

            const bankLogo = new Image();
            bankLogo.src = bankInfo.bankLogoUrl;
            bankLogo.onload = function() {
                
                // 1. โลโก้ (ขยับขึ้นบนเพื่อเว้นที่ให้โน้ต)
                drawImage(ctx, 'assets/image/logo/KBANK.png', 34, 212, 86, 86);
                ctx.drawImage(bankLogo, 34, 420, 86, 86);

                // 2. วันที่
                drawText(ctx, `${formattedDate}  ${formattedTime} น.`, 140, 137, 33, 'kuriousRegular', colorGray, 'left');

                // 3. ผู้โอน
                drawText(ctx, `${sendername}`, 140, 265, 38, 'kuriousSemiBold', colorDark, 'left');
                drawText(ctx, `ธ.กสิกรไทย`, 140, 312, 32, 'kuriousRegular', colorGray, 'left');
                drawText(ctx, `${senderaccount}`, 140, 358, 32, 'kuriousRegular', colorGray, 'left');

                // 4. ผู้รับ
                if (isMetaAds) {
                    drawText(ctx, `Meta Ads (KGP)`, 140, 452, 38, 'kuriousSemiBold', colorDark, 'left');
                    drawText(ctx, `${receiveraccount}`, 140, 498, 32, 'kuriousRegular', colorGray, 'left');
                } else {
                    drawText(ctx, `${receivername}`, 140, 472, 38, 'kuriousSemiBold', colorDark, 'left');
                    
                    if (bank !== 'พร้อมเพย์วอลเล็ท') {
                        // กรณีธนาคารทั่วไป (แสดงชื่อธนาคาร และตามด้วยเลขบัญชีด้านล่าง)
                        drawText(ctx, bankInfo.bankText, 140, 520, 32, 'kuriousRegular', colorGray, 'left');
                        drawText(ctx, `${receiveraccount}`, 140, 565, 32, 'kuriousRegular', colorGray, 'left');
                    } else {
                        // กรณีพร้อมเพย์วอลเล็ท (ไม่มีบรรทัดธนาคาร ดึงเลขบัญชี/เบอร์ขึ้นมาตรงนี้แทน)
                        drawText(ctx, `${receiveraccount}`, 140, 520, 32, 'kuriousRegular', colorGray, 'left');
                    }
}
                    if (isMetaAds) {
                        drawText(ctx, `Meta Ads (KGP)`, 140, 452, 38, 'kuriousSemiBold', colorDark, 'left');
                        drawText(ctx, `${receiveraccount}`, 140, 498, 32, 'kuriousRegular', colorGray, 'left');
                        drawText(ctx, `${receiveraccount}`, 140, 545, 32, 'kuriousRegular', colorGray, 'left'); // ✨ เพิ่มบรรทัดที่สองตรงนี้
                    }

                // 5. โซนตัวเลข 
                const rightBaht = 800;  
                const rightNum = 550; 

                drawText(ctx, ``, rightBaht, 682, 34, 'kuriousRegular', colorGray, 'right');
                drawText(ctx, `${amount11}`, rightNum, 692, 50, 'kuriousSemiBold', colorDark, 'right');
                
                drawText(ctx, ``, rightBaht, 782, 34, 'kuriousRegular', colorGray, 'right');
                drawText(ctx, `0.00`, rightNum, 800, 34, 'kuriousRegular', colorGray, 'right');

                // 6. เลขที่รายการ
                drawText(ctx, `${generateUniqueID()}`, 612, 895, 30, 'kuriousRegular', colorGray, 'right');

                // 7. QR Code
                drawQRCode(ctx, 605, 680, 140);

                // 8. บันทึกช่วยจำ 
                drawText(ctx, `${AideMemoire}`, 180, 999, 28, 'kuriousRegular', colorGray, 'left');

                if (selectedImage && selectedImage !== 'assets/image/st/NO.png') {
                    const customImage = new Image();
                    customImage.src = selectedImage;
                    customImage.onload = function() {
                        ctx.drawImage(customImage, 0, 0, canvas.width, canvas.height);
                    };
                }
            };
        };
    }

    // ==========================================
    // 5. EXPORT
    // ==========================================
    window.updateDisplayStandard = function() {
        ensureFontsLoaded().then(() => { renderSlipStandard(); }).catch(() => { renderSlipStandard(); });
    };

    window.updateDisplayNote = function() {
        ensureFontsLoaded().then(() => { renderSlipNote(); }).catch(() => { renderSlipNote(); });
    };

    window.downloadImage = function() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'slip_kbank.png';
        link.click();
    };

})();