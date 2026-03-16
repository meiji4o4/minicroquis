#!/usr/bin/env python3
import time
import os
import re
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

TEMPLATE_FILE = "base_template.html"
CSS_FILE = "base_style.css"
OUTPUT_FILE = "base_exe.html"
MARKER = "{{CSS_VERSION}}"

def get_css_timestamp():
    """Retourne le timestamp de dernière modification du CSS."""
    try:
        stat = os.stat(CSS_FILE)
        return int(stat.st_mtime)  # timestamp Unix
    except FileNotFoundError:
        return 0

def generate_html():
    """Lit le template, remplace le marqueur par le timestamp, écrit le fichier final."""
    try:
        with open(TEMPLATE_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        timestamp = get_css_timestamp()
        new_content = content.replace(MARKER, f"?v={timestamp}")
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ {OUTPUT_FILE} généré avec version ?v={timestamp}")
    except Exception as e:
        print(f"❌ Erreur lors de la génération : {e}")

class TemplateChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.is_directory:
            return
        # On surveille les deux fichiers
        if event.src_path.endswith((TEMPLATE_FILE, CSS_FILE)):
            print(f"📝 Fichier modifié : {event.src_path}")
            generate_html()

def main():
    print(f"🔍 Surveillance de {TEMPLATE_FILE} et {CSS_FILE}")
    # Génération initiale
    generate_html()
    event_handler = TemplateChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, path='.', recursive=False)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    main()