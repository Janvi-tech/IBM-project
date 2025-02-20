document.addEventListener("DOMContentLoaded", function () {
    updateQualityScore();
    generateQualityChart();
    fetchLiveData();
});

// Simulated Quality Score
function updateQualityScore() {
    const score = Math.floor(Math.random() * 100); // Simulated Score (0-100)
    document.getElementById("quality-score").innerText = `${score}%`;
}

// Generate Data Quality Chart
function generateQualityChart() {
    const ctx = document.getElementById("qualityChart").getContext("2d");
    const chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Valid Data", "Warning Data", "Alert Data"],
            datasets: [{
                data: [0, 0, 0], // Initial Data
                backgroundColor: ["#28a745", "#ffc107", "#dc3545"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });

    // Function to update the chart data
    function updateChartData(data) {
        const statusCounts = { 'Valid': 0, 'Warning': 0, 'Alert': 0 };
        data.forEach(record => {
            statusCounts[record.status]++;
        });
        chart.data.datasets[0].data = [statusCounts['Valid'], statusCounts['Warning'], statusCounts['Alert']];
        chart.update();
    }

    // Fetch Live Data
    function fetchLiveData() {
        const tableBody = document.querySelector("#data-table tbody");
        tableBody.innerHTML = ""; // Clear Table

        const rawData = getRandomLiveData();
        rawData.forEach((record) => {
            const row = `
                <tr>
                    <td>${record.id}</td>
                    <td>${record.time}</td>
                    <td>${record.missing}</td>
                    <td>${record.errors}</td>
                    <td class="${record.status === 'Valid' ? 'text-success' : record.status === 'Warning' ? 'text-warning' : 'text-danger'}">
                        ${record.status}
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

        // Update chart data
        updateChartData(rawData);
    }

    // Initial data fetch
    fetchLiveData();

    // Refresh Data Every 5 Seconds
    setInterval(fetchLiveData, 5000);
    setInterval(updateQualityScore, 10000);
}

// Generate random live data
function getRandomLiveData() {
    const statuses = ['Valid', 'Warning', 'Alert'];
    const randomStatus = () => statuses[Math.floor(Math.random() * statuses.length)];
    const getTime = () => new Date().toLocaleTimeString();

    return Array.from({ length: 10 }, (_, i) => ({
        id: `tm${Math.floor(Math.random() * 100000)}`,
        time: getTime(),
        missing: Math.floor(Math.random() * 5),
        errors: Math.floor(Math.random() * 5),
        status: randomStatus(),
    }));
}

// Highlight anomalies in the data table and log flagged anomalies
function flagAnomalies() {
    const rows = document.querySelectorAll("#data-table tbody tr");
    let anomalyCount = 0;
    const anomalyLog = [];
    const anomaliesTableBody = document.querySelector("#anomalies-table tbody");
    anomaliesTableBody.innerHTML = ""; // Clear Table

    rows.forEach(row => {
        const status = row.cells[4].innerText;
        if (status === 'Warning' || status === 'Alert') {
            row.classList.add('table-danger');
            anomalyCount++;
            anomalyLog.push({
                id: row.cells[0].innerText,
                time: row.cells[1].innerText,
                status: status
            });
            const anomalyRow = `
                <tr>
                    <td>${row.cells[0].innerText}</td>
                    <td>${row.cells[1].innerText}</td>
                    <td class="${status === 'Warning' ? 'text-warning' : 'text-danger'}">${status}</td>
                </tr>
            `;
            anomaliesTableBody.insertAdjacentHTML("beforeend", anomalyRow);
        }
    });

    // Display summary of flagged anomalies
    const summary = `Flagged ${anomalyCount} anomalies:\n` + anomalyLog.map(anomaly => `ID: ${anomaly.id}, Time: ${anomaly.time}, Status: ${anomaly.status}`).join("\n");
    console.log(summary);
    alert(summary);
}

// Send notification email to admins
function notifyAdmins() {
    // Simulated email sending logic
    alert("Admins have been notified of data quality issues.");
}

// Export data quality report as CSV
function exportReport() {
    const rows = document.querySelectorAll("#data-table tbody tr");
    const csvContent = Array.from(rows).map(row => {
        const cells = row.querySelectorAll("td");
        return Array.from(cells).map(cell => cell.innerText).join(",");
    }).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data_quality_report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert("Exporting data quality report...");
}
