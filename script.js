document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded and parsed.");

  // Grab references for patient management
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

  // Global variables for patient data
  let readinessScores = [];
  let thresholdMet = false;
  let thresholdMetTime = null;
  let currentPatientID = '';

  // Function to update the Assessment History table
  function updateHistoryTable() {
    const historyTableBody = document.getElementById('historyTableBody');
    const noScoresMessage = document.getElementById('noScoresMessage');
    const historyTable = document.getElementById('historyTable');
    if (!historyTableBody) {
      console.warn("History table body not found.");
      return;
    }
    // Clear table
    historyTableBody.innerHTML = "";
    if (readinessScores.length === 0) {
      if (noScoresMessage) noScoresMessage.style.display = "block";
      if (historyTable) historyTable.classList.add("hidden");
      return;
    } else {
      if (noScoresMessage) noScoresMessage.style.display = "none";
      if (historyTable) historyTable.classList.remove("hidden");
    }
    // Add a row for each score
    readinessScores.forEach(scoreObj => {
      const row = document.createElement("tr");
      const dateCell = document.createElement("td");
      dateCell.className = "p-2";
      dateCell.textContent = new Date(scoreObj.timestamp).toLocaleString();
      const scoreCell = document.createElement("td");
      scoreCell.className = "p-2 text-center";
      scoreCell.textContent = scoreObj.score;
      row.appendChild(dateCell);
      row.appendChild(scoreCell);
      historyTableBody.appendChild(row);
    });
  }

  // Function to update 24-Hour Status stats
  function updateStats() {
    const totalScoresEl = document.getElementById('totalScores');
    const goodScoresEl = document.getElementById('goodScores');
    const percentGoodEl = document.getElementById('percentGood');
    if (!totalScoresEl || !goodScoresEl || !percentGoodEl) return;
    const total = readinessScores.length;
    const good = readinessScores.filter(scoreObj => scoreObj.score <= 2).length;
    totalScoresEl.textContent = total;
    goodScoresEl.textContent = good;
    percentGoodEl.textContent = total ? ((good / total) * 100).toFixed(0) + "%" : "0%";
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
    const patientData = {
      uniqueID: uniqueID,
      readinessScores: [],
      thresholdMet: false,
      thresholdMetTime: null
    };
    localStorage.setItem(uniqueID, JSON.stringify(patientData));
    console.log("New patient data saved:", patientData);
    loadPatientData(uniqueID);
    populatePatientSelector();
    patientIDInput.value = "";
  }

  // Function to populate the patient selector dropdown from localStorage
  function populatePatientSelector() {
    if (!patientSelector) {
      console.error("Dropdown element not found. Check your HTML for 'patientSelector' ID.");
      return;
    }
    patientSelector.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a patient...";
    patientSelector.appendChild(defaultOption);
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === "lastUsedPatient") continue;
      try {
        const dataStr = localStorage.getItem(key);
        const data = JSON.parse(dataStr);
        if (data && data.uniqueID) {
          const option = document.createElement("option");
          option.value = key;
          option.textContent = data.uniqueID;
          patientSelector.appendChild(option);
        }
      } catch (error) {
        console.error(`Error parsing data for key "${key}":`, error);
      }
    }
  }

  addPatientButton.addEventListener('click', addNewPatient);

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

  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
      currentPatientIDElement.textContent = "No patient selected";
      localStorage.removeItem('lastUsedPatient');
      console.log("Current patient data cleared.");
    });
  }

  populatePatientSelector();
  const lastUsedPatient = localStorage.getItem('lastUsedPatient');
  if (lastUsedPatient) {
    console.log("Auto-loading last used patient:", lastUsedPatient);
    loadPatientData(lastUsedPatient);
  }

  // ---------------------------
  // Hard-Coded Feeding Time Options & Scoring
  // ---------------------------
  const feedingDateInput = document.getElementById('feedingDate');
  const feedingTimeSelect = document.getElementById('feedingTime');
  const newScoreSelect = document.getElementById('newScore');
  const addScoreBtn = document.getElementById('addScoreBtn');

  // Auto-fill feeding date with today's date on page load
  if (feedingDateInput) {
    const today = new Date().toISOString().split('T')[0];
    feedingDateInput.value = today;
    console.log("Feeding date auto-filled on initial load:", feedingDateInput.value);
  }

  // Replace old dynamic code with a fixed array of times
  if (feedingTimeSelect) {
    feedingTimeSelect.innerHTML = "";
    const fixedTimes = [
      "8:00 AM", "8:30 AM", "9:00 AM",
      "11:00 AM", "11:30 AM", "12:00 PM",
      "2:00 PM", "2:30 PM", "3:00 PM",
      "5:00 PM", "5:30 PM", "6:00 PM",
      "8:00 PM", "8:30 PM", "9:00 PM",
      "11:00 PM", "11:30 PM", "12:00 AM",
      "2:00 AM", "2:30 AM", "3:00 AM",
      "5:00 AM", "5:30 AM", "6:00 AM"
    ];

    fixedTimes.forEach(time => {
      const option = document.createElement('option');
      option.value = time;
      option.textContent = time;
      feedingTimeSelect.appendChild(option);
    });
  }

  // Function to add a new readiness score for the current patient
  function addNewScore() {
    if (!currentPatientID) {
      alert("No patient selected. Please add or load a patient first.");
      return;
    }
    const feedingDate = feedingDateInput.value;
    const feedingTime = feedingTimeSelect.value;
    const score = newScoreSelect.value;
    if (!feedingDate || !feedingTime || !score) {
      alert("Please fill in all the score fields.");
      return;
    }
    const timestamp = new Date(`${feedingDate} ${feedingTime}`);
    const scoreObj = {
      timestamp: timestamp.toISOString(),
      score: parseInt(score)
    };
    const storedData = localStorage.getItem(currentPatientID);
    if (storedData) {
      try {
        const patientData = JSON.parse(storedData);
        patientData.readinessScores = patientData.readinessScores || [];
        patientData.readinessScores.push(scoreObj);
        localStorage.setItem(currentPatientID, JSON.stringify(patientData));
        readinessScores = patientData.readinessScores;
        updateHistoryTable();
        updateStats();
        alert("Assessment added successfully.");
        // Reset the fields: update feeding date to today and reset dropdowns.
        feedingDateInput.value = new Date().toISOString().split('T')[0];
        feedingTimeSelect.selectedIndex = 0;
        newScoreSelect.selectedIndex = 0;
      } catch (e) {
        console.error("Error updating patient data with new score:", e);
      }
    } else {
      alert("Current patient data not found.");
    }
  }

  if (addScoreBtn) {
    addScoreBtn.addEventListener('click', addNewScore);
  }

  console.log("Hard-coded feeding times version with scoring functionality initialized.");
});
