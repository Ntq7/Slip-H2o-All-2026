document.addEventListener('alpine:init', () => {
    Alpine.data('repairApp', () => ({
        shopName: 'ชื่อหรือรหัสร้านค้า', fixAmount: 10000, guaranteeAmount: 3, multiplier: 2, memoText1: 'สามครั้ง',
        multiplier1: 5, limit1: 2, profitPercent: 10, limitHours: 2, errorAmount: 10000, docDate: '', refDate: '',
        signer: 'นางสาวณพัชชนันท์ ใจสา', isCopying: false, showMenu: false, menuX: 0, menuY: 0, isUploading: false,

        init() {
            const now = new Date();
            const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
            this.refDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
            this.docDate = `${now.getDate()} ${months[now.getMonth()]} พ.ศ. ${now.getFullYear() + 543}`;
        },

        smartFormat(val) {
            let num = Number(val);
            return num % 1 !== 0 ? num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : num.toLocaleString('th-TH');
        },
        
        get totalNum() { return this.fixAmount * this.multiplier; },
        get total() { return this.smartFormat(this.totalNum); },
        get profitAmountNum() { return (this.totalNum * this.profitPercent) / 100; },
        get profitAmount() { return this.smartFormat(this.profitAmountNum); },
        get grandTotal() { return this.smartFormat(this.totalNum + this.profitAmountNum); },

        openContextMenu(e) { 
            this.showMenu = true; 
            this.menuX = (e.clientX + 260 > window.innerWidth) ? window.innerWidth - 270 : e.clientX;
            this.menuY = (e.clientY + 200 > window.innerHeight) ? window.innerHeight - 210 : e.clientY;
        },

        async copyImageToClipboard() {
            this.showMenu = false; 
            this.isCopying = true;
            const element = document.getElementById('capture-area');
            const wrapper = element.parentElement; // กล่องที่โดนปรับ scale อยู่
            
            // 1. ถอย scroll กลับบนสุด
            window.scrollTo(0,0);
            
            // 2. ปลดล็อค Scale ก่อนแคปรูป (สำคัญมาก! เพื่อแก้ปัญหาตัวอักษรเบียดกัน)
            const originalTransform = wrapper.style.transform;
            wrapper.style.transform = 'scale(1)';
            
            try {
                // รอฟอนต์และรอให้หน้าจอขยายเสร็จ
                await document.fonts.ready;
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // ใช้การตั้งค่าดั้งเดิมของ html2canvas
                const canvas = await html2canvas(element, { 
                    useCORS: true, 
                    scale: 2, 
                    logging: false, 
                    backgroundColor: '#ffffff'
                });
                
                // คืนค่า Scale หน้าจอกลับไปเหมือนเดิม
                wrapper.style.transform = originalTransform;
                
                canvas.toBlob(async (blob) => {
                    if (!blob) { alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ'); this.isCopying = false; return; }
                    try {
                        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
                        alert('✅ คัดลอกรูปภาพแล้ว');
                    } catch (err) { 
                        alert('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง: ' + err.message); 
                    }
                    this.isCopying = false;
                }, 'image/png');
            } catch (err) { 
                wrapper.style.transform = originalTransform;
                alert('Error: ' + err.message); 
                this.isCopying = false; 
            }
        },

        async uploadAndCopyLink() {
            this.showMenu = false; 
            this.isUploading = true;
            const element = document.getElementById('capture-area');
            const wrapper = element.parentElement;
            
            window.scrollTo(0,0);
            const originalTransform = wrapper.style.transform;
            wrapper.style.transform = 'scale(1)';
            
            try {
                await document.fonts.ready;
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const canvas = await html2canvas(element, { useCORS: true, scale: 2, backgroundColor: '#ffffff' });
                wrapper.style.transform = originalTransform;
                
                const base64Data = canvas.toDataURL('image/png').split(',')[1];
                const formData = new FormData(); formData.append('image', base64Data);
                
                const res = await fetch('https://api.imgbb.com/1/upload?key=69dc1d1d5c746220fd5d13c2f66613b0', { method: 'POST', body: formData });
                const data = await res.json();
                
                if (data.success) {
                    await navigator.clipboard.writeText(data.data.url);
                    alert('✅ อัปโหลดและคัดลอกลิงก์สำเร็จ:\n' + data.data.url);
                } else alert('❌ ผิดพลาดจากเซิร์ฟเวอร์');
            } catch (err) { 
                wrapper.style.transform = originalTransform;
                alert('Error: ' + err.message); 
            } finally { 
                this.isUploading = false; 
            }
        }
    }));
});