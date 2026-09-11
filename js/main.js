import { readImageFile, processImage } from './converter.js';

document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('uploadImg');
    const uploadContent = document.getElementById('uploadContent');
    const imagePreview = document.getElementById('imagePreview');
    const formatSelect = document.getElementById('formatSelect');
    const convertBtn = document.getElementById('convertBtn');
    const statusAlert = document.getElementById('statusAlert');

    let selectedFile = null;

    // 1. ฟังก์ชันจัดการ Alert แจ้งเตือน (แทนที่ alert เดิม)
    const showAlert = (message, type) => {
        statusAlert.textContent = message;
        statusAlert.className = `status-alert ${type}`; // สลับคลาสตามประเภท (error, success, info)
        statusAlert.style.display = 'block';
    };

    // 2. ฟังก์ชันแสดงภาพตัวอย่างเมื่อเลือกไฟล์
    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            showAlert('กรุณาเลือกไฟล์ประเภทรูปภาพเท่านั้นครับ', 'error');
            return;
        }
        
        selectedFile = file;
        showAlert('เลือกไฟล์เรียบร้อยแล้ว พร้อมแปลงไฟล์!', 'info');

        // อ่านไฟล์เพื่อแสดงภาพตัวอย่าง
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            uploadContent.style.display = 'none'; // ซ่อนไอคอนกล่องอัปโหลด
        };
        reader.readAsDataURL(file);
    };

    // 3. จัดการ Event การคลิกที่กล่องเพื่อเลือกไฟล์
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    // 4. จัดการ Event Drag & Drop (ลากไฟล์มาวาง)
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
            fileInput.files = e.dataTransfer.files; // โยนไฟล์เข้าไปใน input ด้วย
        }
    });

    // 5. ปุ่มกดแปลงไฟล์
    convertBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            showAlert('กรุณาอัปโหลดรูปภาพก่อนทำการแปลงไฟล์ครับ', 'error');
            return; // หยุดการทำงาน ไม่ใช้ alert() แล้ว
        }

        const format = formatSelect.value;
        const originalBtnText = convertBtn.innerHTML;

        // ล็อกปุ่มและเปลี่ยนข้อความปุ่มให้ดูเหมือนกำลังโหลด
        convertBtn.disabled = true;
        convertBtn.innerHTML = '⏳ กำลังประมวลผล...';
        statusAlert.style.display = 'none'; // ซ่อนแจ้งเตือนเก่า

        try {
            const imageSrc = await readImageFile(selectedFile);
            const convertedDataUrl = await processImage(imageSrc, format);

            const fileExtension = format.split('/')[1];
            const newFilename = `converted_${Date.now()}.${fileExtension}`;
            triggerDownload(convertedDataUrl, newFilename);
            
            showAlert('แปลงไฟล์และดาวน์โหลดสำเร็จ! 🎉', 'success');
        } catch (error) {
            console.error(error);
            showAlert("เกิดข้อผิดพลาด: " + error.message, 'error');
        } finally {
            // คืนสถานะปุ่ม
            convertBtn.disabled = false;
            convertBtn.innerHTML = originalBtnText;
        }
    });
});

function triggerDownload(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}