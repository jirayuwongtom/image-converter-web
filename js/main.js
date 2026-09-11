import { readImageFile, processImage } from './converter.js';

document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('uploadImg');
    const uploadContent = document.getElementById('uploadContent');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const fileNameDisplay = document.getElementById('fileNameDisplay'); 
    const formatSelect = document.getElementById('formatSelect');
    const convertBtn = document.getElementById('convertBtn');
    const statusAlert = document.getElementById('statusAlert');

    let selectedFile = null;

    const showAlert = (message, type) => {
        statusAlert.textContent = message;
        statusAlert.className = `status-alert ${type}`; 
        statusAlert.style.display = 'block';
    };

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            showAlert('กรุณาเลือกไฟล์ประเภทรูปภาพเท่านั้น', 'error');
            return;
        }
        
        selectedFile = file;
        showAlert('เลือกไฟล์เรียบร้อยแล้ว พร้อมแปลงไฟล์!', 'info');
        fileNameDisplay.textContent = `${file.name}`;

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            previewContainer.style.display = 'flex'; 
            uploadContent.style.display = 'none'; 
        };
        reader.readAsDataURL(file);
    };

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
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
            fileInput.files = e.dataTransfer.files; 
        }
    });

    convertBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            showAlert('กรุณาอัปโหลดรูปภาพ', 'error');
            return; 
        }

        const format = formatSelect.value;
        if (selectedFile.type === format) {
            const ext = format.split('/')[1].toUpperCase();
            showAlert(`ไฟล์ต้นฉบับเป็นนามสกุล ${ext} อยู่แล้ว`, 'info');
            return;
        }

        const originalBtnText = convertBtn.innerHTML;

        convertBtn.disabled = true;
        convertBtn.innerHTML = 'กำลังประมวลผล...';
        statusAlert.style.display = 'none'; 

        try {
            const imageSrc = await readImageFile(selectedFile);
            const convertedDataUrl = await processImage(imageSrc, format);
            const fileExtension = format.split('/')[1];
            const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || 'converted';
            const newFilename = `${baseName}.${fileExtension}`;
            
            triggerDownload(convertedDataUrl, newFilename);
            showAlert('แปลงไฟล์และดาวน์โหลดสำเร็จ! ', 'success');
        } catch (error) {
            console.error(error);
            showAlert("เกิดข้อผิดพลาด: " + error.message, 'error');
        } finally {
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