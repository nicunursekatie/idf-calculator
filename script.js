document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed.");

    // Grab references to input fields and UI elements
    const patientNameInput = document.getElementById('patientName');
    const patientMRNInput = document.getElementById('patientMRN');
    const addPatientButton = document.getElementById('addPatient');
    const patientSelector = document.getElementById('patientSelector');
    const loadPatientBtn = document.getElementById('loadPatientBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const currentPatientNameElement = document.getElementById('currentPatientName');
    const currentPatientMRNElement = document.getElementById('currentPatientMRN');

    // In-memory array to store patient objects
    let patients = [];
    let currentPatientMRN = null;

    // Functions to update UI as needed (stubbed out)
    function updateHistoryTable() {
        console.log("History table updated (in-memory version)");
    }
    function updateStats() {
        console.log("Stats updated (in-memory version)");
    }

    // Function to add a new patient in memory
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

        // Add to our in-memory array
        patients.push(patientData);
        console.log("New patient data added to in-memory array:", patientData);

        // Load the new patient
        loadPatientData(patientMRN);

        // Repopulate the patient dropdown
        populatePatientSelector();

        // Clear the input fields
        patientNameInput.value = "";
        patientMRNInput.value = "";
    }

    // Function to load patient data from the in-memory array
    function loadPatientData(mrn) {
        console.log("Attempting to load patient data for MRN:", mrn);
        
        // Find the patient in our in-memory array
        const patientData = patients.find(p => p.patientMRN === mrn);
        if (patientData) {
            currentPatientMRN = mrn;
            currentPatientNameElement.textContent = patientData.patientName || "Unknown";
            currentPatientMRNElement.textContent = patientData.patientMRN;
            updateHistoryTable();
            updateStats();
            console.log("Patient data loaded successfully (in-memory).");
        } else {
            console.warn("No in-memory patient found for MRN:", mrn);
        }
    }

    // Populate the patient selector dropdown from the in-memory array
    function populatePatientSelector() {
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

        // Loop through all patients in memory
        patients.forEach(patient => {
            const option = document.createElement("option");
            option.value = patient.patientMRN;
            option.textContent = `${patient.patientName} (MRN: ${patient.patientMRN})`;
            patientSelector.appendChild(option);
        });
    }

    // Event listener for Add Patient button
    addPatientButton.addEventListener('click', addNewPatient);

    // Event listener for Load Patient button
    if (loadPatientBtn) {
        loadPatientBtn.addEventListener('click', () => {
            const selectedMRN = patientSelector.value;
            if (selectedMRN) {
                loadPatientData(selectedMRN);
            } else {
                alert("Please select a patient from the dropdown before loading.");
            }
        });
    }

    // Event listener for Clear Data button
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            // Clear current patient data display
            currentPatientNameElement.textContent = "No patient selected";
            currentPatientMRNElement.textContent = "-";
            currentPatientMRN = null;
            console.log("Current patient data cleared (in-memory).");
        });
    }

    // Initially populate the dropdown (empty at first, but let's keep it consistent)
    populatePatientSelector();

    console.log("In-memory version initialized.");
});
