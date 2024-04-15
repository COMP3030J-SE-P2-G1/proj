document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;

    if (fileInput) {
        fileInput.addEventListener('change', async function (this: HTMLInputElement, event) {
            event.preventDefault(); // Prevent the default form submission
            console.log("File selected, submitting the form.");

            const formData = new FormData();
            formData.append('file', fileInput[0]); // Assuming only one file is selected

            try {
                const response = await fetch('/update_usage', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    window.location.reload();
                }
            } catch (error) {
                console.error('File upload failed. Network error occurred.', error);
            }
        });
    }
});
