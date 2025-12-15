// auth.js - Authentication functionality for login and register pages

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Redirect already logged in users to dashboard
    if (localStorage.getItem('userLoggedIn') === 'true') {
        if (currentPage === 'index.html' || currentPage === 'register.html') {
            window.location.href = 'dashboard.html';
            return;
        }
    }
    
    // Handle Login Page
    if (currentPage === 'index.html' || currentPage === '') {
        const loginForm = document.getElementById('loginForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const identifier = document.getElementById('identifier')?.value;
                const password = document.getElementById('password')?.value;
                
                if (!identifier || !password) {
                    alert('Please enter both username/email and password');
                    return;
                }
                
                // Simple demo login (accepts any credentials)
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userIdentifier', identifier);
                
                // Initialize progress if it doesn't exist
                if (!localStorage.getItem('cyber_dashboard_progress')) {
                    localStorage.setItem('cyber_dashboard_progress', JSON.stringify({
                        checked: {},
                        currentLevel: "level1",
                        unlockedLevels: ["level1"]
                    }));
                }
                
                window.location.href = 'dashboard.html';
            });
        }
    }
    
    // Handle Register Page
    else if (currentPage === 'register.html') {
        const registerForm = document.getElementById('registerForm');
        
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const username = document.getElementById('registerUsername')?.value;
                const email = document.getElementById('registerEmail')?.value;
                const password = document.getElementById('registerPassword')?.value;
                const confirmPassword = document.getElementById('confirmPassword')?.value;
                
                // Validation
                if (!username || !email || !password || !confirmPassword) {
                    alert('Please fill in all fields');
                    return;
                }
                
                if (password !== confirmPassword) {
                    alert('Passwords do not match');
                    return;
                }
                
                if (password.length < 6) {
                    alert('Password must be at least 6 characters');
                    return;
                }
                
                // Save user data
                const users = JSON.parse(localStorage.getItem('cyberUsers') || '[]');
                
                // Check if user exists
                const userExists = users.some(user => user.email === email || user.username === username);
                if (userExists) {
                    alert('User with this email or username already exists');
                    return;
                }
                
                // Add new user
                users.push({
                    username,
                    email,
                    password,
                    joined: new Date().toISOString()
                });
                
                localStorage.setItem('cyberUsers', JSON.stringify(users));
                
                // Auto-login
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userIdentifier', username);
                
                // Initialize progress
                localStorage.setItem('cyber_dashboard_progress', JSON.stringify({
                    checked: {},
                    currentLevel: "level1",
                    unlockedLevels: ["level1"]
                }));
                
                window.location.href = 'dashboard.html';
            });
        }
    }
});