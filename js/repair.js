document.addEventListener('alpine:init', () => {
    Alpine.data('repairApp', () => ({
        // ข้อมูลตั้งต้น
        shopName: 'ชื่อหรือรหัสร้านค้า', 
        editableAmount: 10000, 
        amountX2_manual: 30000,    
        guaranteeAmount: 3, 
        memoText: 'eds', 
        memoText1: 'หนึ่งครั้ง', 
        multiplierRepair: 1, 
        multiplier: 5,         
        profitPercent: 10, 
        limitHours: 2, 
        limit1: 3, 
        limit2: 8,
        docDate: '', 
        refDate: '', 
        signer: 'นางสาวณพัชชนันท์ ใจสา',

        // สถานะ
        isCopying: false, 
        showMenu: false, 
        menuX: 0, 
        menuY: 0, 
        isUploading: false,

        init() {
            const now = new Date();
            const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
            this.refDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
            this.docDate = `${now.getDate()} ${months[now.getMonth()]} พ.ศ. ${now.getFullYear() + 543}`;
        },

        smartFormat(val) {
            let num = Number(val) || 0;
            return num % 1 !== 0 ? num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : num.toLocaleString('th-TH');
        },
        
        get combinedTotal() { return (Number(this.editableAmount) || 0) + (Number(this.amountX2_manual) || 0); },
        get baseRepair() { return this.combinedTotal * (Number(this.multiplierRepair) || 1); },
        get totalMultiplied() { return this.combinedTotal * (Number(this.multiplier) || 1); },
        get profitAmount() { return (this.baseRepair * (Number(this.profitPercent) || 0)) / 100; },
        get grandTotal() { return this.baseRepair + this.profitAmount; },

        openContextMenu(e) { 
            this.showMenu = true; 
            this.menuX = (e.clientX + 260 > window.innerWidth) ? window.innerWidth - 270 : e.clientX;
            this.menuY = (e.clientY + 200 > window.innerHeight) ? window.innerHeight - 210 : e.clientY;
        },

        // เทคนิคโคลนกระดาษ เพื่อให้ตอนแคปรูปตัวหนังสือเป๊ะ 100%
        async createCanvas() {
            const originalElement = document.getElementById('capture-area');
            const clone = originalElement.cloneNode(true);
            document.body.appendChild(clone);
            
            clone.style.position = 'fixed';
            clone.style.top = '0';
            clone.style.left = '0';
            clone.style.transform = 'scale(1)'; 
            clone.style.zIndex = '-9999';
            clone.style.boxShadow = 'none';

            await document.fonts.ready;
            await new Promise(resolve => setTimeout(resolve, 300));

            const canvas = await html2canvas(clone, { 
                useCORS: true, 
                scale: 2, 
                logging: false, 
                backgroundColor: '#ffffff',
                allowTaint: true
            });

            document.body.removeChild(clone);
            return canvas;
        },

        async copyImageToClipboard() {
            this.showMenu = false; 
            this.isCopying = true;
            window.scrollTo(0,0);
            
            try {
                const canvas = await this.createCanvas();
                canvas.toBlob(async (blob) => {
                    if (!blob) throw new Error('ไม่สามารถสร้างรูปภาพได้');
                    try {
                        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
                        alert('✅ คัดลอกรูปภาพแล้ว');
                    } catch (err) { 
                        alert('เกิด้อผิดพลาดในการคัดลอก: ' + err.message); 
                    }
                    this.isCopying = false;
                }, 'image/png');
            } catch (err) { 
                alert('Error: ' + err.message); 
                this.isCopying = false; 
            }
        },

        async uploadAndCopyLink() {
            this.showMenu = false; 
            this.isUploading = true;
            window.scrollTo(0,0);
            
            try {
                const canvas = await this.createCanvas();
                const base64Data = canvas.toDataURL('image/png').split(',')[1];
                const formData = new FormData(); 
                formData.append('image', base64Data);
                
                const res = await fetch('https://api.imgbb.com/1/upload?key=69dc1d1d5c746220fd5d13c2f66613b0', { method: 'POST', body: formData });
                const data = await res.json();
                
                if (data.success) {
                    await navigator.clipboard.writeText(data.data.url);
                    alert('✅ อัปโหลดและคัดลอกลิงก์สำเร็จ:\n' + data.data.url);
                } else {
                    alert('❌ ผิดพลาดจากเซิร์ฟเวอร์อัปโหลด');
                }
            } catch (err) { 
                alert('Error: ' + err.message); 
            } finally { 
                this.isUploading = false; 
            }
        }
    }));
});