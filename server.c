// server.c - Le serveur qui prend les commandes
#include <microhttpd.h>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include "gallery.h"

// Fonction qui répond au client
static enum MHD_Result repondre_au_client(void *cls, 
                                         struct MHD_Connection *client,
                                         const char *url, 
                                         const char *methode,
                                         const char *version, 
                                         const char *upload_data,
                                         size_t *upload_data_size, 
                                         void **con_cls) {
    

    if (strcmp(url, "/api/images") == 0) {

        char *json = liste_images_en_json("/mnt/e/projet_c/dummy_dir/");

        struct MHD_Response *assiette;
        assiette = MHD_create_response_from_buffer(strlen(json), 
                                                   (void*)json, 
                                                   MHD_RESPMEM_MUST_COPY);
        MHD_add_response_header(assiette, "Content-Type", "application/json");
        
        MHD_add_response_header(assiette, "Cache-Control", "no-cache, no-store, must-revalidate");
        MHD_add_response_header(assiette, "Pragma", "no-cache");
        MHD_add_response_header(assiette, "Expires", "0");
        

        enum MHD_Result resultat = MHD_queue_response(client, MHD_HTTP_OK, assiette);
        MHD_destroy_response(assiette);
        free(json); 
        
        return resultat;
    }

    const char *erreur = "<html><body><h1>404 - Page introuvable</h1></body></html>";
    struct MHD_Response *assiette;
    assiette = MHD_create_response_from_buffer(strlen(erreur), 
                                               (void*)erreur, 
                                               MHD_RESPMEM_PERSISTENT);
    MHD_add_response_header(assiette, "Content-Type", "text/html");
    enum MHD_Result resultat = MHD_queue_response(client, MHD_HTTP_NOT_FOUND, assiette);
    MHD_destroy_response(assiette);
    return resultat;
}


int main() {
 
    struct MHD_Daemon *restaurant;
    restaurant = MHD_start_daemon(MHD_USE_AUTO | MHD_USE_INTERNAL_POLLING_THREAD,
                                  8888, NULL, NULL,
                                  &repondre_au_client, NULL,
                                  MHD_OPTION_END);
    
    if (restaurant == NULL) {
        return 1;  
    }
    
    printf("Serv ouvert\n");
    printf("Appuyez sur Entrée pour fermer...\n");
    
    getchar();  
    
    MHD_stop_daemon(restaurant); 
    return 0;
}