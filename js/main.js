import { readImageFile, processImage } from './converter.js';

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('uploadImg');
    const formatSelect = document.getElementById('formatSelect');
    const convertBtn = document.getElementById('convertBtn');
    const statusText = document.getElementById('statusText');

    convertBtn.addEventListener('click', async () => {
        // ตรวจสอบว่าผู้ใช้ใส่ไฟล์มาหรือยัง
        if (fileInput.files.length === 0) {
            alert('กรุณาเลือกไฟล์รูปภาพก่อน');
            return;
        }

        const file = fileInput.files[0];
        const format = formatSelect.value;

        // ล็อกปุ่มป้องกันผู้ใช้กดซ้ำ
        convertBtn.disabled = true;
        statusText.style.color = '#333';
        statusText.textContent = "กำลังประมวลผล...";

        try {
            // 1. นำไฟล์เข้าฟังก์ชันอ่านรูป (รอจนกว่าจะอ่านเสร็จด้วย await)
            const imageSrc = await readImageFile(file);
            
            // 2. ส่งข้อมูลไปแปลงไฟล์บน Canvas
            const convertedDataUrl = await processImage(imageSrc, format);

            // 3. ตั้งชื่อไฟล์ใหม่ และสั่งดาวน์โหลด
            const fileExtension = format.split('/')[1];
            const newFilename = `converted_${Date.now()}.${fileExtension}`;
            triggerDownload(convertedDataUrl, newFilename);
            
            statusText.style.color = '#28a745';
            statusText.textContent = "แปลงไฟล์และดาวน์โหลดสำเร็จ!";
        } catch (error) {
            console.error(error);
            statusText.style.color = 'red';
            statusText.textContent = "เกิดข้อผิดพลาด: " + error.message;
        } finally {
            // คืนสถานะปุ่มให้กลับมากดได้เหมือนเดิม
            convertBtn.disabled = false;
        }
    });
});

/**
 * ฟังก์ชันสร้างลิงก์จำลองเพื่อดาวน์โหลดไฟล์
 */
function triggerDownload(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}