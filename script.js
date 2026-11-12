// Configuration des vidéos
const videos = [
    {
        id: 0,
        title: "Introduction au Trading",
        description: "Comprendre les bases du trading et des marchés financiers",
        thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop",
        url: "media/video1/index.m3u8"
    },
    {
        id: 1,
        title: "Module 1 - Analyse Technique",
        description: "Maîtriser les graphiques, indicateurs et chandeliers japonais",
        thumbnail: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop",
        url: "media/video2/index.m3u8"
    },
    {
        id: 2,
        title: "Module 2 - Gestion des Risques",
        description: "Apprendre à gérer votre capital et limiter les pertes",
        thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop",
        url: "media/video3/index.m3u8"
    },
    {
        id: 3,
        title: "Module 3 - Stratégies de Trading",
        description: "Day trading, swing trading et stratégies gagnantes",
        thumbnail: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&h=450&fit=crop",
        url: "media/video4/index.m3u8"
    },
    {
        id: 4,
        title: "Module 4 - Psychologie du Trader",
        description: "Maîtriser vos émotions et développer une mentalité gagnante",
        thumbnail: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=450&fit=crop",
        url: "media/video5/index.m3u8"
    },
    {
        id: 5,
        title: "Module 5 - Trading en Direct",
        description: "Analyses de trades réels et sessions live",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
        url: ""
    },
    {
        id: 6,
        title: "Module 6 - Devenir Trader Rentable",
        description: "Plan d'action et conseils pour réussir dans le trading",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
        url: ""
    }
];

// État de l'application
let unlockedVideos = [0];
let completedVideos = [];
let currentVideo = null;
let hlsPlayer = null;
let deferredInstallPrompt = null;
const installConfig = {
    delayMs: 4000,
    dismissDays: 7,
    dismissKey: 'pwaInstallDismissedUntil'
};

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
});

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hideInstallBanner();
    closeIosInstall();
});

// Éléments DOM
const videoGrid = document.getElementById('video-grid');
const videoPlayerSection = document.getElementById('video-player');
const currentVideoElement = document.getElementById('current-video');
const videoTitle = document.getElementById('video-title');
const videoDescription = document.getElementById('video-description');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const completedCount = document.getElementById('completed-count');
const totalCount = document.getElementById('total-count');

// Initialisation
function init() {
    loadProgress();
    renderVideoGrid();
    updateProgressDisplay();
    setupEventListeners();
    setupInstallButton();
    registerServiceWorker();
    
    // Afficher le nombre total de vidéos
    totalCount.textContent = videos.length;
}

function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIosDevice() {
    const ua = navigator.userAgent || '';
    const isAppleMobile = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return isAppleMobile;
}

function isIosSafari() {
    const ua = navigator.userAgent || '';
    return isIosDevice() && /safari/i.test(ua) && !/crios|fxios|edgios|opr\//i.test(ua);
}

function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        // Le site reste utilisable si le stockage est bloqué.
    }
}

function installWasDismissed() {
    const until = Number(readStorage(installConfig.dismissKey));
    return Number.isFinite(until) && until > Date.now();
}

function hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.hidden = true;
    }
}

function dismissInstallBanner() {
    const until = Date.now() + installConfig.dismissDays * 24 * 60 * 60 * 1000;
    writeStorage(installConfig.dismissKey, String(until));
    hideInstallBanner();
}

function closeIosInstall() {
    const dialog = document.getElementById('install-ios');
    if (dialog) {
        dialog.hidden = true;
    }
}

function openIosInstall() {
    const dialog = document.getElementById('install-ios');
    const steps = document.getElementById('install-ios-steps');
    const closeButton = document.getElementById('install-ios-close');
    if (!dialog || !steps) {
        return;
    }

    const items = isIosSafari()
        ? [
            'Touchez le bouton Partager de Safari.',
            'Choisissez « Sur l’écran d’accueil ».',
            'Confirmez avec « Ajouter ».'
        ]
        : [
            'Ouvrez cette page dans Safari.',
            'Touchez le bouton Partager.',
            'Choisissez « Sur l’écran d’accueil », puis « Ajouter ».'
        ];

    steps.replaceChildren();
    items.forEach((text) => {
        const item = document.createElement('li');
        item.textContent = text;
        steps.appendChild(item);
    });
    dialog.hidden = false;
    if (closeButton) {
        closeButton.focus();
    }
}

async function requestInstall() {
    if (typeof navigator.install === 'function') {
        try {
            await navigator.install();
            hideInstallBanner();
            return;
        } catch (error) {
            if (!error || error.name === 'AbortError') {
                return;
            }
        }
    }

    if (deferredInstallPrompt) {
        const promptEvent = deferredInstallPrompt;
        deferredInstallPrompt = null;
        try {
            await promptEvent.prompt();
            const choice = await promptEvent.userChoice;
            if (choice.outcome === 'accepted') {
                hideInstallBanner();
            }
        } catch (error) {
            deferredInstallPrompt = promptEvent;
        }
        return;
    }

    if (isIosDevice()) {
        openIosInstall();
    }
}

