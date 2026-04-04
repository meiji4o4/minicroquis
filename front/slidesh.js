let imagesList2 = [];
let indexNow = 0;
let timerId = null;
let pause = false;
let durationGlobal = 0;
let elementImage = null;
let slideshowContainer = null;  // on renomme pour éviter confusion
let oldContent = '';
    


function showImage(index) {
    if (!elementImage) return;
    const url = '/images/' + imagesList2[index];
    console.log('Chargement de', url);
    elementImage.src = url;
    updateButtonsState()
}

function next() {
    if (pause) return;
    indexNow++;
    if (indexNow < imagesList2.length) {
        showImage(indexNow);
        startTimer();
    }
}



function startTimer() {
    if (timerId) clearTimeout(timerId);
    if(countdownInterval)clearInterval(countdownInterval);
    if (!pause) {
        startCountdown(durationGlobal)
        timerId = setTimeout(next, durationGlobal*1000);
    }
}

function stopTimer() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval=null;
        
    }
}


let timer=containerDiv.querySelector('');
if (timer) timer.textContent='';

function formatTime(seconds){
    const mins=Math.floor(seconds/60);
    const secs= seconds %60;
    const minutesStr=mins<10?'0'+minutes:''+mins;
    const secondsStr=secs<10?'0'+secs:''+secs;
    return minutesStr+':'+secondsStr;
}


function startCountdown(remainingSecs){
    if (countdownInterval) clearInterval(countdownInterval);
    if(timer)timer.textContent=formatTime(remainingSecs);
    countdownInterval=setInterval(() => {
        if(!pause && remainingSecs>0){
            remainingSecs--;
            if(timer)timer.textContent=formatTime(remainingSecs);
            if(remainingSecs==0) clearInterval(countdownInterval);
        }
    }, 1000);

}

function stopSlideshow() {
    stopTimer();
    const gallery = document.getElementById('gallery');
    if (slideshowContainer) {
        if (elementImage) elementImage.remove();
        const buttonsDiv = slideshowContainer.querySelector('.buttons');
        if (buttonsDiv) buttonsDiv.innerHTML = '';
        slideshowContainer.style.display = 'none';
    }
    if (gallery) {
        gallery.style.display = 'block';
        gallery.innerHTML = oldContent;
    }
    imagesList2 = [];
    indexNow = 0;
    pause = false;
    elementImage = null;
    slideshowContainer = null;
}

let suivantBtn=null;
let precedentBtn=null;

function updateButtonsState(){
    if (suivantBtn && precedentBtn){
        suivantBtn.disabled =(indexNow >=imagesList2.length-1);
        precedentBtn.disabled = (indexNow <=0);
    }
}


function createControls(container) {
    // Boutons existants (Pause/Reprendre/Stop)
    const pauseBtn = document.createElement('button');
    pauseBtn.textContent = "Pause";
    const reprendreBtn = document.createElement('button');
    reprendreBtn.textContent = "Reprendre";
    reprendreBtn.style.display = "none";
    const stopBtn = document.createElement('button');
    stopBtn.textContent = "Stop";

    // Boutons de navigation
    precedentBtn = document.createElement('button');
    precedentBtn.textContent = "Précédent";
    suivantBtn = document.createElement('button');
    suivantBtn.textContent = "Suivant";

    updateButtonsState()

    // --- Événements ---
    pauseBtn.addEventListener("click", () => {
        if (!pause && timerId) {
            stopTimer();
            pause = true;
            pauseBtn.style.display = "none";
            reprendreBtn.style.display = "inline-block";
        }
    });

    reprendreBtn.addEventListener("click", () => {
        if (pause) {
            pause = false;
            startTimer();
            reprendreBtn.style.display = "none";
            pauseBtn.style.display = "inline-block";
        }
    });

    stopBtn.addEventListener("click", () => {
        stopSlideshow();
    });

    suivantBtn.addEventListener("click", () => {
        if (indexNow + 1 < imagesList2.length) {
            // Arrêter le timer si le diaporama tourne
            if (!pause && timerId) stopTimer();
            indexNow++;
            showImage(indexNow);
            updateButtonsState();
            // Si le diaporama n’est pas en pause, relancer le timer
            if (!pause) startTimer();
        }
    });

    precedentBtn.addEventListener("click", () => {
        if (indexNow - 1 >= 0) {
            if (!pause && timerId) stopTimer();
            indexNow--;
            showImage(indexNow);
            updateButtonsState();
            if (!pause) startTimer();
        }
    });

    // Ajout au conteneur
    container.appendChild(pauseBtn);
    container.appendChild(reprendreBtn);
    container.appendChild(stopBtn);
    container.appendChild(precedentBtn);
    container.appendChild(suivantBtn);

    // Initialiser l’état des boutons
    updateButtonsState();
}












export function startSlideSh(images, durationMs, limit) {
    const gallery = document.getElementById('gallery');
    const containerDiv = document.getElementById('slideshow-container');
    if (!containerDiv) {
        console.error("slideshow-container not found");
        return;
    }

    // Sauvegarder l'état de la galerie
    oldContent = gallery.innerHTML;
    gallery.style.display = 'none';
    containerDiv.style.display = 'flex';

    // Supprimer l'ancienne image si elle existe (pour éviter les doublons)
    if (elementImage) elementImage.remove();

    // Créer la nouvelle image
    elementImage = document.createElement('img');
    containerDiv.appendChild(elementImage);

    // Récupérer la div .buttons existante (définie dans le HTML)
    const buttonsDiv = containerDiv.querySelector('.buttons');
    const timerDiv= containerDiv.querySelector('timer');
    
    if (!buttonsDiv) {
        console.error(".buttons not found inside slideshow-container");
        return;
    }
    // Vider les anciens boutons (évite les doublons à chaque lancement)
    buttonsDiv.innerHTML = '';
    // Créer les contrôles dans cette div
    createControls(buttonsDiv);
    createControls(timerDiv);

    // Initialiser les données
    imagesList2 = images.slice(0, limit);
    durationGlobal = durationSeconds*1000;
    indexNow = 0;
    pause = false;
    slideshowContainer = containerDiv;

    showImage(0);
    startTimer();
}