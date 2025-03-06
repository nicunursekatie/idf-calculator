                const patientData = JSON.parse(storedData);
                
                currentPatientMRN = mrn;
                currentPatientNameElement.textContent = patientData.patientName || "Unknown";
                currentPatientMRNElement.textContent = patientData.patientMRN;
                
                readinessScores = patientData.readinessScores || [];
                thresholdMet = patientData.thresholdMet || false;
                thresholdMetTime = patientData.thresholdMetTime ? new Date(patientData.thresholdMetTime) : null;
                
                updateHistoryTable();
                updateStats();
                
                // Store last used patient
                localStorage.setItem('lastUsedPatient', currentPatientMRN);
            } catch (e) {
                console.error("Error loading patient data:", e);
            }
        }
    }

    // Auto-load last used patient on page load
    const lastUsedPatient = localStorage.getItem('lastUsedPatient');
    if (lastUsedPatient) {
        loadPatientData(lastUsedPatient);
    }
});
