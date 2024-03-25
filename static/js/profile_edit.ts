/**
 * Triggers the file input click event to open the file selector dialog.
 */
function triggerFileUpload(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
}

/**
 * Setup change event listener for the file input.
 * This function is optional and can be customized based on your needs.
 */
function setupFileInputChange(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.addEventListener('change', () => {
        const maxFiles = 1;
        const fileName = fileInput.files?.item(0)?.name;
        console.log(`Selected file: ${fileName}`);
        // automatically submitting the form.
        const form = new FormData();
        if (fileInput.files.length > 0 && fileInput.files.length <= maxFiles) {
            const file = fileInput.files.item(0);
            form.append('image', file, file.name);
            console.log("Success append image into form");
            // 使用fetch API上传文件
            fetch('/image_edit', {
                method: 'POST',
                body: form,
            })
                .then(response => response.text())
                .then(data => {
                    console.log("Success: ", data);
                    // 这里可以添加上传成功后的处理逻辑
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
        ;
    });
}

// Initialize event listeners once the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    setupFileInputChange();
});
