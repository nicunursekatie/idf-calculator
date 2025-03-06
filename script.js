document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded and parsed.");

  // Grab references to input fields and UI elements
  const patientIDInput = document.getElementById('patientID'); // Unique Identifier input
  const addPatientButton = document.getElementById('addPatient');
  const patientSelector = document.getElementById('patientSelector');
  const loadPatientBtn = document.getElementById('loadPatientBtn');
  const clearDataBtn = document.getElementById('clearDataBtn');
  const currentPatientIDElement = document.getElementById('currentPatientID');

  // In-memory array to store patient objects
  let patients = [];
  let currentPatientID = null;

  // Functions to update additional UI components (stub implementations)
  function updateHistoryTable() {
    console.log("History table updated (in-memory version)");
    // Implement additional logic as needed.
  }
  function updateStats() {
    console.log("Stats updated (in-memory version)");
    // Implement additional logic as needed.
  }

  // Function to add a new patient using the unique identifier
  function addNewPatient() {
    console.log("Add New Patient button clicked.");
    const uniqueID = patientIDInput.value.trim();
    console.log("Input unique identifier:", uniqueID);

    if (!uniqueID) {
      alert("Please enter the unique identifier.");
      return;
    }

    // Create a patient object without storing any PHI
    const patientData = {
      uniqueID: uniqueID,
      readinessScores: [],
      thresholdMet: false,
      thresholdMetTime: null
    };

    // Add patient data to the in-memory array
    patients.push(patientData);
    console.log("New patient data added:", patientData);

    // Load the new patient data
    loadPatientData(uniqueID);

    // Repopulate the patient selector dropdown
    populatePatientSelector();

    // Clear the input field
    patientIDInput.value = "";
  }

  // Function to load patient data by unique identifier
  function loadPatientData(uniqueID) {
    console.log("Attempting to load patient data for unique ID:", uniqueID);
    const patientData = patients.find(p => p.uniqueID === uniqueID);
    if (patientData) {
      currentPatientID = uniqueID;
      currentPatientIDElement.textContent = patientData.uniqueID;
      updateHistoryTable();
      updateStats();
      console.log("Patient data loaded successfully (in-memory).");
    } else {
      console.warn("No patient found for unique ID:", uniqueID);
    }
  }

  // Function to populate the patient selector dropdown from the in-memory array
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

    // Add each patient's uniqueID to the dropdown
    patients.forEach(patient => {
      const option = document.createElement("option");
      option.value = patient.uniqueID;
      option.textContent = patient.uniqueID;
      patientSelector.appendChild(option);
    });
  }

  // Event listener for Add Patient button
  addPatientButton.addEventListener('click', addNewPatient);

  // Event listener for Load Patient button
  if (loadPatientBtn) {
    loadPatientBtn.addEventListener('click', () => {
      const selectedID = patientSelector.value;
      if (selectedID) {
        loadPatientData(selectedID);
      } else {
        alert("Please select a patient from the dropdown before loading.");
      }
    });
  }

  // Event listener for Clear Data button
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
      currentPatientIDElement.textContent = "No patient selected";
      currentPatientID = null;
      console.log("Current patient data cleared (in-memory).");
    });
  }

  // Initialize the dropdown on page load
  populatePatientSelector();
  console.log("In-memory version initialized.");
});
