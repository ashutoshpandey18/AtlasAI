import shutil
import os

source_dir = "/Users/air/.gemini/antigravity-ide/brain/44ebf03f-8e3b-4fd8-967e-436de1de64be"
dest_dir = "/Users/air/Desktop/Atlas/public/images"
os.makedirs(dest_dir, exist_ok=True)

mapping = {
    "media__1785961123505.png": "00_hero_landing_page.png",    # Hero Landing Page 3D Robot
    "media__1785961123422.png": "01_siting_pipeline_status.png", # Pipeline Status Stage 05
    "media__1785961123463.png": "02_live_map_inspector.png",     # Ector County Live Map Inspector
}

for src_name, dest_name in mapping.items():
    src_path = os.path.join(source_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    if os.path.exists(src_path):
        shutil.copy(src_path, dest_path)
        print(f"Successfully copied {src_name} -> {dest_name}")
    else:
        print(f"Error: {src_name} not found")
