// dashboard.js - Final working version

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

// Main dashboard functionality
document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard initializing...");
    
    const STORAGE_KEY = "cyber_dashboard_progress";
    const UNLOCK_THRESHOLD = 70;

    const levelMap = {
        level1: { name: "Foundations", unlocks: "level2" },
        level2: { name: "Intermediate", unlocks: "level3" },
        level3: { name: "Advanced", unlocks: "level4" },
        level4: { name: "Expert", unlocks: null }
    };

    // Load saved data
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        checked: {},
        currentLevel: "level1",
        unlockedLevels: ["level1"]
    };

    /* =========================
       HELPER FUNCTIONS
    ========================= */
    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
    }
    
    function showNotification(message) {
        const existing = document.querySelector(".notification");
        if (existing) existing.remove();
        
        const notification = document.createElement("div");
        notification.className = "notification";
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = "slideOut 0.3s ease";
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    /* =========================
       TOGGLE PROJECTS FUNCTION
    ========================= */
    window.toggleProjects = function(levelId) {
        console.log("Clicked level:", levelId);
        
        // Check if level is unlocked
        if (!savedData.unlockedLevels.includes(levelId)) {
            alert(`🔒 Complete ${UNLOCK_THRESHOLD}% of the previous level to unlock ${levelMap[levelId]?.name}`);
            return;
        }
        
        // Hide all project lists
        document.querySelectorAll(".projects-list").forEach(list => {
            list.style.display = "none";
        });
        
        // Show clicked level's projects
        const targetList = document.getElementById(levelId);
        if (targetList) {
            targetList.style.display = "block";
        }
        
        // Update active card styling
        document.querySelectorAll(".level-card").forEach(card => {
            card.classList.remove("active-level");
        });
        
        // Find and activate the clicked card
        document.querySelectorAll(".level-card").forEach(card => {
            if (card.getAttribute('onclick')?.includes(levelId)) {
                card.classList.add("active-level");
            }
        });
        
        // Update current level display
        const currentLevelDisplay = document.getElementById("currentLevelDisplay");
        if (currentLevelDisplay && levelMap[levelId]) {
            currentLevelDisplay.textContent = levelMap[levelId].name;
        }
        
        savedData.currentLevel = levelId;
        saveData();
    };
    
    /* =========================
       CALCULATE AND UPDATE PROGRESS
    ========================= */
    function updateProgress() {
        let totalCompleted = 0;
        const newlyUnlocked = [];
        
        // Process each level
        Object.keys(levelMap).forEach(levelId => {
            const projectsList = document.getElementById(levelId);
            if (!projectsList) return;
            
            const checkboxes = projectsList.querySelectorAll("input[type='checkbox']");
            const completed = [...checkboxes].filter(cb => cb.checked).length;
            const total = checkboxes.length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            totalCompleted += completed;
            
            // Find corresponding level card
            const levelCard = document.querySelector(`.level-card[onclick*="${levelId}"]`);
            if (!levelCard) return;
            
            // Update progress bar
            const progressBar = levelCard.querySelector(".progress");
            if (progressBar) {
                progressBar.style.width = `${percent}%`;
            }
            
            // Update progress text
            const progressText = levelCard.querySelector("p");
            if (progressText) {
                progressText.textContent = `Progress: ${completed} / ${total} projects (${percent}%)`;
            }
            
            // Handle unlock status display
            let unlockText = levelCard.querySelector(".unlock-status");
            if (!unlockText) {
                unlockText = document.createElement("div");
                unlockText.className = "unlock-status";
                levelCard.appendChild(unlockText);
            }
            
            if (levelMap[levelId].unlocks) {
                if (percent >= UNLOCK_THRESHOLD) {
                    const nextLevel = levelMap[levelId].unlocks;
                    if (!savedData.unlockedLevels.includes(nextLevel)) {
                        savedData.unlockedLevels.push(nextLevel);
                        newlyUnlocked.push(nextLevel);
                    }
                    unlockText.textContent = `✅ Unlocks: ${levelMap[nextLevel].name}`;
                    unlockText.style.color = "#4ade80";
                } else {
                    unlockText.textContent = `🔒 ${UNLOCK_THRESHOLD}% required to unlock ${levelMap[levelMap[levelId].unlocks].name}`;
                    unlockText.style.color = "#94a3b8";
                }
            } else {
                unlockText.textContent = "🏁 Final Level";
                unlockText.style.color = "#f59e0b";
            }
            
            // Update card lock status
            const isUnlocked = savedData.unlockedLevels.includes(levelId);
            if (!isUnlocked && levelId !== "level1") {
                levelCard.classList.add("locked");
                
                // Add lock overlay if not present
                if (!levelCard.querySelector(".lock-overlay")) {
                    const lockOverlay = document.createElement("div");
                    lockOverlay.className = "lock-overlay";
                    lockOverlay.innerHTML = "🔒";
                    levelCard.appendChild(lockOverlay);
                }
            } else {
                levelCard.classList.remove("locked");
                const lockOverlay = levelCard.querySelector(".lock-overlay");
                if (lockOverlay) {
                    lockOverlay.remove();
                }
            }
        });
        
        // Update global stats
        const completedDisplay = document.getElementById("completedCount");
        const skillDisplay = document.getElementById("skillsDisplay");
        
        if (completedDisplay) completedDisplay.textContent = `${totalCompleted} projects completed`;
        if (skillDisplay) skillDisplay.textContent = totalCompleted;
        
        saveData();
        
        // Show unlock notifications
        if (newlyUnlocked.length > 0) {
            newlyUnlocked.forEach(unlockedId => {
                showNotification(`🎉 Level Unlocked: ${levelMap[unlockedId].name}`);
            });
        }
    }
    
    /* =========================
       SETUP CHECKBOXES
    ========================= */
    function setupCheckboxes() {
        document.querySelectorAll("input[type='checkbox']").forEach((cb, index) => {
            // Create unique ID if needed
            if (!cb.id) {
                cb.id = `checkbox-${index}`;
            }
            
            // Find label
            const label = cb.nextElementSibling?.tagName === 'LABEL' ? cb.nextElementSibling : null;
            if (label && !label.getAttribute('for')) {
                label.setAttribute('for', cb.id);
            }
            
            // Create storage key
            const storageKey = label?.textContent?.trim() || cb.id;
            
            // Restore state
            if (savedData.checked[storageKey]) {
                cb.checked = true;
            }
            
            // Add event listener
            cb.addEventListener("change", () => {
                savedData.checked[storageKey] = cb.checked;
                saveData();
                updateProgress();
            });
        });
    }
    
    /* =========================
       INITIALIZE DASHBOARD
    ========================= */
    function initializeDashboard() {
        console.log("Setting up dashboard...");
        
        // Setup checkboxes
        setupCheckboxes();
        
        // Set initial active level
        const initialLevel = savedData.currentLevel || "level1";
        if (savedData.unlockedLevels.includes(initialLevel)) {
            toggleProjects(initialLevel);
        } else {
            toggleProjects("level1");
        }
        
        // Initial progress update
        updateProgress();
        
        console.log("Dashboard ready!");
    }
    
    /* =========================
       GLOBAL FUNCTIONS
    ========================= */
    window.resetProgress = () => {
        if (confirm("Reset all progress? This will clear all completed projects and level unlocks.")) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.setItem('cyber_dashboard_progress', JSON.stringify({
                checked: {},
                currentLevel: "level1",
                unlockedLevels: ["level1"]
            }));
            location.reload();
        }
    };
    
    window.logout = () => {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userIdentifier');
        window.location.href = "index.html";
    };
    
    window.startNextProject = () => {
        alert("Starting next project...");
    };
    
    window.viewRoadmap = () => {
        alert("Viewing full roadmap...");
    };
    
    window.trackProgress = () => {
        const total = Object.values(savedData.checked).filter(v => v).length;
        alert(`You've completed ${total} projects!`);
    };
    
    // Initialize everything
    initializeDashboard();
});