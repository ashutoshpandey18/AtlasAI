import shutil
import os

source_dir = "/Users/air/.gemini/antigravity-ide/brain/44ebf03f-8e3b-4fd8-967e-436de1de64be"
dest_dir = "/Users/air/Desktop/Atlas/public/images"
os.makedirs(dest_dir, exist_ok=True)

mapping = {
    "media__1785869701721.png": "siting_pipeline_status.png",
    "media__1785783405412.png": "live_map_inspector.png",
    "media__1785869701775.png": "decision_ledger_copilot.png",
    "media__1785872987082.png": "replayable_ai_trace.png",
    "media__1785869701647.png": "investment_memo.png"
}

for src_name, dest_name in mapping.items():
    src_path = os.path.join(source_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    if os.path.exists(src_path):
        shutil.copy(src_path, dest_path)
        print(f"Copied {src_name} -> {dest_name}")
    else:
        print(f"Warning: {src_name} not found in source dir")
