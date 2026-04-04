let sequenceList = [];
let sequenceIndex = 0; // position "réelle" dans la séquence (pose / pause)
let viewIndex = 0;     // position de l'image affichée quand on clique sur Suivant/Précédent

let timerId = null;
let countdownInterval = null;
let pause = false;
let remainingSeconds = 30;

let elementImage = null;
let slideshowContainer = null;
let timerElement = null;
let oldContent = '';

let suivantBtn = null;
let precedentBtn = null;
let poseBtn = null; // nouveau bouton "Pose suivante" (avance réellement la séquence)

let statusElement = null;   // overlay "Pause"
let progressElement = null; // indicateur de progression (pose X/Y, reste Z)

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  const minutesStr = mins < 10 ? '0' + mins : String(mins);
  const secondsStr = secs < 10 ? '0' + secs : String(secs);
  return minutesStr + ':' + secondsStr;
}

function getCurrentItem() {
  return sequenceList[sequenceIndex] || null;
}

function getViewedItem() {
  return sequenceList[viewIndex] || null;
}

// Cherche la prochaine image (type === "image") à partir d'un index donné, dans une direction donnée
function findImageIndex(startIndex, direction) {
  let i = startIndex;

  while (i >= 0 && i < sequenceList.length) {
    const item = sequenceList[i];
    if (item && item.type === 'image') {
      return i;
    }
    i += direction;
  }

  return -1;
}

function updateButtonsState() {
  if (precedentBtn) {
    const prevIndex = findImageIndex(viewIndex - 1, -1);
    precedentBtn.disabled = prevIndex === -1;
  }

  if (suivantBtn) {
    const nextIndex = findImageIndex(viewIndex + 1, 1);
    suivantBtn.disabled = nextIndex === -1;
  }

  if (poseBtn) {
    poseBtn.disabled = sequenceIndex + 1 >= sequenceList.length;
  }
}

