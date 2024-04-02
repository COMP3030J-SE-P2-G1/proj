document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');

    if (fileInput) {
        (fileInput as HTMLInputElement).onchange = function (this: HTMLInputElement) {
            console.log("File selected, submitting the form.");
            this.form?.submit();
        };
    }
});


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('passwordForm').addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent the default form submission

        const form = e.target;
        const formData = new FormData(form);

        try {
            const response = await fetch('/change_password', {
                method: 'POST',
                body: formData // FormData object automatically sets the Content-Type to 'multipart/form-data', including the boundary parameter.
            });
            if (!response.ok) {
                if (response.status === 400) {
                    // Assuming the server responds with JSON containing the error details
                    const errorData = await response.json();

                    // Clear previous errors
                    document.querySelectorAll('.form-group .alert-error').forEach(el => {
                        el.remove();
                    });

                    // Insert error messages into the form
                    Object.entries(errorData.errors).forEach(([fieldName, errorMessage]) => {
                        const inputElement = document.querySelector(`[name="${fieldName}"]`);
                        const errorElement = document.createElement('div');
                        errorElement.className = 'alert alert-error shadow-lg mt-1 p-2 text-xs';
                        errorElement.style.backgroundColor = '#FECACA';
                        errorElement.style.color = '#B91C1C';
                        errorElement.textContent = <string>errorMessage;

                        inputElement.classList.add('input-error'); // Highlight the input
                        inputElement.parentElement.appendChild(errorElement);
                    });
                }
            } else {
                // Handle success
                window.location.reload();
            }

        } catch (error) {
            // Handle error (e.g., keep the dialog open, display error messages)
            console.error('Error:', error);
            alert('Error: ' + error.message); // Simplified error handling for demonstration
        }
    });
});

