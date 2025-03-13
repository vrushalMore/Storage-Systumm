const TOTAL_STORAGE_GB = 14.5;

let remainingStorage = parseFloat(localStorage.getItem("remainingStorage")) || 14.3;

function updateStorageDisplay() {
    const usedStorage = TOTAL_STORAGE_GB - remainingStorage;
    const usedPercentage = (usedStorage / TOTAL_STORAGE_GB) * 100;
    
    document.getElementById("storageBar").style.width = usedPercentage + "%";
    document.getElementById("storageText").textContent = 
        `Used: ${usedStorage.toFixed(2)} GB / ${TOTAL_STORAGE_GB} GB`;
}

async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files.length) {
        alert("Please select a file to upload.");
        return;
    }

    const file = fileInput.files[0];
    const fileSizeGB = file.size / (1024 ** 3);

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

        remainingStorage -= fileSizeGB;
        localStorage.setItem("remainingStorage", remainingStorage.toFixed(2));

        loadFiles();  
        updateStorageDisplay();
    } catch (error) {
        console.error("Upload error:", error);
    }
}

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
            fileIcon.src = getFileIcon(file);

            const fileName = document.createElement("span");
            fileName.textContent = file;
            fileName.classList.add("file-name");

            const fileDate = document.createElement("span");
            fileDate.textContent = new Date().toLocaleDateString();
            fileDate.classList.add("file-date");

            listItem.appendChild(fileIcon);
            listItem.appendChild(fileName);
            listItem.appendChild(fileDate);

            fileList.appendChild(listItem);
        });

        window.fileNames = files;
    } catch (error) {
        console.error("Error loading files:", error);
    }
}

function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
        return "assets/image.png";
    } else if (["mp4", "avi", "mov"].includes(ext)) {
        return "assets/video.png";
    } else if (["pdf"].includes(ext)) {
        return "assets/pdf.png";
    } else if (["doc", "docx"].includes(ext)) {
        return "assets/doc.png";
    } else {
        return "assets/default.png";
    }
}

window.onload = function () {
    loadFiles();
    updateStorageDisplay();
};
