// dashboard.js - Dashboard functionality with level locking system

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
    console.log("Dashboard loading...");
    
    const STORAGE_KEY = "cyber_dashboard_progress";
    const UNLOCK_THRESHOLD = 70;

    const levelMap = {
        level1: { name: "Foundations", unlocks: "level2" },
        level2: { name: "Intermediate", unlocks: "level3" },
        level3: { name: "Advanced", unlocks: "level4" },
        level4: { name: "Expert", unlocks: null }
    };

    const completedDisplay = document.getElementById("completedCount");
    const skillDisplay = document.getElementById("skillsDisplay");
    const currentLevelDisplay = document.getElementById("currentLevelDisplay");

    // Load saved data
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        checked: {},
        currentLevel: "level1",
        unlockedLevels: ["level1"]
    };

    /* =========================
       CORE FUNCTIONS
    ========================= */
    
    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
        console.log("Data saved:", savedData);
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
       LEVEL CLICK HANDLER - SIMPLIFIED
    ========================= */
    window.toggleProjects = function(levelId) {
        console.log("toggleProjects called for:", levelId);
        
        // Check if level is unlocked
        if (!savedData.unlockedLevels.includes(levelId)) {
            const targetLevelName = levelMap[levelId]?.name || "this level";
            alert(`🔒 Complete ${UNLOCK_THRESHOLD}% of the previous level to unlock ${targetLevelName}`);
            return false;
        }

        // Hide all project lists
        document.querySelectorAll(".projects-list").forEach(list => {
            list.style.display = "none";
        });

        // Show selected project list
        const target = document.getElementById(levelId);
        if (target) {
            target.style.display = "block";
            console.log("Showing projects for:", levelId);
        }

        // Update active level styling
        document.querySelectorAll(".level-card").forEach(card => {
            card.classList.remove("active-level");
        });
        
        // Find and highlight the clicked card
        document.querySelectorAll(".level-card").forEach(card => {
            const onclickAttr = card.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes(`toggleProjects('${levelId}')`)) {
                card.classList.add("active-level");
                console.log("Activated level:", levelId);
            }
        });

        // Update current level display
        if (currentLevelDisplay && levelMap[levelId]) {
            currentLevelDisplay.textContent = levelMap[levelId].name;
        }
        
        savedData.currentLevel = levelId;
        saveData();
        return true;
    };

    /* =========================
       PROGRESS CALCULATION
    ========================= */
    function calculateLevelProgress(levelId) {
        const projectsList = document.getElementById(levelId);
        if (!projectsList) {
            console.log("Projects list not found for:", levelId);
            return 0;
        }
        
        const checkboxes = projectsList.querySelectorAll("input[type='checkbox']");
        if (!checkboxes.length) {
            console.log("No checkboxes found for:", levelId);
            return 0;
        }
        
        const completed = [...checkboxes].filter(cb => cb.checked).length;
        const total = checkboxes.length;
        const percent = Math.round((completed / total) * 100);
        
        console.log(`Level ${levelId}: ${completed}/${total} = ${percent}%`);
        return percent;
    }

    /* =========================
       UPDATE PROGRESS & UNLOCKS
    ========================= */
    function updateProgress() {
        console.log("Updating progress...");
        let totalCompleted = 0;
        const newlyUnlocked = [];

        // Process each level
        Object.keys(levelMap).forEach(levelId => {
            const percent = calculateLevelProgress(levelId);
            
            // Find the corresponding level card
            const levelCard = document.querySelector(`.level-card[onclick*="${levelId}"]`);
            if (!levelCard) {
                console.log("Level card not found for:", levelId);
                return;
            }
            
            const projectsList = document.getElementById(levelId);
            if (!projectsList) return;
            
            const checkboxes = projectsList.querySelectorAll("input[type='checkbox']");
            const completed = [...checkboxes].filter(cb => cb.checked).length;
            const total = checkboxes.length;
            
            // Update progress bar
            const progressBar = levelCard.querySelector(".progress");
            if (progressBar) {
                progressBar.style.width = percent + "%";
            }
            
            // Update progress text
            const progressText = levelCard.querySelector("p");
            if (progressText) {
                progressText.textContent = `Progress: ${completed} / ${total} projects (${percent}%)`;
            }
            
            // Handle unlock status
            let unlockText = levelCard.querySelector(".unlock-status");
            if (!unlockText) {
                unlockText = document.createElement("div");
                unlockText.className = "unlock-status";
                levelCard.appendChild(unlockText);
            }
            
            if (levelMap[levelId].unlocks && percent >= UNLOCK_THRESHOLD) {
                const nextLevel = levelMap[levelId].unlocks;
                if (!savedData.unlockedLevels.includes(nextLevel)) {
                    savedData.unlockedLevels.push(nextLevel);
                    newlyUnlocked.push(nextLevel);
                    console.log("Unlocked new level:", nextLevel);
                }
                unlockText.textContent = `✅ Unlocks: ${levelMap[nextLevel].name}`;
                unlockText.style.color = "#4ade80";
            } else if (levelMap[levelId].unlocks) {
                unlockText.textContent = `🔒 ${UNLOCK_THRESHOLD}% required to unlock ${levelMap[levelMap[levelId].unlocks].name}`;
                unlockText.style.color = "#94a3b8";
            } else {
                unlockText.textContent = "🏁 Final Level";
                unlockText.style.color = "#f59e0b";
            }
            
            // Apply unlock status to card
            const isUnlocked = savedData.unlockedLevels.includes(levelId);
            if (isUnlocked) {
                levelCard.classList.remove("locked");
                levelCard.style.cursor = "pointer";
                levelCard.style.opacity = "1";
                
                // Remove lock overlay if present
                const lockOverlay = levelCard.querySelector(".lock-overlay");
                if (lockOverlay) {
                    lockOverlay.remove();
                }
            } else if (levelId !== "level1") {
                levelCard.classList.add("locked");
                levelCard.style.cursor = "not-allowed";
                levelCard.style.opacity = "0.7";
                
                // Add lock overlay if not present
                if (!levelCard.querySelector(".lock-overlay")) {
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
                    levelCard.appendChild(lockOverlay);
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

        saveData();

        // Show unlock notifications
        if (newlyUnlocked.length > 0) {
            newlyUnlocked.forEach(unlockedId => {
                showNotification(`🎉 Level Unlocked: ${levelMap[unlockedId].name}`);
            });
        }
        
        console.log("Progress update complete. Total completed:", totalCompleted);
    }

    /* =========================
       CHECKBOX HANDLING
    ========================= */
    function setupCheckboxes() {
        console.log("Setting up checkboxes...");
        
        document.querySelectorAll("input[type='checkbox']").forEach((cb, index) => {
            // Use checkbox ID or create one
            const checkboxId = cb.id || `checkbox_${index}`;
            cb.id = checkboxId;
            
            // Find corresponding label
            const label = cb.nextElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.setAttribute('for', checkboxId);
            }
            
            // Create unique storage key
            const storageKey = label ? label.textContent.trim() : checkboxId;
            
            // Restore checked state
            if (savedData.checked[storageKey]) {
                cb.checked = true;
                console.log("Restored checkbox:", storageKey);
            }
            
            // Add change listener
            cb.addEventListener("change", () => {
                savedData.checked[storageKey] = cb.checked;
                saveData();
                updateProgress();
                console.log("Checkbox changed:", storageKey, cb.checked);
            });
        });
        
        console.log("Checkboxes setup complete");
    }

    /* =========================
       INITIALIZATION
    ========================= */
    function initializeDashboard() {
        console.log("Initializing dashboard...");
        
        // Setup checkboxes
        setupCheckboxes();
        
        // Set initial active level
        const initialLevel = savedData.currentLevel || "level1";
        console.log("Initial level:", initialLevel, "Unlocked levels:", savedData.unlockedLevels);
        
        if (savedData.unlockedLevels.includes(initialLevel)) {
            toggleProjects(initialLevel);
        } else {
            toggleProjects("level1");
        }
        
        // Initial progress update
        updateProgress();
        
        console.log("Dashboard initialized successfully");
    }

    /* =========================
       UTILITY FUNCTIONS
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

    // Button action handlers
    window.startNextProject = () => {
        const currentLevel = savedData.currentLevel || "level1";
        alert(`Starting next project in ${levelMap[currentLevel].name}...`);
    };

    window.viewRoadmap = () => {
        alert("Showing full roadmap...");
    };

    window.trackProgress = () => {
        const totalCompleted = Object.values(savedData.checked).filter(v => v).length;
        alert(`You have completed ${totalCompleted} projects total!`);
    };

    // Initialize the dashboard
    initializeDashboard();
});