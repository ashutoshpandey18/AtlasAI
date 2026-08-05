# scratch/crop_browser_tabs.py
import os
from PIL import Image

images_dir = "/Users/air/Desktop/Atlas/public/images"
ui_image_files = [
    "00_hero_landing_page.png",
    "01_siting_pipeline_status.png",
    "02_live_map_inspector.png",
    "03_replayable_ai_trace.png",
    "04_decision_ledger_copilot.png",
    "05_investment_memo.png"
]

# Amount of pixels to crop from the top (Safari browser window bar + tabs)
CROP_TOP_PIXELS = 82

for filename in ui_image_files:
    file_path = os.path.join(images_dir, filename)
    if os.path.exists(file_path):
        with Image.open(file_path) as img:
            width, height = img.size
            if height > CROP_TOP_PIXELS + 100:
                # Crop box: (left, upper, right, lower)
                cropped = img.crop((0, CROP_TOP_PIXELS, width, height))
                cropped.save(file_path)
                print(f"Successfully cropped top browser tabs from {filename} ({width}x{height} -> {width}x{height - CROP_TOP_PIXELS})")
            else:
                print(f"Skipped {filename} (too small to crop)")
    else:
        print(f"Warning: {filename} not found")
