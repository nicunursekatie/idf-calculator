document.addEventListener('DOMContentLoaded', function() {
    // Grab references to input fields and UI elements
    const patientNameInput = document.getElementById('patientName');
    const patientMRNInput = document.getElementById('patientMRN');
    const addPatientButton = document.getElementById('addPatient');
    const currentPatientNameElement = document.getElementById('currentPatientName');
    const currentPatientMRNElement = document.getElementById('currentPatientMRN');

    // Global variables for patient data
    let readinessScores = [];
    let thresholdMet = false;
    let thresholdMetTime = null;
    let currentPatientMRN = '';

    // Function to update additional UI components (implement as needed)
    function updateHistoryTable() {
        // Your logic for updating the history table goes here
        console.log("History table updated");
    }
    function updateStats() {
        // Your logic for updating statistics goes here
        console.log("Stats updated");
    }

    // Function to load patient data from localStorage using MRN as key
    function loadPatientData(mrn) {
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
            } catch (e) {
                console.error("Error loading patient data:", e);
            }
        }
    }

    // Function to add a new patient
    function addNewPatient() {
        const patientName = patientNameInput.value.trim();
        const patientMRN = patientMRNInput.value.trim();

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

        // Update the UI with the new patient data
        loadPatientData(patientMRN);

        // Optionally, clear the input fields after adding
        patientNameInput.value = "";
        patientMRNInput.value = "";
    }

    // Attach the click event listener to the Add Patient button
    addPatientButton.addEventListener('click', addNewPatient);

    // Auto-load the last used patient on page load, if available
    const lastUsedPatient = localStorage.getItem('lastUsedPatient');
    if (lastUsedPatient) {
        loadPatientData(lastUsedPatient);
    }
});
