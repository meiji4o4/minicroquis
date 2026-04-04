import { startSlideSh } from "./slidesh.js";

let imagesList1=[];

const btn = document.getElementById('btn-load'); //serveur voit le bouton
const gallery = document.getElementById('gallery');//serveur voit la zone vide où il va poser les photos
const output = document.getElementById('output');//serveur voit zone où il écrira si erreurs

btn.addEventListener('click', async () => { // attend clique bouton
    gallery.innerHTML = '<p>Chargement des images...</p>';//écrit ça pdt que ça charge
    output.textContent = ''; // si y a avait msg erreur, effacement

    try { // faire
        const res = await fetch('/api/images'); 
        //appelle serveur.c pour la liste d'images en json et attend réponse.

        if (!res.ok) {
            throw new Error(`Erreur HTTP ${res.status}`);
            //si PB dans server.c, passe à la phase catch
        }
        const data = await res.json();// lecture du json envoyé par server.c


        gallery.innerHTML = ''; //vide gallery (enlève "chargement...")

        // Si aucune image
        if (!data.images || data.images.length === 0) {
            gallery.innerHTML = '<p>Aucune image trouvée.</p>';
            return;// arrête fonction
        }

        

        data.images.forEach(nom => {
            // Pour chaque nom de fichier, créer une balise img
            const img = document.createElement('img');
            //crée image vierge
            img.src = '/images/' + nom;
            //adresse image
            img.alt = nom;
            //alternative si pb connexion, malvoyants, SEO etc..
            img.style.maxWidth = '200px';//largeur max
            img.style.margin = '10px';//espaces entre images
            img.style.border = '1px solid #ccc';//bordures
            img.style.borderRadius = '4px';//bordures arrondies
            //format images
            gallery.appendChild(img); // ajoute image+style dans <div id="gallery">

        });

        imagesList1=data.images

    } catch (err) { //si erreur, faire
        output.textContent = 'Erreur : ' + err.message;
        gallery.innerHTML = ''; // efface le message de chargement
    }
});

// --- Gestion du mode (standard/class) ---
const std = document.getElementById('std');
const classmode = document.getElementById('classmode');
const classOptions = document.getElementById('classdurationchoice'); // le bloc des radios de durée
const stdOptions= document.getElementById('stddurationchoice')
const descSection=document.getElementById('descSection')
const descriptions = document.querySelectorAll('.duration_desc');
const customDurationBlock = document.getElementById('setcustomduration');
const stdDurationRadios= document.querySelectorAll('input[name="stdclassduration"]')

// Cache toutes les descriptions par défaut (via CSS ou JS)
descriptions.forEach(desc => desc.style.display = 'none');

function updateMenus() {
    if (std.checked) {
        classOptions.style.display = 'none';
        stdOptions.style.display = 'block';
        updateCustomDurationVisibility();
        // En mode standard, on cache aussi les descriptions
        descriptions.forEach(desc => desc.style.display = 'none');
    } 
    else {
        classOptions.style.display = 'block';
        descSection.style.display='block;';
        stdOptions.style.display = 'none';
        // En mode classe, on affiche la description correspondant à la durée sélectionnée
        updateDurationDesc();
    }
}

std.addEventListener('change', updateMenus);
classmode.addEventListener('change', updateMenus);
updateMenus(); // initialisation

// --- Gestion des durées ---
const durationRadios = document.querySelectorAll('input[name="classduration"]');

function updateDurationDesc() {
    // Cacher toutes les descriptions
    descriptions.forEach(desc => desc.style.display = 'none');

    // Trouver le radio coché
    const checkedRadio = document.querySelector('input[name="classduration"]:checked');
    if (checkedRadio) {
        const value = checkedRadio.value; // "30m", "1h", etc.
        const descId = 'desc' + value;    // "desc30m", "desc1h", etc.
        const descToShow = document.getElementById(descId);
        if (descToShow) {
            descToShow.style.display = 'block';
        }
    }
}

// Ajouter les écouteurs sur les radios de durée
durationRadios.forEach(radio => {
    radio.addEventListener('change', updateDurationDesc);
});

// Initialiser l'affichage de la description par défaut (si mode classe actif)
if (classmode.checked) {
    updateDurationDesc();
}

function updateCustomDurationVisibility(){
    const selected = document.querySelector('input[name="stdclassduration"]:checked');
    if (selected&&selected.value=='custom'){
        customDurationBlock.style.display='block';
    }
    else {
        customDurationBlock.style.display = 'none';
    }
}
updateCustomDurationVisibility();

stdDurationRadios.forEach(radio =>{
    radio.addEventListener('change',updateCustomDurationVisibility)
});



const start = document.getElementById('btn-start')

start.addEventListener('click', ()=> {
    const selectedDuration = document.querySelector('input[name=stdclassduration]:checked');

    let durationSec= 30;

    if(selectedDuration){
        if(selectedDuration.value=='custom'){

            const customTime= document.getElementById("customtime").value;
            const customUnit= document.getElementById("customunit").value;
            let val=parseFloat(customTime);
            if (isNaN(val)) val=30;
            durationSeconds = (unit ==='minutes')? val*60 : val;
            }
        else {
            const val= selectedDuration.value;
            if (val.endsWith('s')) durationSec=parseInt(val);
            else if (val.endsWith('m')) durationSec=parseInt(val)*60;


        }  

    }


    let limit = document.getElementById('n_images').value;
    limit=parseInt(limit);
    if(isNaN(limit)||limit<=0)limit=imagesList1.length;

    if (imagesList1.length==0){
        alert("No image loaded. Click on 'Show preview' first.");
        return;

    
    }

    startSlideSh(imagesList1,durationSec,limit);
}
);
