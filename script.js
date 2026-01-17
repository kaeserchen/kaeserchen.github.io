const container = document.getElementById('streak-container');
let streaks = []; 
let resizeTimer; 

// GRID SETTINGS
const gridWidth = 90;   
const gridHeight = 115; 
const jitter = 0;    
const pageMargin = 0; // Controls the "Blue Box" margin from screen edges

function generateGrid() {
    // 1. CLEAR PREVIOUS STATE
    container.innerHTML = '';
    streaks = [];

    // 2. RECALCULATE DIMENSIONS
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Calculate available space minus the safety margins
    const availableWidth = w - (pageMargin * 2);
    const availableHeight = h - (pageMargin * 2);

    // Ensure we don't get negative values on very small screens
    if (availableWidth <= 0 || availableHeight <= 0) return;

    const cols = Math.floor(availableWidth / gridWidth);
    const rows = Math.floor(availableHeight / gridHeight);

    // Center the grid within the available safe zone
    const xOffset = pageMargin + (availableWidth - (cols * gridWidth)) / 2;
    const yOffset = pageMargin + (availableHeight - (rows * gridHeight)) / 2;

    // --- DYNAMIC EXCLUSION ZONE ---
    const contentWrapper = document.querySelector('.content-wrapper');
    let excludeRect = null;
    
    if (contentWrapper) {
        const rect = contentWrapper.getBoundingClientRect();
        
        // FIX: Tighter boundaries to reduce "blank space" (Yellow Box)
        // We shrink the exclusion box slightly so confetti can enter the padding area
        excludeRect = {
            left: rect.left - 20,    // Allow confetti slightly into side padding
            right: rect.right - 10,  
            top: rect.top - 40,      // Allow confetti closer to the top Title
            bottom: rect.bottom - 30 // Allow confetti closer to bottom Links
        };
    }

    // 3. GENERATE CONFETTI
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            
            let baseX = xOffset + (c * gridWidth);
            let baseY = yOffset + (r * gridHeight);

            let x = baseX + (Math.random() * jitter);
            let y = baseY + (Math.random() * jitter);

            // CHECK: Is this point inside the "No Fly Zone"?
            if (excludeRect) {
                if (x > excludeRect.left && x < excludeRect.right && 
                    y > excludeRect.top && y < excludeRect.bottom) {
                    continue; 
                }
            }

            const el = document.createElement('div');
            el.classList.add('streak');
            
            el.style.left = x + 'px';
            el.style.top = y + 'px';

            const rotation = Math.random() * 360;
            el.style.transform = `rotate(${rotation}deg)`;
            el.dataset.rotation = rotation;

            container.appendChild(el);
            streaks.push(el);
        }
    }
}

// --- ANIMATION LOGIC ---
const movementDuration = 1500; 

function animateRandomStreak() {
    if (streaks.length > 0) {
        const randomIndex = Math.floor(Math.random() * streaks.length);
        const streak = streaks[randomIndex];

        if (streak) {
            let currentRot = parseFloat(streak.dataset.rotation);
            let newRot = currentRot + 180;
            
            streak.style.transform = `rotate(${newRot}deg)`;
            streak.dataset.rotation = newRot;
        }
    }

    const randomPause = Math.random() * 2000 + 1500;
    const nextTriggerTime = movementDuration + randomPause;

    setTimeout(animateRandomStreak, nextTriggerTime);
}

// --- INITIALIZATION ---
window.addEventListener('load', () => {
    generateGrid();
    animateRandomStreak();
});

window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        generateGrid();
    }, 200); 
});