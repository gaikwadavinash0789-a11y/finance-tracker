const loginFormBox = document.getElementById('loginForm')
const signupFormBox = document.getElementById('signupForm')
const showSignup = document.getElementById('showSignup')
const showLogin = document.getElementById('showLogin')

showSignup.onclick = () => {
    loginFormBox.classList.add('hidden')
    signupFormBox.classList.remove('hidden')
}

showLogin.onclick = () => {
    signupFormBox.classList.add('hidden')
    loginFormBox.classList.remove('hidden')
}

document.getElementById('loginSubmit').onsubmit = function(e){
    e.preventDefault()
    handleAuth('login')
}

document.getElementById('signupSubmit').onsubmit = function(e){
    e.preventDefault()
    handleAuth('signup')
}

function handleAuth(type){
    const pass = type === 'login' 
        ? document.getElementById('l-pass').value 
        : document.getElementById('s-pass').value
    
    // For demo purposes, password is "1234"
    // In real app, you would validate against a backend
    if(pass === "1234"){
        localStorage.setItem('isLoggedIn', 'true')
        
        // Store user info if signing up
        if(type === 'signup'){
            const name = document.getElementById('s-name').value
            const email = document.getElementById('s-email').value
            localStorage.setItem('userName', name)
            localStorage.setItem('userEmail', email)
        }
        
        window.location.href = "Dashbord.html"
    }else{
        alert("Wrong password! Use 1234")
    }
}

let myChart

function initChart(theme){
    const ctx = document.getElementById('bgChart').getContext('2d')
    
    myChart = new Chart(ctx,{
        type:'line',
        data:{
            labels:['A','B','C','D','E'],
            datasets:[{
                data:[20,40,30,50,40],
                borderColor: theme==='dark' ? '#38bdf8' : '#2563eb',
                fill:true,
                tension:0.4,
                backgroundColor: theme==='dark' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(37, 99, 235, 0.1)'
            }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            plugins:{legend:{display:false}},
            scales:{x:{display:false}, y:{display:false}}
        }
    })
}

window.onload = () => initChart('dark')

const themeBtn = document.getElementById('themeSwitcher')

themeBtn.onclick = () => {
    const root = document.documentElement
    const current = root.getAttribute('data-theme')
    const next = current === 'dark' ? 'light' : 'dark'
    root.setAttribute('data-theme', next)
    myChart.destroy()
    initChart(next)
}