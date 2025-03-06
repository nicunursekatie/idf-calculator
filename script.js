document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded and parsed.");

  // Grab references to input fields and UI elements
  const patientIDInput = document.getElementById('patientID'); // Unique Identifier input
  const addPatientButton = document.getElementById('addPatient');
  const patientSelector = document.getElementById('patientSelector');
  const loadPatientBtn = document.getElementById('loadPatientBtn');
  const clearDataBtn = document.getElementById('clearDataBtn');
  const currentPatientIDElement = document.getElementById('currentPatientID');

  if (!patientIDInput || !addPatientButton) {
    console.error("Missing patient input elements. Please check your HTML IDs.");
    return;
  }

  // Global variables for patient data (including assessment data)
  let readinessScores = [];
  let thresholdMet = false;
  let thresholdMetTime = null;
  let currentPatientID = '';

  // Function to update additional UI components (e.g., history table, stats)
  function updateHistoryTable() {
    console.log("History table updated");
    // Implement actual update logic here if needed.
  }
  function updateStats() {
    console.log("Stats updated");
    // Implement actual update logic here if needed.
  }

  // Function to load patient data from localStorage using the unique identifier as key
  function loadPatientData(id) {
    console.log("Attempting to load patient data for ID:", id);
    const storedData = localStorage.getItem(id);
    if (storedData) {
      try {
        const patientData = JSON.parse(storedData);
        currentPatientID = id;
        currentPatientIDElement.textContent = patientData.uniqueID || "Unknown";
        readinessScores = patientData.readinessScores || [];
        thresholdMet = patientData.thresholdMet || false;
        thresholdMetTime = patientData.thresholdMetTime ? new Date(patientData.thresholdMetTime) : null;
        updateHistoryTable();
        updateStats();
        // Store last used patient for auto-loading next time
        localStorage.setItem('lastUsedPatient', currentPatientID);
        console.log("Patient data loaded successfully.");
      } catch (e) {
        console.error("Error loading patient data:", e);
      }
    } else {
      console.warn("No stored data found for ID:", id);
    }
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

    // Create the patient data object without storing any sensitive information
    const patientData = {
      uniqueID: uniqueID,
      readinessScores: [],
      thresholdMet: false,
      thresholdMetTime: null
    };

    // Save the new patient data to localStorage (using the unique ID as key)
    localStorage.setItem(uniqueID, JSON.stringify(patientData));
    console.log("New patient data saved:", patientData);

    // Update the UI with the new patient data
    loadPatientData(uniqueID);

    // Repopulate the patient dropdown so the new patient appears
    populatePatientSelector();

    // Clear the input field
    patientIDInput.value = "";
  }

  // Function to populate the patient selector dropdown from localStorage
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

    // Loop through all keys in localStorage and add those that represent patient data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Skip the lastUsedPatient key and any keys that aren’t our patient records
      if (key === "lastUsedPatient") continue;
      try {
        const dataStr = localStorage.getItem(key);
        const data = JSON.parse(dataStr);
        if (data && data.uniqueID) {
          const option = document.createElement("option");
          option.value = key;  // Using the unique identifier as key
          option.textContent = data.uniqueID;
          patientSelector.appendChild(option);
        }
      } catch (error) {
        // Ignore keys that are not valid JSON or not our patient data
        console.error(`Error parsing data for key "${key}":`, error);
      }
    }
  }

  // Attach event listener to the Add Patient button
  addPatientButton.addEventListener('click', addNewPatient);

  // Attach event listener to the Load Patient button
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

  // Attach event listener to the Clear Data button
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
      currentPatientIDElement.textContent = "No patient selected";
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

  console.log("Unique Identifier version initialized.");
});