function setupInstallButton() {
    const banner = document.getElementById('install-banner');
    const installBtn = document.getElementById('install-btn');
    const dismissBtn = document.getElementById('install-dismiss');
    const iosClose = document.getElementById('install-ios-close');
    const iosDialog = document.getElementById('install-ios');

    if (!banner || !installBtn || isAppInstalled() || installWasDismissed()) {
        hideInstallBanner();
        return;
    }

    window.setTimeout(() => {
        if (!isAppInstalled() && !installWasDismissed()) {
            banner.hidden = false;
        }
    }, installConfig.delayMs);

    installBtn.addEventListener('click', () => {
        requestInstall();
    });

    if (dismissBtn) {
        dismissBtn.addEventListener('click', dismissInstallBanner);
    }

    if (iosClose) {
        iosClose.addEventListener('click', closeIosInstall);
    }

    if (iosDialog) {
        iosDialog.addEventListener('click', (event) => {
            if (event.target === iosDialog) {
                closeIosInstall();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeIosInstall();
        }
    });
}

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        return;
    }
    navigator.serviceWorker.register('sw.js?v=4').catch(() => {});
}

// Charger la progression depuis localStorage
function loadProgress() {
    const savedUnlocked = localStorage.getItem('unlockedVideos');
    const savedCompleted = localStorage.getItem('completedVideos');
    
    if (savedUnlocked) {
        unlockedVideos = JSON.parse(savedUnlocked);
    }
    
    if (savedCompleted) {
        completedVideos = JSON.parse(savedCompleted);
    }
}

// Sauvegarder la progression
function saveProgress() {
    localStorage.setItem('unlockedVideos', JSON.stringify(unlockedVideos));
    localStorage.setItem('completedVideos', JSON.stringify(completedVideos));
}

// Mettre à jour l'affichage de la progression
function updateProgressDisplay() {
    completedCount.textContent = completedVideos.length;
}

// Générer la grille de vidéos
function renderVideoGrid() {
    videoGrid.innerHTML = '';
    
    videos.forEach(video => {
        const isLocked = !unlockedVideos.includes(video.id);
        const isCompleted = completedVideos.includes(video.id);
        
        const card = document.createElement('div');
        card.className = `video-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`;
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}">
                <div class="video-overlay">
                    ${isLocked ? 
                        '<div class="lock-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div>' :
                        isCompleted ?
                        '<div class="check-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>' :
                        '<div class="play-icon"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></div>'
                    }
                </div>
                <div class="video-badge ${isCompleted ? 'badge-completed' : isLocked ? 'badge-locked' : 'badge-available'}">
                    ${isCompleted ? 'Terminé ✓' : isLocked ? 'Verrouillé 🔒' : 'Disponible'}
                </div>
            </div>
            <div class="video-content">
                <h3>${video.title}</h3>
                <p>${video.description}</p>
            </div>
        `;
        
        if (!isLocked) {
            card.addEventListener('click', () => playVideo(video));
        }
        
        videoGrid.appendChild(card);
    });
}

// Lire une vidéo
function playVideo(video) {
    if (!video.url) {
        return;
    }

    currentVideo = video;
    videoPlayerSection.style.display = 'block';
    videoTitle.textContent = video.title;
    videoDescription.textContent = video.description;
    attachVideoSource(video.url);

    // Scroll vers le lecteur
    videoPlayerSection.scrollIntoView({ behavior: 'smooth' });
}

function attachVideoSource(url) {
    if (hlsPlayer) {
        hlsPlayer.destroy();
        hlsPlayer = null;
    }

    const isHls = url.indexOf('.m3u8') !== -1;
    if (isHls && window.Hls && Hls.isSupported()) {
        hlsPlayer = new Hls();
        hlsPlayer.loadSource(url);
        hlsPlayer.attachMedia(currentVideoElement);
        hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function () {
            const playPromise = currentVideoElement.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        });
        return;
    }

    currentVideoElement.src = url;
    currentVideoElement.load();
    const playPromise = currentVideoElement.play();
    if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
    }
}

// Gérer la fin de la vidéo
function handleVideoEnd() {
    if (currentVideo && !completedVideos.includes(currentVideo.id)) {
        // Marquer comme complétée
        completedVideos.push(currentVideo.id);
        
        // Déverrouiller la suivante
        const nextId = currentVideo.id + 1;
        if (nextId < videos.length && !unlockedVideos.includes(nextId)) {
            unlockedVideos.push(nextId);
        }
        
        // Sauvegarder et mettre à jour l'affichage
        saveProgress();
        updateProgressDisplay();
        renderVideoGrid();
    }
}

// Mode plein écran
function toggleFullscreen() {
    const container = videoPlayerSection;
    
    if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    currentVideoElement.addEventListener('ended', handleVideoEnd);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Empêcher le clic droit sur la vidéo
    currentVideoElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
}

// Lancer l'application au chargement de la page
document.addEventListener('DOMContentLoaded', init);