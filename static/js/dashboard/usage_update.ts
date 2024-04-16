function bindEvents() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;

    if (fileInput) {
        fileInput.addEventListener('change', async function (this: HTMLInputElement) {
            if (fileInput.files && fileInput.files.length > 0) { // Check if files is not null or undefined and has length > 0
                const selectedFile = fileInput.files.item(0); // Access the selected file(s)
                const formData = new FormData();
                formData.append('file', selectedFile);

                try {
                    const response = await fetch('/dashboard/update_usage', {
                        method: 'POST',
                        body: formData
                    });
                    console.log("Submit File");
                    if (response.ok) {
                        const data = await response.json();
                        if (data.status === 'success') {
                            // Update a message element to show success message
                            console.log('Upload successful:', data.message);
                        }
                    } else {
                        const data = await response.json();
                        console.error('Upload failed:', data.message);
                    }
                } catch (error) {
                    console.error('File upload failed. Network error occurred.', error);
                }
            }
        });
    }
}

// fileInput?.parentElement.addEventListener('submit', async function (e) {
//     console.log("File selected, Prevent the submission.");
//     e.preventDefault(); // Prevent the default form submission
//
//     // const formData = new FormData();
//     // formData.append('file', fileInput[0]); // Assuming only one file is selected
//     //
//     // try {
//     //     const response = await fetch('/update_usage', {
//     //         method: 'POST',
//     //         body: formData
//     //     });
//     //     console.log("File submitted.");
//     //     if (response.ok) {
//     //         const data = await response.json();
//     //         if (data.status === 'success') {
//     //             // Update a message element to show success message
//     //             console.log('Upload successful:', data.message);
//     //         } else {
//     //             console.error('Upload failed:', data.message);
//     //         }
//     //     }
//     // } catch (error) {
//     //     console.error('File upload failed. Network error occurred.', error);
//     // }
// });


export default function onLoad() {
    bindEvents();
}