function clearTimers() {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function updateTimerDisplay() {
  if (timerElement) {
    timerElement.textContent = formatTime(remainingSeconds);
  }
}

function startCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  updateTimerDisplay();

  countdownInterval = setInterval(() => {
    if (pause) return;

    if (remainingSeconds > 0) {
      remainingSeconds -= 1;
      updateTimerDisplay();
    }

    if (remainingSeconds <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }, 1000);
}

function ensureStatusElement() {
  if (!slideshowContainer) return null;

  if (!statusElement) {
    statusElement = document.createElement('div');
    statusElement.style.position = 'absolute';
    statusElement.style.top = '50%';
    statusElement.style.left = '50%';
    statusElement.style.transform = 'translate(-50%, -50%)';
    statusElement.style.color = 'white';
    statusElement.style.fontSize = '2rem';
    statusElement.style.fontWeight = 'bold';
    statusElement.style.textAlign = 'center';
    statusElement.style.background = 'rgba(0, 0, 0, 0.4)';
    statusElement.style.padding = '0.5rem 1rem';
    statusElement.style.borderRadius = '10px';
    statusElement.style.display = 'none';
    slideshowContainer.appendChild(statusElement);
  }

  return statusElement;
}

function ensureProgressElement() {
  if (!slideshowContainer) return null;

  if (!progressElement) {
    progressElement = document.createElement('div');
    progressElement.style.position = 'absolute';
    progressElement.style.top = '70px';
    progressElement.style.left = '50%';
    progressElement.style.transform = 'translateX(-50%)';
    progressElement.style.color = 'white';
    progressElement.style.fontSize = '1rem';
    progressElement.style.background = 'rgba(0, 0, 0, 0.35)';
    progressElement.style.padding = '0.35rem 0.7rem';
    progressElement.style.borderRadius = '8px';
    progressElement.style.display = 'none';
    slideshowContainer.appendChild(progressElement);
  }

  return progressElement;
}

// Calcule la position de la pose courante dans le bloc de même durée
function getCurrentDurationGroupInfo() {
  const currentItem = getCurrentItem();
  if (!currentItem || currentItem.type !== 'image') {
    return null;
  }

  const currentDuration = currentItem.duration;

  // on cherche les images contiguës de même durée autour de sequenceIndex
  let start = sequenceIndex;
  while (
    start > 0 &&
    sequenceList[start - 1] &&
    sequenceList[start - 1].type === 'image' &&
    sequenceList[start - 1].duration === currentDuration
  ) {
    start -= 1;
  }

  let end = sequenceIndex;
  while (
    end + 1 < sequenceList.length &&
    sequenceList[end + 1] &&
    sequenceList[end + 1].type === 'image' &&
    sequenceList[end + 1].duration === currentDuration
  ) {
    end += 1;
  }

  const total = end - start + 1;
  const current = sequenceIndex - start + 1;
  const remaining = end - sequenceIndex;

  return {
    current,
    total,
    remaining,
    duration: currentDuration
  };
}

function updateProgressDisplay() {
  const info = getCurrentDurationGroupInfo();
  const el = ensureProgressElement();
  if (!el) return;

  if (!info) {
    el.textContent = '';
    el.style.display = 'none';
    return;
  }

  el.style.display = 'block';
  el.textContent = `Pose ${info.current}/${info.total} • reste ${info.remaining}`;
}

function renderCurrentItem() {
  const currentItem = getCurrentItem();
  if (!currentItem || !elementImage) return;

  const overlay = ensureStatusElement();

  // Si la pose courante est une pause, on affiche un overlay "Pause"
  if (currentItem.type === 'break') {
    elementImage.style.display = 'none';

    if (overlay) {
      overlay.style.display = 'block';
      overlay.textContent = 'Pause';
    }

    updateProgressDisplay();
    updateButtonsState();
    return;
  }

  const viewedItem = getViewedItem();
  if (!viewedItem || viewedItem.type !== 'image') {
    return;
  }

  if (overlay) {
    overlay.style.display = 'none';
    overlay.textContent = '';
  }

  elementImage.style.display = 'block';
  elementImage.src = '/images/' + viewedItem.name;
  elementImage.alt = viewedItem.name;

  updateProgressDisplay();
  updateButtonsState();
}

function stopSlideshow() {
  clearTimers();

  const gallery = document.getElementById('gallery');

  if (elementImage) {
    elementImage.remove();
    elementImage = null;
  }

  if (statusElement) {
    statusElement.remove();
    statusElement = null;
  }

  if (progressElement) {
    progressElement.remove();
    progressElement = null;
  }

  if (slideshowContainer) {
    const buttonsDiv = slideshowContainer.querySelector('.buttons');
    if (buttonsDiv) buttonsDiv.innerHTML = '';

    if (timerElement) {
      timerElement.textContent = '';
    }

    slideshowContainer.style.display = 'none';
  }

  if (gallery) {
    gallery.style.display = 'grid';
    gallery.innerHTML = oldContent;
  }

  sequenceList = [];
  sequenceIndex = 0;
  viewIndex = 0;
  pause = false;
  remainingSeconds = 30;
  slideshowContainer = null;
  timerElement = null;
  suivantBtn = null;
  precedentBtn = null;
  poseBtn = null;
}

function startTimer(reset = true) {
  clearTimers();

  const item = getCurrentItem();
  if (!item) return;

  if (reset) {
    remainingSeconds = item.duration ?? 30;
  }

  updateTimerDisplay();
  timerId = setTimeout(advancePose, remainingSeconds * 1000);
  startCountdown();
}

// Avance réellement d'une pose dans la séquence (ancien comportement de next())
function advancePose() {
  if (pause) return;

  if (sequenceIndex + 1 >= sequenceList.length) {
    clearTimers();
    updateButtonsState();
    return;
  }

  sequenceIndex += 1;

  // synchroniser l'image affichée sur la nouvelle pose si c'est une image
  const item = getCurrentItem();
  if (item && item.type === 'image') {
    viewIndex = sequenceIndex;
  }

  renderCurrentItem();
  startTimer(true);
}

// Navigation d'images uniquement (ne change pas la pose courante)
function nextImageOnly() {
  const nextIndex = findImageIndex(viewIndex + 1, 1);
  if (nextIndex === -1) return;

  viewIndex = nextIndex;
  renderCurrentItem();
  startTimer(true);
}

function previousImageOnly() {
  const prevIndex = findImageIndex(viewIndex - 1, -1);
  if (prevIndex === -1) return;

  viewIndex = prevIndex;
  renderCurrentItem();
  startTimer(true);
}

function createControls(container) {
  const pauseBtn = document.createElement('button');
  pauseBtn.textContent = 'Pause';

  const reprendreBtn = document.createElement('button');
  reprendreBtn.textContent = 'Reprendre';
  reprendreBtn.style.display = 'none';

  const stopBtn = document.createElement('button');
  stopBtn.textContent = 'Stop';

  precedentBtn = document.createElement('button');
  precedentBtn.textContent = 'Précédent';

  suivantBtn = document.createElement('button');
  suivantBtn.textContent = 'Suivant';

  poseBtn = document.createElement('button');
  poseBtn.textContent = 'Pose suivante';

  pauseBtn.addEventListener('click', () => {
    if (pause) return;

    pause = true;
    clearTimers();
    pauseBtn.style.display = 'none';
    reprendreBtn.style.display = 'inline-block';
  });

  reprendreBtn.addEventListener('click', () => {
    if (!pause) return;

    pause = false;
    reprendreBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    startTimer(false); // on reprend là où on en était
  });

  stopBtn.addEventListener('click', stopSlideshow);

  suivantBtn.addEventListener('click', nextImageOnly);
  precedentBtn.addEventListener('click', previousImageOnly);

  // nouveau bouton : avance la pose (séquence) comme l'ancien next()
  poseBtn.addEventListener('click', advancePose);

  container.appendChild(pauseBtn);
  container.appendChild(reprendreBtn);
  container.appendChild(stopBtn);
  container.appendChild(precedentBtn);
  container.appendChild(suivantBtn);
  container.appendChild(poseBtn);

  updateButtonsState();
}

export function startSlideSh(sequence) {
  const gallery = document.getElementById('gallery');
  const containerDiv = document.getElementById('slideshow-container');

  if (!gallery || !containerDiv) {
    console.error('gallery or slideshow-container not found');
    return;
  }

  const safeSequence = Array.isArray(sequence) ? sequence.filter(Boolean) : [];
  if (!safeSequence.length) {
    console.error('No sequence to display');
    return;
  }

  sequenceList = safeSequence;
  sequenceIndex = 0;

  // première image à afficher pour la navigation
  const firstImageIndex = findImageIndex(0, 1);
  if (firstImageIndex === -1) {
    console.error('Sequence has no images');
    return;
  }
  viewIndex = firstImageIndex;

  pause = false;

  const firstItem = getCurrentItem();
  remainingSeconds = firstItem && firstItem.duration ? firstItem.duration : 30;

  slideshowContainer = containerDiv;
  timerElement = containerDiv.querySelector('.timer');

  oldContent = gallery.innerHTML;
  gallery.style.display = 'none';
  containerDiv.style.display = 'flex';

  if (elementImage) {
    elementImage.remove();
  }

  if (statusElement) {
    statusElement.remove();
    statusElement = null;
  }

  if (progressElement) {
    progressElement.remove();
    progressElement = null;
  }

  elementImage = document.createElement('img');
  elementImage.decoding = 'async';
  elementImage.alt = '';

  const buttonsDiv = containerDiv.querySelector('.buttons');
  if (!buttonsDiv) {
    console.error('.buttons not found inside slideshow-container');
    return;
  }

  buttonsDiv.innerHTML = '';
  createControls(buttonsDiv);
  containerDiv.insertBefore(elementImage, buttonsDiv);

  renderCurrentItem();
  startTimer(true);
}