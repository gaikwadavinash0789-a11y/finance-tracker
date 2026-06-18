let data = JSON.parse(localStorage.getItem('fin_v_final')) || { inc: [], exp: [] };
let mainChart, pieChart;

// Initialize App
function init() {
    setupCharts();
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(i => i.value = today);
    loadProfile();
    renderAll();
}

// Chart Configurations
function setupCharts() {
    const ctx1 = document.getElementById('mainChart').getContext('2d');
    mainChart = new Chart(ctx1, {
        type: 'line',
        data: { labels: ['W1', 'W2', 'W3', 'W4'], datasets: [{ label: 'Flow', data: [0,0,0,0], borderColor: '#6366f1', fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)', tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const ctx2 = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(ctx2, {
        type: 'doughnut',
        data: { labels: ['Income', 'Expense'], datasets: [{ data: [0,0], backgroundColor: ['#10b981', '#f43f5e'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Tab Switching Logic
function switchTab(tabId, element) {
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('tab-' + tabId).classList.add('active');
}

// Profile Logic
function editN() {
    let n = prompt("Naya naam likhein:");
    if(n) { document.getElementById('pName').innerText = n; localStorage.setItem('u_name', n); }
}

function upImg(input) {
    if (input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = (e) => {
            document.getElementById('pPic').innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; border-radius:50%">`;
            localStorage.setItem('u_img', e.target.result);
        };
        r.readAsDataURL(input.files[0]);
    }
}

function loadProfile() {
    const i = localStorage.getItem('u_img'), n = localStorage.getItem('u_name');
    if(i) document.getElementById('pPic').innerHTML = `<img src="${i}" style="width:100%; height:100%; border-radius:50%">`;
    if(n) document.getElementById('pName').innerText = n;
}

// Data Handling
function handleSave(type) {
    const t = document.getElementById(`${type==='inc'?'in':'ex'}-t`).value;
    const a = parseFloat(document.getElementById(`${type==='inc'?'in':'ex'}-a`).value);
    const d = document.getElementById(`${type==='inc'?'in':'ex'}-d`).value;
    
    if(!t || isNaN(a)) return alert("Saari details bhariye!");

    data[type].push({ id: Date.now(), title: t, amt: a, date: d });
    localStorage.setItem('fin_v_final', JSON.stringify(data));
    
    document.getElementById(`${type==='inc'?'in':'ex'}-t`).value = '';
    document.getElementById(`${type==='inc'?'in':'ex'}-a`).value = '';
    renderAll();
}

function removeItem(type, id) {
    const key = type === 'Credit' ? 'inc' : 'exp';
    data[key] = data[key].filter(x => x.id !== id);
    localStorage.setItem('fin_v_final', JSON.stringify(data));
    renderAll();
}

function renderAll() {
    let tI = data.inc.reduce((s, x) => s + x.amt, 0);
    let tE = data.exp.reduce((s, x) => s + x.amt, 0);
    let bal = tI - tE;

document.getElementById('total-inc').innerText = `₹${tI}`;
document.getElementById('total-exp').innerText = `₹${tE}`;
document.getElementById('total-bal').innerText = `₹${bal}`;

    // Update Charts
    mainChart.data.datasets[0].data = [tI*0.2, tI*0.5, tI*0.8, bal];
    mainChart.update();
    pieChart.data.datasets[0].data = [tI, tE];
    pieChart.update();

    // Efficiency Report
    const eff = tI > 0 ? Math.round((bal/tI)*100) : 0;
    document.getElementById('eff-val').innerText = eff + '%';
    document.getElementById('eff-msg').innerText = eff > 40 ? "Great Savings! 🔥" : "High Expenses! ⚠️";

    renderSideLists();
    renderTable();
}

function renderSideLists() {
    const render = (type, id) => {
        document.getElementById(id).innerHTML = data[type].slice(-3).reverse().map(item => `
            <div class="item-row">
                <div><b>${item.title}</b><br><small>${item.date}</small></div>
<b style="color:var(--${type==='inc'?'income':'expense'})">₹${item.amt}</b>
            </div>`).join('');
    };
    render('inc', 'side-inc-list');
    render('exp', 'side-exp-list');
}

function renderTable() {
    let all = [...data.inc.map(i=>({...i, type:'Credit'})), ...data.exp.map(e=>({...e, type:'Debit'}))];
    all.sort((a,b) => new Date(b.date) - new Date(a.date));
    document.getElementById('full-table-body').innerHTML = all.map(tr => `
        <tr>
            <td>${tr.date}</td>
            <td><b>${tr.title}</b></td>
            <td style="color:var(--${tr.type==='Credit'?'income':'expense'})">${tr.type}</td>
<td>₹${tr.amt}</td>
            <td><button onclick="removeItem('${tr.type}', ${tr.id})" style="color:var(--expense); background:none; border:none; cursor:pointer">Delete</button></td>
        </tr>`).join('');
}

function toggleTheme() {
    const h = document.documentElement;
    const isDark = h.getAttribute('data-theme') === 'dark';
    h.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.getElementById('tBtn').innerText = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

window.onload = init;