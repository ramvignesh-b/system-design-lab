const cpuCtx = document.getElementById('cpuChart').getContext('2d');
const memoryCtx = document.getElementById('memoryChart').getContext('2d');
const logList = document.getElementById('log-list');
const statusDiv = document.getElementById('status');
const cpuValue = document.getElementById('cpu-value');
const memoryValue = document.getElementById('memory-value');

// Data structures for monitoring charts
const chartMaxDataPoints = 30;
const chartLabels = Array.from({ length: chartMaxDataPoints }, (_, i) => '');
const cpuData = Array(chartMaxDataPoints).fill(0);
const memoryData = Array(chartMaxDataPoints).fill(0);

// Initialize Chart.js
const cpuChart = new Chart(cpuCtx, {
    type: 'line',
    data: {
        labels: chartLabels,
        datasets: [{
            label: 'CPU Usage',
            borderColor: '#3fb950', // Success green
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            backgroundColor: 'rgba(63, 185, 80, 0.1)',
            tension: 0.4,
            data: cpuData
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { beginAtZero: true, max: 10, grid: { color: 'rgba(48, 54, 61, 0.5)' }, ticks: { color: '#8b949e' } },
            x: { display: false }
        },
        plugins: { legend: { display: false } }
    }
});

const memChart = new Chart(memoryCtx, {
    type: 'line',
    data: {
        labels: chartLabels,
        datasets: [{
            label: 'Memory Usage',
            borderColor: '#58a6ff', // Primary blue
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            backgroundColor: 'rgba(88, 166, 255, 0.1)',
            tension: 0.4,
            data: memoryData
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { beginAtZero: true, max: 100, grid: { color: 'rgba(48, 54, 61, 0.5)' }, ticks: { color: '#8b949e' } },
            x: { display: false }
        },
        plugins: { legend: { display: false } }
    }
});

// Setup WebSocket connection
function connectWebSocket() {
    const socket = new WebSocket(`ws://${window.location.host}`);

    socket.onopen = () => {
        console.log('--- Bridge Connection Established ---');
        statusDiv.className = 'status-indicator online';
        statusDiv.innerText = 'Connected';
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'STATUS') return;

        // Update Values
        cpuValue.innerText = `${data.cpu} (Load)`;
        memoryValue.innerText = `${data.memory}%`;

        // Update Charts
        updateChart(cpuChart, data.cpu);
        updateChart(memChart, data.memory);

        // Update Log
        addLogEntry(`[${data.timestamp}] CPU: ${data.cpu} | MEM: ${data.memory}%`);
    };

    socket.onclose = () => {
        statusDiv.className = 'status-indicator searching';
        statusDiv.innerText = 'Disconnected. Retrying...';
        setTimeout(connectWebSocket, 3000);
    };
}

function updateChart(chart, newValue) {
    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data.push(newValue);
    chart.update('none'); // Update without animation for performance
}

function addLogEntry(message) {
    const li = document.createElement('li');
    li.innerText = message;
    logList.insertBefore(li, logList.firstChild);
    if (logList.children.length > 20) {
        logList.removeChild(logList.lastChild);
    }
}

connectWebSocket();
