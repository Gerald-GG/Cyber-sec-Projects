// ============================================================================
// AUTHENTICATION & PAGE REDIRECTION LOGIC
// ============================================================================

// Check which page we're on and handle authentication
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

// Handle Login Page
if (currentPage === 'index.html' || currentPage === '') {
    document.addEventListener('DOMContentLoaded', function() {
        const loginForm = document.getElementById('loginForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const identifier = document.getElementById('identifier')?.value;
                const password = document.getElementById('password')?.value;
                
                // Basic validation
                if (!identifier || !password) {
                    alert('Please enter both username/email and password');
                    return;
                }
                
                // For demo: Accept any credentials
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userIdentifier', identifier);
                
                // Initialize progress for new user
                if (!localStorage.getItem('cyber_dashboard_progress')) {
                    localStorage.setItem('cyber_dashboard_progress', JSON.stringify({
                        checked: {},
                        currentLevel: "level1",
                        unlockedLevels: ["level1"]
                    }));
                }
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            });
        }
        
        // Check if user is already logged in
        if (localStorage.getItem('userLoggedIn') === 'true') {
            window.location.href = 'dashboard.html';
        }
    });
}

// Handle Register Page
else if (currentPage === 'register.html') {
    document.addEventListener('DOMContentLoaded', function() {
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
                
                // Check if user already exists
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
                
                // Auto-login after registration
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userIdentifier', username);
                
                // Initialize progress for new user
                localStorage.setItem('cyber_dashboard_progress', JSON.stringify({
                    checked: {},
                    currentLevel: "level1",
                    unlockedLevels: ["level1"]
                }));
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            });
        }
        
        // Check if user is already logged in
        if (localStorage.getItem('userLoggedIn') === 'true') {
            window.location.href = 'dashboard.html';
        }
    });
}

