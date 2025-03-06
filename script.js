<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IDF 24-Hour Assessment Calculator</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        .card {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body class="bg-gray-100 min-h-screen p-4">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold text-blue-700 mb-6">IDF 24-Hour Assessment Calculator</h1>
        
        <!-- Patient Management -->
        <div class="mb-6 p-4 bg-gray-100 rounded-lg">
            <h2 class="text-xl font-semibold text-blue-700 mb-4">Patient Management</h2>
            
            <!-- Add New Patient -->
            <div class="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 class="text-lg font-medium mb-2">Add New Patient</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Patient Name:</label>
                        <input type="text" id="newPatientName" class="p-2 border rounded w-full">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">MRN:</label>
                        <input type="text" id="newPatientMRN" class="p-2 border rounded w-full">
                    </div>
                </div>
                <button id="addPatientBtn" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Add New Patient
                </button>
            </div>
            
            <!-- Select Existing Patient -->
            <div class="p-4 bg-blue-50 rounded-lg">
                <h3 class="text-lg font-medium mb-2">Select Existing Patient</h3>
                <div class="flex items-center mb-2">
                    <select id="patientSelector" class="p-2 border rounded mr-2 flex-grow"></select>
                    <button id="loadPatientBtn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Load Patient</button>
                </div>
                <div class="flex justify-end">
                    <button id="clearDataBtn" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Clear Current Patient Data
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Current Patient Info -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 class="text-xl font-semibold text-blue-700 mb-2">Current Patient</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                    <p id="currentPatientName" class="p-2 bg-white border rounded">No patient selected</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">MRN:</label>
                    <p id="currentPatientMRN" class="p-2 bg-white border rounded">-</p>
                </div>
            </div>
        </div>
        
        <!-- Current Status -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 class="text-xl font-semibold text-blue-700 mb-2">Current 24-Hour Status</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div class="p-3 bg-white rounded shadow">
                    <p class="text-sm text-gray-500">Feedings in Last 24 Hrs</p>
                    <p class="text-2xl font-bold" id="totalScores">0</p>
                </div>
                <div class="p-3 bg-white rounded shadow">
                    <p class="text-sm text-gray-500">Scores of 1-2</p>
                    <p class="text-2xl font-bold" id="goodScores">0</p>
                </div>
                <div class="p-3 bg-white rounded shadow">
                    <p class="text-sm text-gray-500">Percentage</p>
                    <p class="text-2xl font-bold" id="percentGood">0%</p>
                </div>
            </div>
            
            <div id="timeline" class="mt-4 p-3 bg-white rounded hidden">
                <h3 class="font-medium text-blue-700 mb-2">Recent Scores Timeline:</h3>
                <div id="timelineContainer" class="flex overflow-x-auto pb-2"></div>
            </div>
            
            <div id="waitingNotice" class="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 hidden">
                <p class="font-bold">Collecting 24 Hours of Data</p>
                <p>Need assessment data spanning a full 24-hour period to determine if threshold is met.</p>
            </div>
            
            <div id="thresholdMet" class="mt-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 hidden">
                <p class="font-bold">50% Threshold Met!</p>
                <p id="thresholdMetTime"></p>
                <p>The infant is ready to begin oral feedings per IDF protocol.</p>
            </div>
            
            <div id="thresholdNotMet" class="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 hidden">
                <p class="font-bold">Threshold Not Met</p>
                <p>Full 24 hours of data collected, but less than 50% of scores are 1-2.</p>
            </div>
        </div>
        
        <!-- Add New Score -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 class="text-xl font-semibold text-blue-700 mb-2">Add New Readiness Score</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Feeding Date:</label>
                    <input type="date" id="feedingDate" class="p-2 border rounded w-full">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Feeding Time:</label>
                    <select id="feedingTime" class="p-2 border rounded w-full"></select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Readiness Score:</label>
                    <select id="newScore" class="p-2 border rounded w-full">
                        <option value="">Select a score</option>
                        <option value="1">1 - Alert before care, sustained cues</option>
                        <option value="2">2 - Alert once handled, sustained cues</option>
                        <option value="3">3 - Alert state not sustained/no cues</option>
                        <option value="4">4 - Sleeping, no hunger cues</option>
                        <option value="5">5 - Physiologic compromise</option>
                    </select>
                </div>
            </div>
            
            <button id="addScoreBtn" class="px-4 py-2 rounded bg-gray-300 cursor-not-allowed">
                Add Assessment
            </button>
        </div>
        
        <!-- Score History -->
        <div class="p-4 bg-blue-50 rounded-lg">
            <h2 class="text-xl font-semibold text-blue-700 mb-2">Assessment History</h2>
            <div id="historyContainer" class="overflow-auto max-h-64">
                <p class="text-gray-500 italic" id="noScoresMessage">No assessments recorded yet.</p>
                <table id="historyTable" class="min-w-full bg-white hidden">
                    <thead>
                        <tr class="bg-blue-100">
                            <th class="p-2 text-left">Feeding Date/Time</th>
                            <th class="p-2 text-left">Documented</th>
                            <th class="p-2 text-center">Score</th>
                            <th class="p-2 text-left">Description</th>
                            <th class="p-2 text-center">Counts for 50%</th>
                            <th class="p-2 text-center">In Last 24hr</th>
                        </tr>
                    </thead>
                    <tbody id="historyTableBody"></tbody>
                </table>
            </div>
        </div>
    </div>
    
    <script src="script.js"></script>
</body>
</html>
