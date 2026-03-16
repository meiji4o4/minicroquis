#include <stdio.h>
#include <windows.h>

int main(void) {
    // 1. DÉCLARATIONS DE POINTEURS / HANDLES
    WIN32_FIND_DATAA findFileData;    // Structure (PAS un pointeur) pour stocker les infos du fichier
    HANDLE findHandle;                 // Pointeur "magique" vers l'itération en cours

    // 2. APPEL À FindFirstFileA : retour d'un HANDLE
    //    "dummy_dir\\*" → adresse de chaîne (const char *)
    //    &findFileData → ADRESSE de la structure (passage par référence)
    findHandle = FindFirstFileA("dummy_dir\\*", &findFileData);

    // 3. TEST DU HANDLE CONTRE INVALID_HANDLE_VALUE
    //    Compare le pointeur pour voir s'il a une valeur valide ou non
    if (findHandle == INVALID_HANDLE_VALUE) {
        printf("Cannot open directory\n");
        printf("Appuyez sur ENTREE pour continuer ");
        getchar();
        return 1;
    }

    printf("Directory opened successfully\n");
    while(1){

        int result;
        
        printf("%s\n", findFileData.cFileName);

        result = FindNextFileA(findHandle, &findFileData);

        if (result == 0) {      // 0 = FALSE pour les fonctions Windows
            break;
        }
    }


    // 7. FERMETURE DU HANDLE
    //    Passe le HANDLE pour que Windows sache quelle itération fermer
    FindClose(findHandle);
    
    printf("Appuyez sur ENTREE pour continuer ");
    getchar();
    return 0;
}
