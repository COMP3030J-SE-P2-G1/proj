document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');

    if (fileInput) {
        (fileInput as HTMLInputElement).onchange = function(this: HTMLInputElement) {
            console.log("File selected, submitting the form.");
            this.form?.submit();
        };
    }
});
