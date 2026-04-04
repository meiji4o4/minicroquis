import { startSlideSh } from './slidesh.js';

let imagesList1 = [];

const btnLoad = document.getElementById('btn-load');
const btnStart = document.getElementById('btn-start');
const gallery = document.getElementById('gallery');
const output = document.getElementById('output');

const std = document.getElementById('std');
const classmode = document.getElementById('classmode');
const classOptions = document.getElementById('classdurationchoice');
const stdOptions = document.getElementById('stddurationchoice');
const descSection = document.getElementById('descSection');
const descriptions = document.querySelectorAll('.duration_desc');
const customDurationBlock = document.getElementById('setcustomduration');
const stdDurationRadios = document.querySelectorAll('input[name="stdclassduration"]');
const classDurationRadios = document.querySelectorAll('input[name="classduration"]');

function setOutput(message = '') {
  if (!output) return;
  output.textContent = message;
  output.style.display = message ? 'block' : 'none';
}

function renderPreview(images) {
  if (!gallery) return;
  gallery.innerHTML = '';

  if (!images.length) {
    gallery.innerHTML = '<p>Aucune image trouvée.</p>';
    return;
  }

  images.forEach((name) => {
    const img = document.createElement('img');
    img.src = '/images/' + name;
    img.alt = name;
    img.loading = 'lazy';
    gallery.appendChild(img);
  });
}

async function loadImages() {
  if (!gallery) return;

  gallery.innerHTML = '<p>Chargement des images...</p>';
  setOutput('');

  try {
    const res = await fetch('/api/images');
    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }

    const data = await res.json();
    imagesList1 = Array.isArray(data.images) ? data.images : [];
    renderPreview(imagesList1);
  } catch (err) {
    imagesList1 = [];
    gallery.innerHTML = '';
    setOutput('Erreur : ' + err.message);
  }
}

function updateDurationDesc() {
  descriptions.forEach((desc) => {
    desc.style.display = 'none';
  });

  const checkedRadio = document.querySelector('input[name="classduration"]:checked');
  if (!checkedRadio) return;

  const descToShow = document.getElementById('desc' + checkedRadio.value);
  if (descToShow) {
    descToShow.style.display = 'block';
  }
}

function updateCustomDurationVisibility() {
  const selected = document.querySelector('input[name="stdclassduration"]:checked');
  if (!customDurationBlock) return;

  customDurationBlock.style.display = selected && selected.value === 'custom' ? 'block' : 'none';
}

function updateMenus() {
  const isStd = std && std.checked;

  if (classOptions) classOptions.style.display = isStd ? 'none' : 'block';
  if (stdOptions) stdOptions.style.display = isStd ? 'block' : 'none';
  if (descSection) descSection.style.display = isStd ? 'none' : 'block';

  if (isStd) {
    descriptions.forEach((desc) => {
      desc.style.display = 'none';
    });
    updateCustomDurationVisibility();
  } else {
    updateDurationDesc();
  }
}

function getStandardDurationSeconds() {
  const selected = document.querySelector('input[name="stdclassduration"]:checked');
  if (!selected) return 30;

  if (selected.value === 'custom') {
    const customTimeInput = document.getElementById('customtime');
    const customUnitSelect = document.getElementById('customunit');

    let value = Number.parseFloat(customTimeInput?.value ?? '30');
    if (!Number.isFinite(value) || value <= 0) value = 30;

    const unit = customUnitSelect?.value ?? 'seconds';
    return unit === 'minutes' ? Math.round(value * 60) : Math.round(value);
  }

  const raw = selected.value.trim();
  if (raw.endsWith('s')) return Number.parseInt(raw, 10) || 30;
  if (raw.endsWith('m')) return (Number.parseInt(raw, 10) || 1) * 60;

  return 30;
}

function getImageLimit() {
  const input = document.getElementById('n_images');
  const value = Number.parseInt(input?.value ?? '', 10);

  if (!Number.isFinite(value) || value <= 0) {
    return imagesList1.length;
  }

  return Math.min(value, imagesList1.length);
}

function startPreviewSlideshow() {
  if (!imagesList1.length) {
    alert("No image loaded. Click on 'Show preview' first.");
    return;
  }

  let durationSec = 30;

  if (std && std.checked) {
    durationSec = getStandardDurationSeconds();
  } else {
    setOutput('Mode class : lecture avec intervalle fixe de 30 secondes (logique avancée non définie dans le JS fourni).');
  }

  const limit = getImageLimit();
  startSlideSh(imagesList1, durationSec, limit);
}

if (btnLoad) {
  btnLoad.addEventListener('click', loadImages);
}

if (btnStart) {
  btnStart.addEventListener('click', startPreviewSlideshow);
}

if (std) std.addEventListener('change', updateMenus);
if (classmode) classmode.addEventListener('change', updateMenus);

stdDurationRadios.forEach((radio) => {
  radio.addEventListener('change', updateCustomDurationVisibility);
});

classDurationRadios.forEach((radio) => {
  radio.addEventListener('change', updateDurationDesc);
});

descriptions.forEach((desc) => {
  desc.style.display = 'none';
});

updateMenus();
