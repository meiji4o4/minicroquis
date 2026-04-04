let imagesList2 = [];
let indexNow = 0;
let timerId = null;
let countdownInterval = null;
let pause = false;
let durationGlobal = 30;
let remainingSeconds = 30;
let elementImage = null;
let slideshowContainer = null;
let timerElement = null;
let oldContent = '';

let suivantBtn = null;
let precedentBtn = null;

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  const minutesStr = mins < 10 ? '0' + mins : String(mins);
  const secondsStr = secs < 10 ? '0' + secs : String(secs);
  return minutesStr + ':' + secondsStr;
}

function updateButtonsState() {
  if (precedentBtn) {
    precedentBtn.disabled = indexNow <= 0;
  }
  if (suivantBtn) {
    suivantBtn.disabled = indexNow >= imagesList2.length - 1;
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

function showImage(index) {
  if (!elementImage || index < 0 || index >= imagesList2.length) return;
  elementImage.src = '/images/' + imagesList2[index];
  elementImage.alt = imagesList2[index];
  updateButtonsState();
}

function stopSlideshow() {
  clearTimers();

  const gallery = document.getElementById('gallery');

  if (elementImage) {
    elementImage.remove();
    elementImage = null;
  }

  if (slideshowContainer) {
    const buttonsDiv = slideshowContainer.querySelector('.buttons');
    if (buttonsDiv) buttonsDiv.innerHTML = '';
    if (timerElement) timerElement.textContent = '';
    slideshowContainer.style.display = 'none';
  }

  if (gallery) {
    gallery.style.display = 'grid';
    gallery.innerHTML = oldContent;
  }

  imagesList2 = [];
  indexNow = 0;
  pause = false;
  durationGlobal = 30;
  remainingSeconds = 30;
  slideshowContainer = null;
  timerElement = null;
  suivantBtn = null;
  precedentBtn = null;
}

function startTimer(reset = true) {
  clearTimers();

  if (reset) {
    remainingSeconds = durationGlobal;
  }

  updateTimerDisplay();
  timerId = setTimeout(next, remainingSeconds * 1000);
  startCountdown();
}

function next() {
  if (pause) return;

  if (indexNow + 1 >= imagesList2.length) {
    clearTimers();
    updateButtonsState();
    return;
  }

  indexNow += 1;
  showImage(indexNow);
  startTimer(true);
}

function previous() {
  if (indexNow <= 0) return;
  indexNow -= 1;
  showImage(indexNow);
  if (!pause) startTimer(true);
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
    startTimer(false);
  });

  stopBtn.addEventListener('click', () => {
    stopSlideshow();
  });

  suivantBtn.addEventListener('click', () => {
    if (indexNow + 1 >= imagesList2.length) return;
    indexNow += 1;
    showImage(indexNow);
    if (!pause) startTimer(true);
  });

  precedentBtn.addEventListener('click', () => {
    previous();
  });

  container.appendChild(pauseBtn);
  container.appendChild(reprendreBtn);
  container.appendChild(stopBtn);
  container.appendChild(precedentBtn);
  container.appendChild(suivantBtn);

  updateButtonsState();
}

export function startSlideSh(images, durationSeconds, limit) {
  const gallery = document.getElementById('gallery');
  const containerDiv = document.getElementById('slideshow-container');

  if (!gallery || !containerDiv) {
    console.error('gallery or slideshow-container not found');
    return;
  }

  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!safeImages.length) {
    console.error('No images to display');
    return;
  }

  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, safeImages.length) : safeImages.length;
  const safeDuration = Number.isFinite(durationSeconds) && durationSeconds > 0 ? Math.round(durationSeconds) : 30;

  imagesList2 = safeImages.slice(0, safeLimit);
  indexNow = 0;
  pause = false;
  durationGlobal = safeDuration;
  remainingSeconds = safeDuration;
  slideshowContainer = containerDiv;
  timerElement = containerDiv.querySelector('.timer');

  oldContent = gallery.innerHTML;
  gallery.style.display = 'none';
  containerDiv.style.display = 'flex';

  if (elementImage) {
    elementImage.remove();
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

  showImage(indexNow);
  startTimer(true);
}
