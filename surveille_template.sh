#!/bin/bash
while true; do
    inotifywait -e modify,close_write,move base_template.html base_style.css
    sleep 0.5  # attend 500 ms pour laisser le temps à d'autres écritures éventuelles
    echo "Fichier modifié, mise à jour de base_exe.html..."
    ./css_refresh
done