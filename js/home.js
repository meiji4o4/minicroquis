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

const CLASS_PRESETS = {
  '30m': ['10x30s', '5x1m', '2x5m', '1x10m'],
  '1h': ['10x30s', '5x1m', '2x5m', '1x10m', 'break:5m', '1x25m'],
  '1h30': ['6x30s', '3x1m', '2x3m', '1x10m', '1x25m', 'break:8m', '1x35m'],
  '2h': ['6x30s', '3x1m', '2x5m', '2x10m', '1x20m', 'break:14m', '1x50m'],
  '3h': ['6x30s', '3x1m', '2x5m', '1x10m', '1x20m', 'break:10m', '2x30m', 'break:10m', '1x50m'],
  '6h': [
    '10x30s', '5x1m', '2x5m', '1x10m', '1x20m',
    'break:10m',
    '2x30m',
    'break:10m',
    '1x50m',
    'break:45m',
    '4x30s', '3x1m', '2x5m', '2x10m',
    'break:10m',
    '1x1h30m'
  ]
};

/* Je découvre ici l'utilisation du parsing, d'où cette mise en forme.
   Dans une situation réelle, je pense simplement utiliser une structure plus "objet" pour les presets. */

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

  customDurationBlock.style.display =
    selected && selected.value === 'custom' ? 'block' : 'none';
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

function parseDuration(text) {
  let total = 0;
  const matches = text.matchAll(/(\d+)(h|m|s)/g);

  for (const match of matches) {
    const value = Number(match[1]);
    const unit = match[2];

    if (unit === 'h') total += value * 3600;
    if (unit === 'm') total += value * 60;
    if (unit === 's') total += value;
  }

  return total;
}

function getSelectedClassPresetKey() {
  const checked = document.querySelector('input[name="classduration"]:checked');
  return checked ? checked.value : null;
}

function parsePresetItem(item) {
  // Déclare une fonction qui reçoit une chaîne, par ex. "10x30s"
  if (item.startsWith('break:')) {
    // Si la chaîne commence par "break:"
    return {
      // on renvoie immédiatement un objet
      type: 'break', // type = pause
      duration: parseDuration(item.slice(6)) // on enlève "break:" puis on convertit le reste en secondes
    };
  }

  const match = item.match(/^(\d+)x(.+)$/); // Essaie de lire un format comme "10x30s"
  if (!match) return null; // Si le format ne correspond pas, on renvoie null

  return {
    // Sinon on renvoie un objet "bloc d'images"
    type: 'image-block', // type = bloc d'images
    count: Number(match[1]), // match[1] = le nombre avant le x, ex "10" -> 10
    duration: parseDuration(match[2]) // match[2] = la durée après le x, ex "30s" -> 30
  };
}

function buildClassSequence(images, presetKey) {
  const preset = CLASS_PRESETS[presetKey];
  if (!preset) return [];

  const sequence = [];
  let imageIndex = 0;

  for (const rawItem of preset) {
    const item = parsePresetItem(rawItem);
    if (!item) continue;

    if (item.type === 'break') {
      sequence.push(item);
      continue;
    }

    for (let i = 0; i < item.count && imageIndex < images.length; i += 1) {
      sequence.push({
        type: 'image',
        name: images[imageIndex],
        duration: item.duration
      });

      imageIndex += 1;
    }
  }

  return sequence;
}

function buildStandardSequence(images, durationSec) {
  return images.map((name) => ({
    type: 'image',
    name,
    duration: durationSec
  }));
}

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function startPreviewSlideshow() {
  if (!imagesList1.length) {
    alert("No image loaded. Click on 'Show preview' first.");
    return;
  }

  const selectedImages = imagesList1.slice(0, getImageLimit());
  const shuffledImages = shuffleArray(selectedImages);

  let sequence = [];

  if (std && std.checked) {
    const durationSec = getStandardDurationSeconds();
    sequence = buildStandardSequence(shuffledImages, durationSec);
  } else {
    const presetKey = getSelectedClassPresetKey();
    sequence = buildClassSequence(shuffledImages, presetKey);
  }

  if (!sequence.length) {
    setOutput('Impossible de construire la séquence.');
    return;
  }

  setOutput('');
  startSlideSh(sequence);
}

if (btnLoad) {
  btnLoad.addEventListener('click', loadImages);
}

if (btnStart) {
  btnStart.addEventListener('click', startPreviewSlideshow);
}

if (std) {
  std.addEventListener('change', updateMenus);
}

if (classmode) {
  classmode.addEventListener('change', updateMenus);
}

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