// Handle Dashboard Page
else if (currentPage === 'dashboard.html') {
    // Authentication check
    (function checkAuth() {
        const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        const hasProgress = localStorage.getItem('cyber_dashboard_progress');
        
        if (!isLoggedIn && !hasProgress) {
            window.location.href = 'index.html';
            return false;
        }
        
        if (!isLoggedIn && hasProgress) {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userIdentifier', 'Returning User');
        }
        
        return true;
    })();
    
    // ============================================================================
    // DASHBOARD FUNCTIONALITY WITH CLICK FIXES
    // ============================================================================
    
    document.addEventListener("DOMContentLoaded", () => {
        const STORAGE_KEY = "cyber_dashboard_progress";
        const UNLOCK_THRESHOLD = 70;

        const levelMap = {
            level1: { name: "Foundations", unlocks: "level2" },
            level2: { name: "Intermediate", unlocks: "level3" },
            level3: { name: "Advanced", unlocks: "level4" },
            level4: { name: "Expert", unlocks: null }
        };

        const completedDisplay = document.getElementById("completedCount");
        const skillDisplay = document.querySelector(".stat-card:nth-child(3) p");
        const currentLevelDisplay = document.querySelector(".stat-card:nth-child(2) p");

        // Load saved data
        const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
            checked: {},
            currentLevel: "level1",
            unlockedLevels: ["level1"]
        };

        /* =========================
           FIXED TOGGLE PROJECTS FUNCTION
        ========================= */
        window.toggleProjects = (levelId) => {
            // Check if level is unlocked
            if (!savedData.unlockedLevels.includes(levelId)) {
                const currentLevelName = levelMap[savedData.currentLevel]?.name || "the current level";
                const targetLevelName = levelMap[levelId]?.name || "this level";
                alert(`🔒 Complete ${UNLOCK_THRESHOLD}% of ${currentLevelName} to unlock ${targetLevelName}`);
                return;
            }

            // Hide all project lists
            document.querySelectorAll(".projects-list").forEach(list => {
                list.style.display = "none";
            });

            // Show selected project list
            const target = document.getElementById(levelId);
            if (target) {
                target.style.display = "block";
            }

            // Update active level styling - FIXED SELECTOR
            document.querySelectorAll(".level-card").forEach(card => {
                card.classList.remove("active-level");
            });
            
            // Find the level card that was clicked
            const allLevelCards = document.querySelectorAll('.level-card');
            allLevelCards.forEach(card => {
                const onclickAttr = card.getAttribute('onclick');
                if (onclickAttr && onclickAttr.includes(`toggleProjects('${levelId}')`)) {
                    card.classList.add("active-level");
                }
            });

            currentLevelDisplay.textContent = levelMap[levelId].name;
            savedData.currentLevel = levelId;
            saveData();
        };

        function saveData() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
        }

        function calculateLevelProgress(levelId) {
            const card = document.querySelector(`#${levelId}`);
            if (!card) return 0;
            
            const checkboxes = card.querySelectorAll("input[type='checkbox']");
            if (!checkboxes.length) return 0;
            
            const completed = [...checkboxes].filter(cb => cb.checked).length;
            const total = checkboxes.length;
            return Math.round((completed / total) * 100);
        }

        /* =========================
           FIXED UPDATE PROGRESS FUNCTION
        ========================= */
        function updateProgress() {
            let totalCompleted = 0;
            const newlyUnlocked = [];

            document.querySelectorAll(".level-card").forEach(card => {
                // Get level ID from onclick attribute
                const onclickAttr = card.getAttribute('onclick');
                const levelId = onclickAttr ? onclickAttr.match(/toggleProjects\('(level\d+)'\)/)?.[1] : null;
                
                if (!levelId) return;
                
                // Find corresponding projects list
                const projectsList = document.getElementById(levelId);
                if (!projectsList) return;
                
                const checkboxes = projectsList.querySelectorAll("input[type='checkbox']");
                const progressBar = card.querySelector(".progress");
                const progressText = card.querySelector("p");

                if (!checkboxes.length) return;

                const completed = [...checkboxes].filter(cb => cb.checked).length;
                const total = checkboxes.length;
                const percent = Math.round((completed / total) * 100);

                // Update progress bar
                if (progressBar) {
                    progressBar.style.width = percent + "%";
                }
                
                // Update progress text
                if (progressText) {
                    progressText.textContent = `Progress: ${completed} / ${total} projects (${percent}%)`;
                }

                // Handle unlock status
                if (levelMap[levelId]) {
                    // Add or update unlock status indicator
                    let unlockText = card.querySelector(".unlock-status");
                    if (!unlockText) {
                        unlockText = document.createElement("div");
                        unlockText.className = "unlock-status";
                        card.appendChild(unlockText);
                    }
                    
                    // Check if this level unlocks the next one
                    if (levelMap[levelId].unlocks && percent >= UNLOCK_THRESHOLD) {
                        const nextLevel = levelMap[levelId].unlocks;
                        if (!savedData.unlockedLevels.includes(nextLevel)) {
                            savedData.unlockedLevels.push(nextLevel);
                            newlyUnlocked.push(nextLevel);
                        }
                        unlockText.textContent = `✅ Unlocks: ${levelMap[nextLevel].name}`;
                        unlockText.style.color = "#4ade80";
                    } else if (levelMap[levelId].unlocks) {
                        unlockText.textContent = `🔒 ${UNLOCK_THRESHOLD}% required to unlock ${levelMap[levelMap[levelId].unlocks].name}`;
                        unlockText.style.color = "#94a3b8";
                    } else if (!levelMap[levelId].unlocks) {
                        unlockText.textContent = "🏁 Final Level";
                        unlockText.style.color = "#f59e0b";
                    }
                    
                    // Set basic unlock status styles
                    unlockText.style.fontSize = "0.85rem";
                    unlockText.style.marginTop = "8px";
                    unlockText.style.fontWeight = "500";
                    
                    // Update card appearance based on lock status
                    const isUnlocked = savedData.unlockedLevels.includes(levelId);
                    
                    if (!isUnlocked && levelId !== "level1") {
                        card.style.opacity = "0.7";
                        card.style.cursor = "not-allowed";
                        card.style.pointerEvents = "none"; // Disable clicks
                        
                        // Add lock overlay if not present
                        if (!card.querySelector(".lock-overlay")) {
                            const lockOverlay = document.createElement("div");
                            lockOverlay.className = "lock-overlay";
                            lockOverlay.innerHTML = "🔒";
                            lockOverlay.style.cssText = `
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                font-size: 2rem;
                                z-index: 2;
                                opacity: 0.5;
                            `;
                            card.appendChild(lockOverlay);
                        }
                    } else {
                        card.style.opacity = "1";
                        card.style.cursor = "pointer";
                        card.style.pointerEvents = "auto"; // Enable clicks
                        
                        // Remove lock overlay
                        const lockOverlay = card.querySelector(".lock-overlay");
                        if (lockOverlay) {
                            lockOverlay.remove();
                        }
                    }
                }

                totalCompleted += completed;
            });

            // Update global stats
            if (completedDisplay) {
                completedDisplay.textContent = `${totalCompleted} projects completed`;
            }
            
            if (skillDisplay) {
                skillDisplay.textContent = totalCompleted;
            }

            // Save updated unlocked levels
            saveData();

            // Show unlock notification
            if (newlyUnlocked.length > 0) {
                newlyUnlocked.forEach(unlockedId => {
                    showNotification(`🎉 Level Unlocked: ${levelMap[unlockedId].name}`);
                });
            }
        }

        function showNotification(message) {
            const existing = document.querySelector(".notification");
            if (existing) existing.remove();

            const notification = document.createElement("div");
            notification.className = "notification";
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                z-index: 1000;
                animation: slideIn 0.3s ease;
                font-weight: 500;
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = "slideOut 0.3s ease";
                setTimeout(() => notification.remove(), 300);
            }, 4000);
        }

        /* =========================
           RESTORE CHECKBOX STATE
        ========================= */
        function restoreCheckboxes() {
            document.querySelectorAll("input[type='checkbox']").forEach(cb => {
                // Create a unique ID for each checkbox
                const projectItem = cb.closest('.project-item') || cb.parentElement;
                const projectText = projectItem?.textContent?.trim() || '';
                const id = projectText || `project_${Math.random().toString(36).substr(2, 9)}`;

                if (savedData.checked[id]) {
                    cb.checked = true;
                }

                cb.addEventListener("change", () => {
                    savedData.checked[id] = cb.checked;
                    saveData();
                    updateProgress();
                });
            });
        }

        /* =========================
           INITIALIZE UI - WITH CLICK FIXES
        ========================= */
        function initializeUI() {
            // Add CSS for animations and styling
            const style = document.createElement("style");
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .level-card.active-level {
                    background: rgba(0, 234, 255, 0.1);
                    border-left: 4px solid #00eaff;
                    transform: translateY(-2px);
                    box-shadow: 0 0 25px rgba(0, 234, 255, 0.3);
                }
                .level-card {
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
            `;
            document.head.appendChild(style);

            // Setup level cards - ensure they're clickable
            document.querySelectorAll(".level-card").forEach(card => {
                const onclickAttr = card.getAttribute('onclick');
                const levelId = onclickAttr ? onclickAttr.match(/toggleProjects\('(level\d+)'\)/)?.[1] : null;
                
                if (levelId) {
                    const isUnlocked = savedData.unlockedLevels.includes(levelId);
                    
                    if (!isUnlocked && levelId !== "level1") {
                        // Locked level
                        card.style.opacity = "0.7";
                        card.style.cursor = "not-allowed";
                        card.style.pointerEvents = "none";
                        
                        // Add lock overlay
                        const lockOverlay = document.createElement("div");
                        lockOverlay.className = "lock-overlay";
                        lockOverlay.innerHTML = "🔒";
                        lockOverlay.style.cssText = `
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            font-size: 2rem;
                            z-index: 2;
                            opacity: 0.5;
                        `;
                        card.appendChild(lockOverlay);
                    } else {
                        // Unlocked level
                        card.style.opacity = "1";
                        card.style.cursor = "pointer";
                        card.style.pointerEvents = "auto";
                        
                        // Make sure no lock overlay
                        const lockOverlay = card.querySelector(".lock-overlay");
                        if (lockOverlay) {
                            lockOverlay.remove();
                        }
                    }
                }
            });

            // Set initial active level
            if (savedData.currentLevel && savedData.unlockedLevels.includes(savedData.currentLevel)) {
                // Add slight delay to ensure DOM is ready
                setTimeout(() => {
                    toggleProjects(savedData.currentLevel);
                }, 100);
            } else if (savedData.unlockedLevels.length > 0) {
                setTimeout(() => {
                    toggleProjects(savedData.unlockedLevels[0]);
                }, 100);
            }
        }

        /* =========================
           RESET PROGRESS
        ========================= */
        window.resetProgress = () => {
            if (confirm("Reset all progress? This will clear all completed projects and level unlocks.")) {
                localStorage.removeItem(STORAGE_KEY);
                // Re-initialize with default data
                localStorage.setItem('cyber_dashboard_progress', JSON.stringify({
                    checked: {},
                    currentLevel: "level1",
                    unlockedLevels: ["level1"]
                }));
                location.reload();
            }
        };

        /* =========================
           LOGOUT
        ========================= */
        window.logout = () => {
            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('userIdentifier');
            window.location.href = "index.html";
        };

        // Initialize everything
        initializeUI();
        restoreCheckboxes();
        updateProgress();
        
        // Debug: Check if level cards have click handlers
        console.log("Dashboard initialized. Level cards found:", document.querySelectorAll('.level-card').length);
    });
}