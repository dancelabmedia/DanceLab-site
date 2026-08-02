#!/usr/bin/env python3
"""
compress-images.py — Dance Lab
Réduit les images PNG/JPG du site pour accélérer le chargement sur Vercel.

Prérequis : pip install Pillow
Utilisation : python3 compress-images.py
"""

from PIL import Image
import os, glob, time

BASE = os.path.dirname(os.path.abspath(__file__))

FOLDERS = [
    # (dossier, largeur max en px)
    ("public/images/les-invites-header", 1400),   # fonds d'écran éditoriaux
    ("public/images/les-invites",         800),   # cartes / carousel
    ("public/episodes",                   800),   # thumbnails podcast
]

QUALITY = 82   # qualité JPEG (PNG est compressé via optimize=True)

def compress_folder(folder_rel, max_width):
    folder = os.path.join(BASE, folder_rel)
    if not os.path.isdir(folder):
        print(f"  ⚠ Dossier introuvable : {folder_rel}")
        return

    files = [
        f for ext in ("*.png", "*.PNG", "*.jpg", "*.JPG", "*.jpeg", "*.JPEG")
        for f in glob.glob(os.path.join(folder, ext))
        if not os.path.basename(f).startswith(' ')  # ignorer fichiers avec espace
    ]

    total_before = sum(os.path.getsize(f) for f in files)
    total_after  = 0
    errors       = []

    print(f"\n📂 {folder_rel}  ({len(files)} fichiers, {total_before/1024/1024:.0f} MB)")
    t0 = time.time()

    for i, path in enumerate(files, 1):
        try:
            img = Image.open(path)
            w, h = img.size

            # Redimensionner si trop large
            if w > max_width:
                img = img.resize((max_width, int(h * max_width / w)), Image.LANCZOS)

            ext = os.path.splitext(path)[1].lower()
            if ext == ".png":
                img.save(path, "PNG", optimize=True)
            else:
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                img.save(path, "JPEG", quality=QUALITY, optimize=True)

            total_after += os.path.getsize(path)

            if i % 10 == 0 or i == len(files):
                print(f"  {i}/{len(files)}…", end="\r")

        except Exception as e:
            errors.append(f"{os.path.basename(path)}: {e}")

    elapsed = time.time() - t0
    gain = (1 - total_after / total_before) * 100 if total_before else 0
    print(f"  ✅ {total_before/1024/1024:.0f} MB → {total_after/1024/1024:.0f} MB  ({gain:.0f}% de gain)  [{elapsed:.0f}s]")
    if errors:
        print(f"  ❌ Erreurs : {errors}")


if __name__ == "__main__":
    print("🔧 Compression des images Dance Lab…")
    for folder, max_w in FOLDERS:
        compress_folder(folder, max_w)
    print("\n✅ Terminé. Tu peux maintenant faire git add -A && git commit && git push.")
