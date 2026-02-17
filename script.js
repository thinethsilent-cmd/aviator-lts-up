/**
 * RNG BREACH v4.0.9 - Logic Core
 */

let entries = [];
let timerInterval = null;

// Loading lines for the hacker terminal effect
const loadingLines = [
    "> Init boot sequence...",
    "> Loading RNG kernels...",
    "> Fetching packet history...",
    "> Syncing server nodes...",
    "> Entrophy levels: HIGH",
    "> Bypassing security layers...",
    "> Injector module: READY",
    "> System online."
];

// 1. Loading Sequence
function startLoading() {
    let progress = 0;
    let lineIndex = 0;
    const bar = document.getElementById('progressBar');
    const text = document.getElementById('loadingText');

    const loader = setInterval(() => {
        progress += Math.random() * 8;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loader);
            finishLoading();
        }
        bar.style.width = progress + '%';
        document.getElementById('loadPercent').innerText = Math.floor(progress) + '%';

        if (Math.floor(progress / 12) > lineIndex && lineIndex < loadingLines.length) {
            const div = document.createElement('div');
            div.innerText = loadingLines[lineIndex];
            div.className = "mb-1 text-green-500 opacity-80";
            text.prepend(div);
            lineIndex++;
        }
    }, 100);
}

function finishLoading() {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            const app = document.getElementById('appContent');
            app.classList.remove('hidden');
            setTimeout(() => app.style.opacity = '1', 50);
            initApp();
        }, 800);
    }, 500);
}

// 2. Application Core
function initApp() {
    // Load local storage
    const saved = localStorage.getItem('breach_data_v4');
    if (saved) {
        entries = JSON.parse(saved);
        updateUI();
    }

    // Input Masking
    document.getElementById('timeInput').addEventListener('input', function(e) {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(0, 2) + ':' + val.slice(2);
        if (val.length > 5) val = val.slice(0, 5) + ':' + val.slice(5);
        e.target.value = val.slice(0, 8);
    });

    // Button Listeners
    document.getElementById('injectBtn').addEventListener('click', addEntry);
    document.getElementById('syncBtn').addEventListener('click', setCurrentTime);

    startSystemTicks();
}

function setCurrentTime() {
    const now = new Date();
    document.getElementById('timeInput').value = now.toTimeString().split(' ')[0];
}

function startSystemTicks() {
    const tickDisplay = document.getElementById('systemTickDisplay');
    const syncStatus = document.getElementById('syncStatusText');
    const statuses = ["STABLE", "SYNCING", "OPTIMIZING", "READING", "LOCKED"];
    
    setInterval(() => {
        tickDisplay.innerText = `TICK: ${Math.floor(Math.random() * 40) + 5}ms`;
        if (Math.random() > 0.9) {
            syncStatus.innerText = statuses[Math.floor(Math.random() * statuses.length)];
        }
    }, 600);
}

function addEntry() {
    const timeVal = document.getElementById('timeInput').value;
    const regex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    if (!regex.test(timeVal)) return;

    const [h, m, s] = timeVal.split(':').map(Number);
    const absSec = (h * 3600) + (m * 60) + s;

    if (entries.some(e => e.absSec === absSec)) return;

    entries.push({ time: timeVal, absSec });
    entries.sort((a, b) => a.absSec - b.absSec);
    localStorage.setItem('breach_data_v4', JSON.stringify(entries));
    updateUI();
}

function removeEntry(idx) {
    entries.splice(idx, 1);
    localStorage.setItem('breach_data_v4', JSON.stringify(entries));
    updateUI();
}

function updateUI() {
    const table = document.getElementById('dataTable');
    const empty = document.getElementById('emptyState');
    const dash = document.getElementById('predictionDashboard');
    
    table.innerHTML = '';
    
    if (entries.length === 0) {
        empty.classList.remove('hidden');
        dash.classList.add('hidden');
        return;
    }

    empty.classList.add('hidden');
    entries.forEach((entry, idx) => {
        let offset = idx > 0 ? (entry.absSec - entries[idx-1].absSec) : 0;
        let offsetStr = idx > 0 ? `${Math.floor(offset/60)}m ${offset%60}s` : '--';

        const tr = document.createElement('tr');
        tr.className = "border-b border-green-900/20";
        tr.innerHTML = `
            <td class="py-4 font-mono text-[10px] text-green-800">0x${idx.toString(16).toUpperCase()}</td>
            <td class="py-4 font-black text-white">${entry.time}</td>
            <td class="py-4 font-mono text-[10px]">${offsetStr}</td>
            <td class="py-4 text-right">
                <button onclick="removeEntry(${idx})" class="text-red-900 hover:text-red-500 font-bold">KILL</button>
            </td>
        `;
        table.appendChild(tr);
    });

    if (entries.length >= 3) {
        dash.classList.remove('hidden');
        calculateBreach();
    }
}

function calculateBreach() {
    const last = entries[entries.length - 1];
    const gaps = [];
    for (let i = 1; i < entries.length; i++) gaps.push(entries[i].absSec - entries[i-1].absSec);
    const avgGap = gaps.reduce((a, b) => a + b) / gaps.length;
    
    let targetSec = last.absSec + (avgGap * 1.5);
    const h = Math.floor(targetSec / 3600) % 24;
    const m = Math.floor((targetSec % 3600) / 60);
    document.getElementById('targetWindow').innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const now = new Date();
        const cur = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
        let diff = targetSec - cur;
        if (diff < -3600) diff += 86400;

        const countEl = document.getElementById('countdown');
        const probCircle = document.getElementById('probCircle');
        const probText = document.getElementById('probText');
        const sig2x = document.getElementById('signal2x');
        const sig4x = document.getElementById('signal4x');

        if (diff <= 30 && diff > -60) {
            countEl.innerText = "ACCESS";
            countEl.className = "text-5xl font-mono font-black text-green-400 animate-pulse";
            probText.innerText = "99%";
            probCircle.style.strokeDashoffset = "0";
            sig2x.innerText = "STABLE";
            sig2x.className = "text-xs font-bold text-green-500";
            sig4x.innerText = "ACTIVE";
            sig4x.className = "text-xs font-bold text-green-500";
        } else {
            const m = Math.floor(Math.abs(diff) / 60);
            const s = Math.floor(Math.abs(diff) % 60);
            countEl.innerText = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
            countEl.className = "text-5xl font-mono font-black text-white";
            
            const p = Math.max(10, 100 - (diff / 20));
            const currentProb = Math.min(Math.floor(p), 95);
            probText.innerText = currentProb + "%";
            probCircle.style.strokeDashoffset = 364 - (364 * (currentProb / 100));
            
            sig2x.innerText = currentProb > 60 ? "STABLE" : "SCANNING";
            sig2x.className = currentProb > 60 ? "text-xs font-bold text-green-500" : "text-xs font-bold text-gray-500";
            sig4x.innerText = currentProb > 80 ? "READY" : "SCANNING";
            sig4x.className = currentProb > 80 ? "text-xs font-bold text-green-500" : "text-xs font-bold text-gray-500";
        }
    }, 1000);
}

// Start sequence
window.onload = startLoading;