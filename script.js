// Check if user is logged in
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = "login.htm";
}

let data = JSON.parse(localStorage.getItem('fin_v_final')) || { inc: [], exp: [] };
let mainChart, pieChart;

// Initialize App
function init() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(i => i.value = today);
    
    loadProfile();
    setupCharts();
    renderAll();
}

// Chart Configurations
function setupCharts() {
    const ctx1 = document.getElementById('mainChart').getContext('2d');
    mainChart = new Chart(ctx1, {
        type: 'line',
        data: { 
            labels: ['W1', 'W2', 'W3', 'W4'], 
            datasets: [{ 
                label: 'Flow', 
                data: [0,0,0,0], 
                borderColor: '#6366f1', 
                fill: true, 
                backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                tension: 0.4 
            }] 
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const ctx2 = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(ctx2, {
        type: 'doughnut',
        data: { 
            labels: ['Income', 'Expense'], 
            datasets: [{ 
                data: [0,0], 
                backgroundColor: ['#10b981', '#f43f5e'], 
                borderWidth: 0 
            }] 
        },
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
    let n = prompt("Enter your new name:");
    if(n) { 
        document.getElementById('pName').innerText = n; 
        localStorage.setItem('u_name', n); 
    }
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
    const img = localStorage.getItem('u_img');
    const name = localStorage.getItem('u_name');
    
    if(img) {
        document.getElementById('pPic').innerHTML = `<img src="${img}" style="width:100%; height:100%; border-radius:50%">`;
    } else {
        document.getElementById('pPic').innerText = '👤';
    }
    
    if(name) {
        document.getElementById('pName').innerText = name;
    } else {
        // Try to get name from login
        const userName = localStorage.getItem('userName');
        if(userName) {
            document.getElementById('pName').innerText = userName;
        }
    }
}

// Data Handling
function handleSave(type) {
    const t = document.getElementById(`${type === 'inc' ? 'in' : 'ex'}-t`).value;
    const a = parseFloat(document.getElementById(`${type === 'inc' ? 'in' : 'ex'}-a`).value);
    const d = document.getElementById(`${type === 'inc' ? 'in' : 'ex'}-d`).value;
    
    if(!t || isNaN(a) || a <= 0) {
        alert("Please fill all details correctly!");
        return;
    }

    data[type].push({ id: Date.now(), title: t, amt: a, date: d });
    localStorage.setItem('fin_v_final', JSON.stringify(data));
    
    document.getElementById(`${type === 'inc' ? 'in' : 'ex'}-t`).value = '';
    document.getElementById(`${type === 'inc' ? 'in' : 'ex'}-a`).value = '';
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
    if (mainChart) {
        mainChart.data.datasets[0].data = [tI*0.2, tI*0.5, tI*0.8, bal];
        mainChart.update();
    }
    
    if (pieChart) {
        pieChart.data.datasets[0].data = [tI, tE];
        pieChart.update();
    }

    // Efficiency Report
    const eff = tI > 0 ? Math.round((bal/tI)*100) : 0;
    document.getElementById('eff-val').innerText = eff + '%';
    
    if (eff > 40) {
        document.getElementById('eff-msg').innerText = "Great Savings! 🔥";
        document.getElementById('eff-val').style.color = 'var(--income)';
    } else if (eff > 20) {
        document.getElementById('eff-msg').innerText = "Good Balance! 💪";
        document.getElementById('eff-val').style.color = 'var(--accent)';
    } else {
        document.getElementById('eff-msg').innerText = "High Expenses! ⚠️";
        document.getElementById('eff-val').style.color = 'var(--expense)';
    }

    renderSideLists();
    renderTable();
}

function renderSideLists() {
    const render = (type, id) => {
        const items = data[type].slice(-3).reverse();
        if (items.length === 0) {
            document.getElementById(id).innerHTML = '<p style="color:var(--text-dim); padding:20px;">No entries yet</p>';
            return;
        }
        document.getElementById(id).innerHTML = items.map(item => `
            <div class="item-row">
                <div>
                    <b>${item.title}</b>
                    <br>
                    <small style="color:var(--text-dim)">${item.date}</small>
                </div>
                <b style="color:var(--${type === 'inc' ? 'income' : 'expense'})">₹${item.amt}</b>
            </div>
        `).join('');
    };
    render('inc', 'side-inc-list');
    render('exp', 'side-exp-list');
}

function renderTable() {
    let all = [
        ...data.inc.map(i => ({...i, type: 'Credit'})), 
        ...data.exp.map(e => ({...e, type: 'Debit'}))
    ];
    all.sort((a,b) => new Date(b.date) - new Date(a.date));
    
    if (all.length === 0) {
        document.getElementById('full-table-body').innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; color:var(--text-dim); padding:40px;">
                    No transactions yet. Start adding incomes and expenses!
                </td>
            </tr>
        `;
        return;
    }
    
    document.getElementById('full-table-body').innerHTML = all.map(tr => `
        <tr>
            <td>${tr.date}</td>
            <td><b>${tr.title}</b></td>
            <td style="color:var(--${tr.type === 'Credit' ? 'income' : 'expense'})">${tr.type}</td>
            <td>₹${tr.amt}</td>
            <td>
                <button onclick="removeItem('${tr.type}', ${tr.id})" 
                    style="color:var(--expense); background:none; border:none; cursor:pointer; font-weight:600;">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function toggleTheme() {
    const h = document.documentElement;
    const isDark = h.getAttribute('data-theme') === 'dark';
    h.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.getElementById('tBtn').innerText = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        window.location.href = "login.htm";
    }
}

// Initialize on load
window.onload = init;
