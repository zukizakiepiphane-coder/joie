// Navigation entre pages
const giftBox = document.getElementById('giftBox');
const giftPage = document.getElementById('giftPage');
const photoPage = document.getElementById('photoPage');
const closeBtn = document.getElementById('closeBtn');
const audio = document.getElementById('birthdayAudio');

// === FEUX D'ARTIFICE ===
function createFireworks(container) {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff6600', '#ff3366'];
    
    function createExplosion(x, y) {
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            
            const size = Math.random() * 6 + 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.backgroundColor = color;
            particle.style.boxShadow = `0 0 10px ${color}`;
            
            container.appendChild(particle);
            
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = 5 + Math.random() * 5;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            let px = x, py = y;
            let vxCur = vx, vyCur = vy;
            const gravity = 0.15;
            const lifetime = 800;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / lifetime;
                
                vyCur += gravity;
                px += vxCur;
                py += vyCur;
                
                particle.style.left = px + 'px';
                particle.style.top = py + 'px';
                particle.style.opacity = 1 - progress;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };
            
            animate();
        }
    }
    
    // Créer des explosions périodiquement
    let fireworksInterval = setInterval(() => {
        if (!container.closest('.page.active')) {
            clearInterval(fireworksInterval);
            return;
        }
        
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight * 0.6;
        createExplosion(x, y);
    }, 1500);
    
    return fireworksInterval;
}

// Variables pour les feux d'artifice
let giftFireworksInterval;
let photoFireworksInterval;

// Variables pour le défilement automatique des photos
let currentPhotoIndex = 0;
const photos = document.querySelectorAll('.circle-img');
const totalPhotos = photos.length;

// Ouvrir la page des photos AU CLIC
giftBox.addEventListener('click', () => {
    giftPage.classList.remove('active');
    photoPage.classList.add('active');
    
    // Jouer le son
    audio.currentTime = 0;
    audio.volume = 1;
    audio.play().catch(() => console.log('Audio autoplay prevented'));
    
    // Démarrer le défilement automatique des photos
    startPhotoSlideshow();
    
    // Arrêter les feux d'artifice de la page cadeau
    clearInterval(giftFireworksInterval);
    
    // Démarrer les feux d'artifice de la page photo
    const photoFireworks = document.querySelector('.photo-fireworks');
    photoFireworksInterval = createFireworks(photoFireworks);
});

// Fermer la page des photos
closeBtn.addEventListener('click', () => {
    photoPage.classList.remove('active');
    giftPage.classList.add('active');
    audio.pause();
    audio.currentTime = 0;
    stopPhotoSlideshow();
    
    // Arrêter les feux d'artifice de la page photo
    clearInterval(photoFireworksInterval);
    
    // Redémarrer les feux d'artifice de la page cadeau
    const giftFireworks = document.querySelector('.gift-fireworks');
    giftFireworksInterval = createFireworks(giftFireworks);
});

// === SLIDESHOW PHOTOS LENT === 
let slideshowInterval;
let poemScrollInterval;

function startPhotoSlideshow() {
    // Changer de photo tous les 5 secondes (lentement)
    slideshowInterval = setInterval(() => {
        // Enlever la classe active de la photo actuelle
        photos.forEach(photo => photo.classList.remove('active'));
        
        // Aller à la photo suivante
        currentPhotoIndex = (currentPhotoIndex + 1) % totalPhotos;
        
        // Ajouter la classe active à la nouvelle photo
        photos[currentPhotoIndex].classList.add('active');
    }, 5000);
    
    // Démarrer le défilement automatique du poème
    startPoemScroll();
}

function stopPhotoSlideshow() {
    clearInterval(slideshowInterval);
    clearInterval(poemScrollInterval);
    currentPhotoIndex = 0;
    photos.forEach(photo => photo.classList.remove('active'));
    photos[0].classList.add('active');
}

// === DÉFILEMENT AUTOMATIQUE DU POÈME ===
function startPoemScroll() {
    const poemSection = document.querySelector('.poem-section');
    let isScrolling = false;
    
    poemScrollInterval = setInterval(() => {
        if (!isScrolling) {
            const maxScroll = poemSection.scrollHeight - poemSection.clientHeight;
            
            if (poemSection.scrollTop < maxScroll) {
                // Défiler vers le bas
                poemSection.scrollTop += 2;
            } else {
                // Retour au début
                poemSection.scrollTop = 0;
            }
        }
    }, 50);
}

// Gestion du toucher (swipe) pour changer de photo
let touchStartX = 0;
let touchEndX = 0;

const photoCircle = document.getElementById('photoCircle');

photoCircle.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

photoCircle.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const threshold = 50;
    
    if (touchStartX - touchEndX > threshold) {
        // Swipe vers la gauche - photo suivante
        currentPhotoIndex = (currentPhotoIndex + 1) % totalPhotos;
    } else if (touchEndX - touchStartX > threshold) {
        // Swipe vers la droite - photo précédente
        currentPhotoIndex = (currentPhotoIndex - 1 + totalPhotos) % totalPhotos;
    }
    
    // Mettre à jour l'affichage
    photos.forEach(photo => photo.classList.remove('active'));
    photos[currentPhotoIndex].classList.add('active');
}

// Navigation au clavier
document.addEventListener('keydown', (e) => {
    if (photoPage.classList.contains('active')) {
        if (e.key === 'ArrowLeft') {
            currentPhotoIndex = (currentPhotoIndex - 1 + totalPhotos) % totalPhotos;
            photos.forEach(photo => photo.classList.remove('active'));
            photos[currentPhotoIndex].classList.add('active');
        } else if (e.key === 'ArrowRight') {
            currentPhotoIndex = (currentPhotoIndex + 1) % totalPhotos;
            photos.forEach(photo => photo.classList.remove('active'));
            photos[currentPhotoIndex].classList.add('active');
        } else if (e.key === 'Escape') {
            closeBtn.click();
        }
    }
});

// Clic sur le poème pour rejouer l'animation des lignes
const poemContent = document.getElementById('poemContent');
const poemLines = document.querySelectorAll('.poem-line');
const poemSection = document.querySelector('.poem-section');

poemContent.addEventListener('click', () => {
    poemLines.forEach(line => {
        line.style.animation = 'none';
        setTimeout(() => {
            line.style.animation = '';
        }, 10);
    });
});

// Pause le défilement au survol et reprend après
poemSection.addEventListener('mouseenter', () => {
    clearInterval(poemScrollInterval);
});

poemSection.addEventListener('mouseleave', () => {
    if (photoPage.classList.contains('active')) {
        startPoemScroll();
    }
});

console.log('✨ Page d\'anniversaire avec feux d\'artifice prête! 🎉');

// Démarrer les feux d'artifice au chargement de la page
window.addEventListener('load', () => {
    const giftFireworks = document.querySelector('.gift-fireworks');
    giftFireworksInterval = createFireworks(giftFireworks);
});

