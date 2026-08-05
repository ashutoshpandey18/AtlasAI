import shutil
import os

source_dir = "/Users/air/.gemini/antigravity-ide/brain/44ebf03f-8e3b-4fd8-967e-436de1de64be"
dest_dir = "/Users/air/Desktop/Atlas/public/images"
os.makedirs(dest_dir, exist_ok=True)

mapping = {
    "media__1785958684658.png": "insomnia_fetch.png",
    "media__1785958684686.png": "insomnia_campaigns_post.png",
    "media__1785958684703.png": "insomnia_campaigns_get.png",
    "media__1785958684721.png": "insomnia_ask.png",
    "media__1785958684732.png": "insomnia_site_scan.png"
}

for src_name, dest_name in mapping.items():
    src_path = os.path.join(source_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    if os.path.exists(src_path):
        shutil.copy(src_path, dest_path)
        print(f"Copied {src_name} -> {dest_name}")
    else:
        print(f"Warning: {src_name} not found")
