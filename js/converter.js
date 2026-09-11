/**
 * อ่านไฟล์รูปภาพและแปลงเป็น Data URL (Base64)
 */
export const readImageFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(new Error("ไม่สามารถอ่านไฟล์ได้"));
        reader.readAsDataURL(file);
    });
};

/**
 * วาดรูปภาพลงบน Canvas และแปลงเป็นสกุลไฟล์ที่ต้องการ
 */
export const processImage = (imageSrc, format, quality = 0.9) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            // กรณีแปลงเป็น JPG ต้องเติมพื้นหลังขาว
            if (format === 'image/jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL(format, quality));
        };

        img.onerror = () => reject(new Error("เกิดข้อผิดพลาดในการโหลดรูปภาพ"));
        img.src = imageSrc;
    });
};