// gallery.c - La cuisine qui prépare le JSON
#include "gallery.h"
#include <dirent.h>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>


char* liste_images_en_json(char* chemin_du_dossier) {

    DIR *dossier = opendir(chemin_du_dossier);
    if (dossier == NULL) {

        char *message_erreur = malloc(100);
        sprintf(message_erreur, "{\"erreur\":\"dossier_introuvable\"}");
        return message_erreur;
    }
    
    
    char *ma_feuille_json = malloc(5000);
    strcpy(ma_feuille_json, "{\"images\":[");
    
   
    struct dirent *fichier;
    int premier = 1;  
    int trouve = 0;
    
    while ((fichier = readdir(dossier)) != NULL) {
        
        if (strcmp(fichier->d_name, ".") == 0) continue;
        if (strcmp(fichier->d_name, "..") == 0) continue;
        
        
        char *point = strrchr(fichier->d_name, '.');
        
        
        if (point != NULL) {
            if (strcmp(point, ".jpg") == 0 || strcmp(point, ".png") == 0) {

                if (!premier) {
                    strcat(ma_feuille_json, ",");

                }
                
                premier = 0;
               
                
               
                strcat(ma_feuille_json, "\"");
                strcat(ma_feuille_json, fichier->d_name);
                strcat(ma_feuille_json, "\"");
            }
        }
    }
    
   
    closedir(dossier);
    char tmp;
    strcat(ma_feuille_json, "]}");
    
    return ma_feuille_json;
}