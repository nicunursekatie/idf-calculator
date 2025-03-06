document.addEventListener('DOMContentLoaded', function() {
    // Unit-specific feeding times
    const feedingTimeOptions = [
        // AM times
        "08:00", "08:30", "09:00", 
        "11:00", "11:30", "12:00",
        "14:00", "14:30", "15:00",
        "17:00", "17:30", "18:00",
        // PM times
        "20:00", "20:30", "21:00",
        "23:00", "23:30", "00:00",
        "02:00", "02:30", "03:00",
        "05:00", "05:30", "06:00"
    ];

    // State variables
    let readinessScores = [];
    let thresholdMet = false;
    let thresholdMetTime = null;
    let currentPatientMRN = '';

    // DOM elements
    const patientNameInput = document.getElementById('patientName');
    const patientMRNInput = document.getElementById('patientMRN');
    const feedingDateInput = document.getElementById('feedingDate');
    const feedingTimeSelect = document.getElementById('feedingTime');
    const newScoreSelect = document.getElementById('newScore');
    const addScoreBtn = document.getElementById('addScoreBtn');
    const historyTable = document.getElementById('historyTable');
    const historyTableBody = document.getElementById('historyTableBody');
    const noScoresMessage = document.getElementById('noScoresMessage');
    const totalScoresElement = document.getElementById('totalScores');
    const goodScoresElement = document.getElementById('goodScores');
    const percentGoodElement = document.getElementById('percentGood');
    const timelineElement = document.getElementById('timeline');
    const timelineContainer = document.getElementById('timelineContainer');
    const waitingNotice = document.getElementById('waitingNotice');
    const thresholdMetNotice = document.getElementById('thresholdMet');
    const thresholdNotMetNotice = document.getElementById('thresholdNotMet');
    const thresholdMetTimeElement = document.getElementById('thresholdMetTime');
    const patientSelector = document.getElementById('patientSelector');
    const loadPatientBtn = document.getElementById('loadPatientBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');

    // Initialize feeding time options
    feedingTimeOptions.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = formatTimeFor12Hour(time);
        feedingTimeSelect.appendChild(option);
    });

    // Set default date and time
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    feedingDateInput.value = dateStr;

    // Find closest feeding time
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeValue = currentHour * 60 + currentMinute;
    
    let closestTime = feedingTimeOptions[0];
    let minDifference = Infinity;
    
    feedingTimeOptions.forEach(timeOption => {
        const [hours, minutes] = timeOption.split(':').map(Number);
        const timeValue = hours * 60 + minutes;
        const difference = Math.abs(timeValue - currentTimeValue);
        
        if (difference < minDifference) {
            minDifference = difference;
            closestTime = timeOption;
        }
    });
    
    feedingTimeSelect.value = closestTime;

    // Populate patient dropdown
    populatePatientDropdown();

    // Event Listeners
    loadPatientBtn.addEventListener('click', function() {
        const mrn = patientSelector.value;
        if (mrn) {
            loadPatientData(mrn);
        }
    });

    clearDataBtn.addEventListener('click', function() {
        if (confirm("Are you sure you want to clear all data for this patient?")) {
            readinessScores = [];
            thresholdMet = false;
            thresholdMetTime = null;
            
            updateHistoryTable();
            updateStats();
            saveToLocalStorage();
        }
    });

    // Enable/disable add button based on form completion
    function updateAddButtonState() {
        if (newScoreSelect.value && feedingDateInput.value && feedingTimeSelect.value && patientMRNInput.value) {
            addScoreBtn.classList.remove('bg-gray-300', 'cursor-not-allowed');
            addScoreBtn.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700');
            addScoreBtn.disabled = false;
        } else {
            addScoreBtn.classList.add('bg-gray-300', 'cursor-not-allowed');
            addScoreBtn.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-700');
            addScoreBtn.disabled = true;
        }
    }

    // Add score button click handler
    addScoreBtn.addEventListener('click', addScore);
    
    // Form field change listeners
    newScoreSelect.addEventListener('change', updateAddButtonState);
    feedingDateInput.addEventListener('change', updateAddButtonState);
    feedingTimeSelect.addEventListener('change', updateAddButtonState);
    patientMRNInput.addEventListener('change', function() {
        updateAddButtonState();
        currentPatientMRN = patientMRNInput.value;
        saveToLocalStorage();
        populatePatientDropdown();
    });
    patientNameInput.addEventListener('change', function() {
        saveToLocalStorage();
        populatePatientDropdown();
    });

    // Initialize button state
    updateAddButtonState();

    // Add a new score entry
    function addScore() {
        if (newScoreSelect.value && ['1', '2', '3', '4', '5'].includes(newScoreSelect.value) && 
            feedingDateInput.value && feedingTimeSelect.value && patientMRNInput.value) {
            
            // Handle midnight case (00:00)
            let adjustedDate = feedingDateInput.value;
            let adjustedTime = feedingTimeSelect.value;
            
            if (feedingTimeSelect.value === "00:00") {
                // Create a date object for the feeding date
                const feedingDateObj = new Date(feedingDateInput.value);
                // Add one day for midnight entries
                feedingDateObj.setDate(feedingDateObj.getDate() + 1);
                // Format back to YYYY-MM-DD
                adjustedDate = feedingDateObj.toISOString().split('T')[0];
                adjustedTime = "00:00";
            }
            
            // Create timestamp from feeding date and time
            const feedingTimestamp = new Date(`${adjustedDate}T${adjustedTime}`);
            
            const newEntry = {
                score: parseInt(newScoreSelect.value),
                feedingTimestamp: feedingTimestamp.toISOString(),
                documentedTimestamp: new Date().toISOString(),
                isGoodScore: ['1', '2'].includes(newScoreSelect.value)
            };
            
            // Add entry and sort by feeding timestamp
            readinessScores = [...readinessScores, newEntry]
                .sort((a, b) => new Date(a.feedingTimestamp) - new Date(b.feedingTimestamp));
            
            // Reset form
            newScoreSelect.value = '';
            
            // Find next feeding time based on selected time
            const currentIndex = feedingTimeOptions.indexOf(feedingTimeSelect.value);
            const nextIndex = (currentIndex + 1) % feedingTimeOptions.length;
            feedingTimeSelect.value = feedingTimeOptions[nextIndex];
            
            // Update UI
            updateAddButtonState();
            updateHistoryTable();
            updateStats();
            checkThreshold();
            
            // Save to local storage
            saveToLocalStorage();
            
            // Update patient dropdown in case this is a new patient
            populatePatientDropdown();
        }
    }

    // Update the history table
    function updateHistoryTable() {
        if (readinessScores.length > 0) {
            historyTable.classList.remove('hidden');
            noScoresMessage.classList.add('hidden');
            
            // Clear the table
            historyTableBody.innerHTML = '';
            
            // Get recent scores
            const now = new Date();
            const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            
            // Add rows
            readinessScores.slice().reverse().forEach((entry, index) => {
                const row = document.createElement('tr');
                row.className = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                
                // Check if this entry is within the last 24 hours
                const isInLastDay = new Date(entry.feedingTimestamp) > twentyFourHoursAgo;
                
                // Feeding Date/Time
                const feedingTimeCell = document.createElement('td');
                feedingTimeCell.className = 'p-2 font-medium';
                feedingTimeCell.textContent = formatDate(entry.feedingTimestamp);
                row.appendChild(feedingTimeCell);
                
                // Documented Time
                const documentedTimeCell = document.createElement('td');
                documentedTimeCell.className = 'p-2 text-sm text-gray-500';
                documentedTimeCell.textContent = formatDate(entry.documentedTimestamp);
                row.appendChild(documentedTimeCell);
                
                // Score
                const scoreCell = document.createElement('td');
                scoreCell.className = `p-2 text-center font-bold ${entry.isGoodScore ? 'text-green-600' : ''}`;
                scoreCell.textContent = entry.score;
                row.appendChild(scoreCell);
                
                // Description
                const descriptionCell = document.createElement('td');
                descriptionCell.className = 'p-2';
                
                switch(entry.score) {
                    case 1:
                        descriptionCell.textContent = "Alert before care, sustained cues";
                        break;
                    case 2:
                        descriptionCell.textContent = "Alert once handled, sustained cues";
                        break;
                    case 3:
                        descriptionCell.textContent = "Alert state not sustained/no cues";
                        break;
                    case 4:
                        descriptionCell.textContent = "Sleeping, no hunger cues";
                        break;
                    case 5:
                        descriptionCell.textContent = "Physiologic compromise";
                        break;
                }
                
                row.appendChild(descriptionCell);
                
                // Counts for 50%
                const countsCell = document.createElement('td');
                countsCell.className = 'p-2 text-center';
                
                if (entry.isGoodScore) {
                    countsCell.innerHTML = '<span class="text-green-600 font-bold">✓</span>';
                } else {
                    countsCell.innerHTML = '<span class="text-red-600">✗</span>';
                }
                
                row.appendChild(countsCell);
                
                // In Last 24hr
                const lastDayCell = document.createElement('td');
                lastDayCell.className = 'p-2 text-center';
                
                if (isInLastDay) {
                    lastDayCell.innerHTML = '<span class="text-blue-600 font-bold">✓</span>';
                } else {
                    lastDayCell.innerHTML = '<span class="text-gray-400">✗</span>';
                }
                
                row.appendChild(lastDayCell);
                
                historyTableBody.appendChild(row);
            });
        } else {
            historyTable.classList.add('hidden');
            noScoresMessage.classList.remove('hidden');
        }
    }

    // Update statistics
    function updateStats() {
        const stats = getStats();
        
        totalScoresElement.textContent = stats.total;
        goodScoresElement.textContent = stats.good;
        
        if (stats.percent >= 50) {
            percentGoodElement.className = 'text-2xl font-bold text-green-600';
        } else {
            percentGoodElement.className = 'text-2xl font-bold text-gray-700';
        }
        
        percentGoodElement.textContent = `${stats.percent}%`;
        
        // Update timeline
        if (stats.total > 0) {
            timelineElement.classList.remove('hidden');
            timelineContainer.innerHTML = '';
            
            stats.recentScores.forEach(entry => {
                const scoreDiv = document.createElement('div');
                scoreDiv.className = 'flex-shrink-0 w-16 mr-1 text-center';
                
                const scoreBox = document.createElement('div');
                scoreBox.className = `h-16 flex items-center justify-center rounded ${
                    entry.isGoodScore ? 'bg-green-100 border border-green-400' : 'bg-gray-100 border border-gray-300'
                }`;
                
                const scoreText = document.createElement('span');
                scoreText.className = 'text-2xl font-bold';
                scoreText.textContent = entry.score;
                
                const timeText = document.createElement('div');
                timeText.className = 'text-xs mt-1';
                timeText.textContent = new Date(entry.feedingTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                
                scoreBox.appendChild(scoreText);
                scoreDiv.appendChild(scoreBox);
                scoreDiv.appendChild(timeText);
                
                timelineContainer.appendChild(scoreDiv);
            });
        } else {
            timelineElement.classList.add('hidden');
        }
        
        // Show appropriate notices
        waitingNotice.classList.add('hidden');
        thresholdMetNotice.classList.add('hidden');
        thresholdNotMetNotice.classList.add('hidden');
        
        if (stats.total > 0) {
            if (!stats.has24HoursData) {
                waitingNotice.classList.remove('hidden');
            } else if (stats.percent >= 50) {
                thresholdMetNotice.classList.remove('hidden');
                thresholdMetTimeElement.textContent = `Date/Time: ${formatDate(thresholdMetTime || new Date())}`;
            } else {
                thresholdNotMetNotice.classList.remove('hidden');
            }
        }
    }

    // Check if the threshold is met
    function checkThreshold() {
        const stats = getStats();
        
        if (stats.has24HoursData && stats.percent >= 50 && !thresholdMet) {
            thresholdMet = true;
            thresholdMetTime = new Date();
            saveToLocalStorage();
        }
    }

    // Calculate current stats
    function getStats() {
        if (readinessScores.length === 0) return { total: 0, good: 0, percent: 0, has24HoursData: false };
        
        // Get scores from the last 24 hours
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        
        const recentScores = readinessScores.filter(entry => 
            new Date(entry.feedingTimestamp) > twentyFourHoursAgo
        );
        
        // Check if we have a full 24 hours of data
        let has24HoursData = false;
        if (recentScores.length > 0) {
            const earliestTime = new Date(Math.min(...recentScores.map(entry => new Date(entry.feedingTimestamp).getTime())));
            const latestTime = new Date(Math.max(...recentScores.map(entry => new Date(entry.feedingTimestamp).getTime())));
            const hourDifference = (latestTime - earliestTime) / (1000 * 60 * 60);
            has24HoursData = hourDifference >= 24;
        }
        
        const goodScores = recentScores.filter(entry => entry.isGoodScore);
        const percentGood = recentScores.length > 0 ? 
            Math.round((goodScores.length / recentScores.length) * 100) : 0;
        
        return {
            total: recentScores.length,
            good: goodScores.length,
            percent: percentGood,
            recentScores: recentScores,
            has24HoursData: has24HoursData
        };
    }

    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    // Format time for display (convert 24h to 12h)
    function formatTimeFor12Hour(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }

    // Save to local storage
    function saveToLocalStorage() {
        const mrn = patientMRNInput.value;
        if (!mrn) return; // Don't save without an MRN
        
        const data = {
            patientName: patientNameInput.value || "Unknown",
            patientMRN: mrn,
            readinessScores: readinessScores,
            thresholdMet: thresholdMet,
            thresholdMetTime: thresholdMetTime
        };
        
        // Get existing patients list or create new one
        let patientsList = JSON.parse(localStorage.getItem('idfPatientsList') || '[]');
        if (!patientsList.includes(mrn)) {
            patientsList.push(mrn);
            localStorage.setItem('idfPatientsList', JSON.stringify(patientsList));
        }
        
        // Save this patient's data
        localStorage.setItem(`idfData_${mrn}`, JSON.stringify(data));
        
        // Update currentPatientMRN
        currentPatientMRN = mrn;
    }

    // Populate patient dropdown
    function populatePatientDropdown() {
        patientSelector.innerHTML = '<option value="">Select a patient</option>';
        
        const patientsList = JSON.parse(localStorage.getItem('idfPatientsList') || '[]');
        
        patientsList.forEach(mrn => {
            const patientDataString = localStorage.getItem(`idfData_${mrn}`);
            if (patientDataString) {
                try {
                    const patientData = JSON.parse(patientDataString);
                    const option = document.createElement('option');
                    option.value = mrn;
                    option.textContent = `${patientData.patientName || 'Unknown'} (${mrn})`;
                    patientSelector.appendChild(option);
                    
                    // Select current patient in dropdown
                    if (mrn === currentPatientMRN) {
                        option.selected = true;
                    }
                } catch (e) {
                    console.error('Error parsing patient data:', e);
                }
            }
        });
    }

    // Load patient data
    function loadPatientData(mrn) {
        const storedData = localStorage.getItem(`idfData_${mrn}`);
        
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                
                patientNameInput.value = data.patientName || '';
                patientMRNInput.value = mrn;
                readinessScores = data.readinessScores || [];
                thresholdMet = data.thresholdMet || false;
                thresholdMetTime = data.thresholdMetTime ? new Date(data.thresholdMetTime) : null;
                
                currentPatientMRN = mrn;
                
                updateHistoryTable();
                updateStats();
                updateAddButtonState();
                
                // Update dropdown to show the currently selected patient
                populatePatientDropdown();
            } catch (e) {
                console.error('Error loading patient data:', e);
            }
        }
    }

    // Load initial data
    function loadInitialData() {
        // Try to load last used patient
        const lastUsedPatient = localStorage.getItem('lastUsedPatient');
        if (lastUsedPatient) {
            loadPatientData(lastUsedPatient);
        }
    }
    
    // Try to load previously used patient data
    loadInitialData();
});
