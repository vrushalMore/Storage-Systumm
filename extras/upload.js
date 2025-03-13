async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files.length) {
        alert("Please select a file to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        alert(result.message);
        loadFiles();  
        updateStorage();
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
    if (["jpg", "jpeg", "png"].includes(ext)) return "frontend/assets/image.png";
    if (["pdf"].includes(ext)) return "frontend/assets/pdf.png";
    if (["doc", "docx"].includes(ext)) return "frontend/assets/word.png";
    return "frontend/assets/default.png";
}

async function updateStorage() {
    try {
        const response = await fetch("http://localhost:3000/storage");
        const { used, total } = await response.json();

        const percentUsed = (used / total) * 100;
        document.getElementById("storageBar").style.width = percentUsed + "%";
        document.getElementById("storageText").textContent = `Storage: ${used} MB / ${total} MB`;
    } catch (error) {
        console.error("Error fetching storage:", error);
    }
}

window.onload = function () {
    loadFiles();
    updateStorage();
};
