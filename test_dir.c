#include <stdio.h>
#include <dirent.h>

int main(){

    DIR *folder;
    struct dirent *file;
    
    folder = opendir("/home/test/Bureau/Projet C linux/dummy_dir");


    if (folder == NULL) {
        perror("opendir");
        return 1;
    }

    printf("Directory opened successfully\n");

    file = readdir(folder);    // Get first file
    while (file != NULL) {     // While we got something
    printf("%s\n", file->d_name);
    file = readdir(folder); // Get next file
}
closedir(folder);

printf("Veuillez appuyer sur une touche pour continuer ");
getchar();

return 0;

}



//E:\dummy_dir
