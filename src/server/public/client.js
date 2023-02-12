const inputElement = document.querySelector('input[type="file"]');
const pond = FilePond.create(inputElement, {
        server: '/file',
    }
);
pond.labelFileProcessingError = 'Invalid DKB CSV file'