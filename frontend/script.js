document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const imageInput = document.getElementById('imageInput');
    const uploadLabel = document.getElementById('uploadLabel');
    const uploadText = document.getElementById('uploadText');
    const previewImage = document.getElementById('previewImage');
    const previewContainer = document.getElementById('previewContainer');
    const previewPlaceholder = document.getElementById('previewPlaceholder');
    const predictButton = document.getElementById('predictButton'); // Although button is removed, keep for potential future use or ensure no errors if referenced elsewhere
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Right Panel Elements
    const rightPanel = document.querySelector('.right-panel'); // Get the right panel container
    const messageArea = document.getElementById('messageArea');
    const resultContainer = document.getElementById('resultContainer');
    const conditionResult = document.getElementById('conditionResult');
    const confidenceResult = document.getElementById('confidenceResult');
    const adviceResult = document.getElementById('adviceResult');

    const API_URL = "http://127.0.0.1:8000/predict/"; // Your FastAPI endpoint

    // --- State ---
    let currentFile = null;

    // --- Event Listeners ---
    imageInput.addEventListener('change', handleImageUpload);
    // Note: Predict button click listener is removed as prediction happens on image selection

    // --- Functions ---

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            currentFile = file;
            const reader = new FileReader();

            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block'; // Show image
                previewPlaceholder.style.display = 'none'; // Hide placeholder
                uploadText.textContent = 'Change Image';
                resetResultDisplay(); // Clear previous results/messages
                handlePrediction(); // Automatically trigger prediction
            };

            reader.readAsDataURL(file);
        } else {
             // Only reset fully if no image was selected before
            if (!currentFile) {
                resetUI();
            }
        }
    }

    async function handlePrediction() {
        if (!currentFile) {
            showMessage("No image selected.", "error");
            return;
        }

        // --- UI Updates for Loading ---
        // Instead of disabling a button, show loading in the message area
        showMessage("Analyzing Image...", "loading"); // Use message area for loading state
        resultContainer.style.display = 'none'; // Ensure result container is hidden

        // --- Prepare Data ---
        const formData = new FormData();
        formData.append("file", currentFile);

        // --- API Call ---
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                let errorMsg = `HTTP error! Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.detail || `Prediction failed. Server responded with status ${response.status}.`;
                } catch (e) {
                     errorMsg = `Prediction failed. Server responded with status ${response.status}. Unable to parse error details.`;
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();

            if (data.condition === undefined || data.confidence === undefined || data.medical_advice === undefined) {
                throw new Error("Received incomplete data from the server.");
            }

            displayResults(data.condition, data.confidence, data.medical_advice);

        } catch (error) {
            console.error("Prediction Error:", error);
            showMessage(`Analysis Failed: ${error.message}`, "error");
            loadingIndicator.style.display = 'none'; // Hide spinner on error
        }
        // No finally block needed for loading indicator here as it's handled by showMessage/displayResults
    }

    // Display ALL Results
    function displayResults(condition, confidence, advice) {
        conditionResult.textContent = condition;
        confidenceResult.textContent = `(${confidence} Confidence)`; // Display confidence below condition
        adviceResult.textContent = advice || "No specific advice generated."; // Handle empty advice

        // Apply styling based on condition to the result container or specific elements
        resultContainer.classList.remove('result-normal', 'result-pneumonia'); // Clear previous
        if (condition.toLowerCase() === "normal") {
            resultContainer.classList.add('result-normal');
        } else if (condition.toLowerCase() === "pneumonia") {
            resultContainer.classList.add('result-pneumonia');
        }

        messageArea.style.display = 'none'; // Hide message area
        loadingIndicator.style.display = 'none'; // Hide spinner
        resultContainer.style.display = 'block'; // Show the results
    }

    // Display Initial/Loading/Error Messages
    function showMessage(message, type = "info") {
        messageArea.textContent = message;
        messageArea.className = 'message-area'; // Reset classes
        loadingIndicator.style.display = 'none'; // Hide spinner by default

        if (type === "error") {
            messageArea.classList.add('error');
        } else if (type === "loading") {
            // For loading, show the spinner *next to* or *instead of* the message area text
            // Option 1: Show spinner, hide message text during load
             // messageArea.style.display = 'none';
             // loadingIndicator.style.display = 'flex';
            // Option 2: Keep message text, show spinner
            messageArea.textContent = message; // Keep text like "Analyzing..."
            loadingIndicator.style.display = 'flex'; // Show spinner
             messageArea.style.display = 'block'; // Make sure message area is visible if spinner is separate

        }

        if (type !== "loading") { // Ensure result container is hidden unless results are ready
             resultContainer.style.display = 'none';
        }
        if (type !== 'loading' && loadingIndicator.style.display !== 'none') {
            loadingIndicator.style.display = 'none'; // Hide spinner if not loading
        }
         if (type !== 'loading' && messageArea.style.display !== 'block'){
            messageArea.style.display = 'block'; // Ensure message area is visible if not loading
         }
    }


    // Reset the results/message display area in the right panel
    function resetResultDisplay() {
         resultContainer.style.display = 'none'; // Hide results
         conditionResult.textContent = '';
         confidenceResult.textContent = '';
         adviceResult.textContent = '';
         showMessage("Awaiting image upload..."); // Show initial message
         resultContainer.classList.remove('result-normal', 'result-pneumonia');
         loadingIndicator.style.display = 'none'; // Ensure spinner is hidden
    }

    // Reset the entire UI (preview, buttons, results)
    function resetUI() {
        previewImage.src = '#';
        previewImage.style.display = 'none'; // Hide image
        previewPlaceholder.style.display = 'block'; // Show placeholder
        uploadText.textContent = 'Select Image';
        currentFile = null;
        resetResultDisplay();
    }

    // --- Initial Setup ---
    resetUI(); // Initialize the UI state

}); // End DOMContentLoaded