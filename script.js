const container = document.getElementById('streak-container');
let streaks = [];
let resizeTimer;

// GRID SETTINGS
const gridWidth = 90;
const gridHeight = 115;
const jitter = 0;
const minPageMargin = 0; // We want AT LEAST this much space on sides


function generateGrid() {
    // 1. CLEAR PREVIOUS STATE
    container.innerHTML = '';
    streaks = [];

    // 2. GET DIMENSIONS
    const w = window.innerWidth;
    const h = window.innerHeight;

    // 3. CALCULATE COLUMNS/ROWS BASED ON SAFE MARGINS
    // We reserve space (minPageMargin * 2) to ensure we don't touch edges,
    // then see how many columns fit in the remaining space.
    const safeWidth = w - (minPageMargin * 2);
    const safeHeight = h - (minPageMargin * 2);

    if (safeWidth <= 0 || safeHeight <= 0) return;

    // How many grid cells fit?
    // We add 1 to the division to account for the fact that a grid 
    // is points, not just gaps. But strict floor is safer to prevent overflow.
    const cols = Math.floor(safeWidth / gridWidth);
    const rows = Math.floor(safeHeight / gridHeight);

    // 4. CALCULATE EXACT CENTERING (Fixing the "Uneven" issue)
    // The "Used Space" is the distance from the first grid point to the last grid point,
    // PLUS the jitter amount (since points scatter slightly right/down).
    const visualGridWidth = ((cols - 1) * gridWidth) + jitter;
    const visualGridHeight = ((rows - 1) * gridHeight) + jitter;

    // Determine the exact starting offsets to center that Visual Grid
    const xOffset = (w - visualGridWidth) / 2;
    const yOffset = (h - visualGridHeight) / 2;

    // --- CONTENT EXCLUSION ZONES ---
    const contentWrapper = document.querySelector('.content-wrapper');
    let excludeRect = null;

    if (contentWrapper) {
        const rect = contentWrapper.getBoundingClientRect();

        // Shrink the box slightly so confetti gets closer to the text
        excludeRect = {
            left: rect.left,
            right: rect.right,
            top: rect.top - 30,
            bottom: rect.bottom,
        };
    }

    // 5. GENERATE CONFETTI
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {

            // Base Grid Position
            let baseX = xOffset + (c * gridWidth);
            let baseY = yOffset + (r * gridHeight);

            // Add Random Jitter
            let x = baseX + (Math.random() * jitter);
            let y = baseY + (Math.random() * jitter) - 20;

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
// Use ResizeObserver to watch for size changes. This is more robust than
// window.resize for initial load layout stability + handling mobile address bars.
const resizeObserver = new ResizeObserver(entries => {
    // Debounce the grid regeneration
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // We check window.innerWidth to ensure we don't regenerate for vertical-only
        // changes (like mobile address bar scroll), unless the width actually changed.
        if (Math.abs(window.innerWidth - lastWidth) > 0) {
            lastWidth = window.innerWidth;
            generateGrid();
        }
    }, 100);
});

window.addEventListener('load', () => {
    // Initial generation (in case Observer takes a moment or doesn't fire if size doesn't change from 0 - unlikely)
    // Actually, ResizeObserver fires immediately when observing, so we can rely on it mostly,
    // but calling it once ensures we have content ASAP.
    generateGrid();
    animateRandomStreak();

    // Start observing the body (which fills the view)
    resizeObserver.observe(document.body);

    const emailBtn = document.getElementById('email-btn');
    const user = 'christine.kaeserchen'; // Change this
    const domain = 'gmail.com';      // Change this
    if (emailBtn) {
        emailBtn.href = 'mailto:' + user + '@' + domain;
    }
});

// Store the width to compare later
let lastWidth = window.innerWidth;
// Remove the old window.resize listener (it's replaced by ResizeObserver)