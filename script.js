document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed.");

    // Grab references to input fields and UI elements
    const patientNameInput = document.getElementById('newPatientName');
    const patientMRNInput = document.getElementById('newPatientMRN');
    const addPatientButton = document.getElementById('addPatientBtn');
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

        // Optionally, clear the input fields after adding
        patientNameInput.value = "";
        patientMRNInput.value = "";
    }

    // Attach the click event listener to the Add Patient button
    addPatientButton.addEventListener('click', addNewPatient);
    console.log("Event listener attached to Add New Patient button.");

    // Auto-load the last used patient on page load, if available
    const lastUsedPatient = localStorage.getItem('lastUsedPatient');
    if (lastUsedPatient) {
        console.log("Auto-loading last used patient:", lastUsedPatient);
        loadPatientData(lastUsedPatient);
    }
});
