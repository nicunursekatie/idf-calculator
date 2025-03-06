document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed.");

    // Grab references to input fields and UI elements using the IDs in your HTML
    const patientNameInput = document.getElementById('patientName');
    const patientMRNInput = document.getElementById('patientMRN');
    const addPatientButton = document.getElementById('addPatient');
    const currentPatientNameElement = document.getElementById('currentPatientName');
    const currentPatientMRNElement = document.getElementById('currentPatientMRN');

    if (!patientNameInput || !patientMRNInput || !addPatientButton) {
        console.error("One or more patient input elements are missing. Check your HTML IDs.");
        return;
    }

    // Global variables for patient data
    let readinessScores = [];
    let thresholdMet = false;
    let thresholdMetTime = null;
    let currentPatientMRN = '';

    // Function to update additional UI components (implement as needed)
    function updateHistoryTable() {
        console.log("History table updated");
        // Implement actual update logic here.
    }
    function updateStats() {
        console.log("Stats updated");
        // Implement actual update logic here.
    }

    // Function to load patient data from localStorage using MRN as key
    function loadPatientData(mrn) {
        console.log("Attempting to load patient data for MRN:", mrn);
        const storedData = localStorage.getItem(mrn);
        if (storedData) {
            try {
                const patientData = JSON.parse(storedData);
                currentPatientMRN = mrn;
                currentPatientNameElement.textContent = patientData.patientName || "Unknown";
                currentPatientMRNElement.textContent = patientData.patientMRN;
                readinessScores = patientData.readinessScores || [];
                thresholdMet = patientData.thresholdMet || false;
                thresholdMetTime = patientData.thresholdMetTime ? new Date(patientData.thresholdMetTime) : null;
                updateHistoryTable();
                updateStats();
                // Store last used patient for auto-loading next time
                localStorage.setItem('lastUsedPatient', currentPatientMRN);
                console.log("Patient data loaded successfully.");
            } catch (e) {
                console.error("Error loading patient data:", e);
            }
        } else {
            console.warn("No stored data found for MRN:", mrn);
        }
    }

    // Function to add a new patient
    function addNewPatient() {
        console.log("Add New Patient button clicked.");
        const patientName = patientNameInput.value.trim();
        const patientMRN = patientMRNInput.value.trim();
        console.log("Input values:", { patientName, patientMRN });

        if (!patientName || !patientMRN) {
            alert("Please enter both patient name and MRN.");
            return;
        }

        // Create the patient data object
        const patientData = {
            patientName: patientName,
            patientMRN: patientMRN,
            readinessScores: [],
            thresholdMet: false,
            thresholdMetTime: null
        };

        // Save the new patient data to localStorage (using MRN as key)
        localStorage.setItem(patientMRN, JSON.stringify(patientData));
        console.log("New patient data saved:", patientData);

        // Update the UI with the new patient data
        loadPatientData(patientMRN);

        // Populate the patient dropdown so the new patient appears
        populatePatientSelector();

        // Clear the input fields
        patientNameInput.value = "";
        patientMRNInput.value = "";
    }

    // Function to populate the patient selector dropdown from localStorage
    function populatePatientSelector() {
        const patientSelector = document.getElementById('patientSelector');
        if (!patientSelector) {
            console.error("Dropdown element not found. Check your HTML for 'patientSelector' ID.");
            return;
        }
        // Clear existing options
        patientSelector.innerHTML = "";
        // Add a default placeholder option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select a patient...";
        patientSelector.appendChild(defaultOption);

        // Loop through all keys in localStorage and add patients
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key === "lastUsedPatient") continue;
            try {
                const dataStr = localStorage.getItem(key);
                const data = JSON.parse(dataStr);
                if (data && data.patientName && data.patientMRN) {
                    const option = document.createElement("option");
                    option.value = key;
                    option.textContent = `${data.patientName} (MRN: ${data.patientMRN})`;
                    patientSelector.appendChild(option);
                }
            } catch (error) {
                console.error(`Error parsing data for key "${key}":`, error);
            }
        }
    }

    // Attach the click event listener to the Add Patient button
    addPatientButton.addEventListener('click', addNewPatient);
    console.log("Event listener attached to Add New Patient button.");

    // Attach event listener to Load Patient button
    const loadPatientBtn = document.getElementById('loadPatientBtn');
    if (loadPatientBtn) {
        loadPatientBtn.addEventListener('click', () => {
            const patientSelector = document.getElementById('patientSelector');
            const selectedMRN = patientSelector.value;
            if (selectedMRN) {
                loadPatientData(selectedMRN);
            } else {
                alert("Please select a patient from the dropdown before loading.");
            }
        });
    }

    // Attach event listener to Clear Data button (optional)
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            // Clear current patient data display
            currentPatientNameElement.textContent = "No patient selected";
            currentPatientMRNElement.textContent = "-";
            localStorage.removeItem('lastUsedPatient');
            console.log("Current patient data cleared.");
        });
    }

    // Populate the dropdown on initial load
    populatePatientSelector();

    // Auto-load the last used patient on page load, if available
    const lastUsedPatient = localStorage.getItem('lastUsedPatient');
    if (lastUsedPatient) {
        console.log("Auto-loading last used patient:", lastUsedPatient);
        loadPatientData(lastUsedPatient);
    }
});
