const durationInput = document.getElementById('duration');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const statusText = document.getElementById('meditation-status');
const breathingCircle = document.getElementById('breathing-circle');
const soundSelect = document.getElementById('sound-select');
const ambientAudio = document.getElementById('ambient-audio');

let totalSeconds = 0;
let timeRemaining = 0;
let timerInterval = null;
let isPaused = true;
let cycleElapsed = 0;

// --- 4-7-8 RHYTHM ---
const INHALE_DURATION = 4;
const HOLD_DURATION = 7;
const EXHALE_DURATION = 8;
const BREATH_CYCLE = INHALE_DURATION + HOLD_DURATION + EXHALE_DURATION;

// --- SOUND CUES ---
const inCue = new Audio('./audio/breathe_in.mp3');
const holdCue = new Audio('./audio/hold_cue.mp3');
const outCue = new Audio('./audio/breathe_out_cue.mp3');

// --- VOICE FILES ---
const inhaleVoice = new Audio('./audio/inhale_voice.mp3');
const holdVoice = new Audio('./audio/hold_voice.mp3');
const exhaleVoice = new Audio('./audio/exhale_voice.mp3');

// --- STOP ALL VOICES ---
function stopVoices() {
    [inhaleVoice, holdVoice, exhaleVoice].forEach(voice => {
        voice.pause();
        voice.currentTime = 0;
    });
}

// --- INITIALIZE TIMER ---
function initializeTimer() {
    totalSeconds = parseInt(durationInput.value) * 60;
    timeRemaining = totalSeconds;
    updateDisplay();
    cycleElapsed = 0;
}

function updateDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(seconds).padStart(2, '0');
}

// --- START TIMER ---
function startTimer() {
    if (!isPaused || timeRemaining <= 0) {
        initializeTimer();
    }

    isPaused = false;
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';

    breathingCircle.style.animation = `breathe-in-out ${BREATH_CYCLE}s infinite ease-in-out`;
    breathingCircle.style.animationPlayState = 'running';
    playAmbientSound(soundSelect.value);

    checkBreathingCycle();

    timerInterval = setInterval(() => {
        timeRemaining--;
        cycleElapsed++;

        if (cycleElapsed >= BREATH_CYCLE) {
            cycleElapsed = 0;
        }

        updateDisplay();
        checkBreathingCycle();

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            stopAmbientSound();
            stopVoices();
            isPaused = true;
            statusText.textContent = 'Session Complete! 🙏';
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            breathingCircle.style.animation = 'none';
        }
    }, 1000);
}

// --- BREATHING + VOICES ---
function checkBreathingCycle() {
    let newStatus = '';

    // INHALE
    if (cycleElapsed >= 0 && cycleElapsed < INHALE_DURATION) {
        newStatus = `INHALE (4s)... 🌬️`;
        if (cycleElapsed === 0) {
            stopVoices();
            inhaleVoice.play().catch(() => {});
            inCue.play().catch(() => {});
        }
    }

    // HOLD
    else if (cycleElapsed >= INHALE_DURATION &&
             cycleElapsed < INHALE_DURATION + HOLD_DURATION) {
        newStatus = `HOLD (7s)... ⏸️`;
        if (cycleElapsed === INHALE_DURATION) {
            stopVoices();
            holdVoice.play().catch(() => {});
            holdCue.play().catch(() => {});
        }
    }

    // EXHALE
    else if (cycleElapsed >= INHALE_DURATION + HOLD_DURATION &&
             cycleElapsed < BREATH_CYCLE) {
        newStatus = `EXHALE (8s)... 😌`;
        if (cycleElapsed === INHALE_DURATION + HOLD_DURATION) {
            stopVoices();
            exhaleVoice.play().catch(() => {});
            outCue.play().catch(() => {});
        }
    }

    statusText.textContent = newStatus;
}

// --- PAUSE ---
function pauseTimer() {
    clearInterval(timerInterval);
    stopAmbientSound();
    stopVoices();
    isPaused = true;
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    statusText.textContent = 'Paused...';
    breathingCircle.style.animationPlayState = 'paused';
}

// --- RESET ---
function resetTimer() {
    pauseTimer();
    initializeTimer();
    statusText.textContent = 'Ready to Begin';
    breathingCircle.style.animation = 'none';
    startBtn.textContent = 'Start Meditation';
}

// --- AMBIENT SOUND ---
function playAmbientSound(soundName) {
    stopAmbientSound();
    if (soundName !== 'none') {
        ambientAudio.src = `./audio/${soundName}.mp3`;
        ambientAudio.loop = true;
        ambientAudio.volume = 0.2;
        ambientAudio.play().catch(() => {});
    }
}

function stopAmbientSound() {
    ambientAudio.pause();
    ambientAudio.currentTime = 0;
}

// --- EVENTS ---
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
durationInput.addEventListener('change', initializeTimer);
soundSelect.addEventListener('change', (e) => {
    if (!isPaused) playAmbientSound(e.target.value);
});

// --- INIT ---
initializeTimer();
