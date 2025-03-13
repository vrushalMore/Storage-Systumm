// Total Storage: 14.5 GB (Fixed)
const TOTAL_STORAGE_GB = 14.5;

// Retrieve remaining storage from localStorage or default to (14.3 GB)
let remainingStorage = parseFloat(localStorage.getItem("remainingStorage")) || 14.3;

// Update storage UI
function updateStorageDisplay() {
    const usedStorage = TOTAL_STORAGE_GB - remainingStorage;
    const usedPercentage = (usedStorage / TOTAL_STORAGE_GB) * 100;
    
    document.getElementById("storageBar").style.width = usedPercentage + "%";
    document.getElementById("storageText").textContent = 
        `Used: ${usedStorage.toFixed(2)} GB / ${TOTAL_STORAGE_GB} GB`;
}

// Upload File
async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files.length) {
        alert("Please select a file to upload.");
        return;
    }

    const file = fileInput.files[0];
    const fileSizeGB = file.size / (1024 ** 3); // Convert bytes to GB

    // Check if enough storage is available
    if (fileSizeGB > remainingStorage) {
        alert("Not enough storage available!");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        alert(result.message);

        // Deduct used storage
        remainingStorage -= fileSizeGB;
        localStorage.setItem("remainingStorage", remainingStorage.toFixed(2)); // Save persistently

        loadFiles();  
        updateStorageDisplay();
    } catch (error) {
        console.error("Upload error:", error);
    }
}

// Load Files
async function loadFiles() {
    try {
        const response = await fetch("http://localhost:3000/files");
        const files = await response.json();
        
        const fileList = document.getElementById("fileList");
        fileList.innerHTML = "";

        let totalUsedStorage = 0;

        files.forEach(file => {
            const listItem = document.createElement("li");
            listItem.classList.add("file-item");

            const fileIcon = document.createElement("img");
            fileIcon.classList.add("file-icon");
            fileIcon.src = getFileIcon(file.name);

            const fileName = document.createElement("a");
            fileName.textContent = file.name;
            fileName.href = `http://localhost:3000/uploads/${file.name}`; // Make file downloadable
            fileName.target = "_blank";
            fileName.classList.add("file-name");

            const fileSize = (file.size / (1024 ** 3)).toFixed(2); // Convert to GB
            totalUsedStorage += parseFloat(fileSize);

            const fileDate = document.createElement("span");
            fileDate.textContent = new Date(file.uploadedAt).toLocaleDateString();
            fileDate.classList.add("file-date");

            listItem.appendChild(fileIcon);
            listItem.appendChild(fileName);
            listItem.appendChild(fileDate);

            fileList.appendChild(listItem);
        });

        // Update remaining storage based on loaded files
        remainingStorage = (TOTAL_STORAGE_GB - totalUsedStorage).toFixed(2);
        localStorage.setItem("remainingStorage", remainingStorage);
        updateStorageDisplay();
    } catch (error) {
        console.error("Error loading files:", error);
    }
}

// Determine file icon based on type
function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
        return "icons/image.png";
    } else if (["mp4", "avi", "mov"].includes(ext)) {
        return "icons/video.png";
    } else if (["pdf"].includes(ext)) {
        return "icons/pdf.png";
    } else if (["doc", "docx"].includes(ext)) {
        return "icons/word.png";
    } else {
        return "icons/file.png";
    }
}

// Initialize
window.onload = function () {
    loadFiles();
    updateStorageDisplay();
};
