import shutil
import os

source_dir = "/Users/air/.gemini/antigravity-ide/brain/44ebf03f-8e3b-4fd8-967e-436de1de64be"
dest_dir = "/Users/air/Desktop/Atlas/public/images"
os.makedirs(dest_dir, exist_ok=True)

mapping = {
    # UI Screenshots
    "media__1785869701721.png": "01_siting_pipeline_status.png", # Pipeline Status (Black Robot)
    "media__1785783405412.png": "02_live_map_inspector.png",     # Vector OSM Map Tiles
    "media__1785872987082.png": "03_replayable_ai_trace.png",    # Winner Card & 10-Stage Trace
    "media__1785869701775.png": "04_decision_ledger_copilot.png",# Decision Ledger & Copilot Q&A
    "media__1785869701647.png": "05_investment_memo.png",        # 3-Page Investment Memo Modal

    # Insomnia Screenshots
    "media__1785958684658.png": "insomnia_01_fetch.png",         # POST /v1/fetch
    "media__1785958684721.png": "insomnia_02_ask.png",           # POST /v1/ask
    "media__1785958684732.png": "insomnia_03_site_scan.png",     # POST /api/agent/site-scan
    "media__1785958684686.png": "insomnia_04_campaigns_post.png",# POST /api/campaigns
    "media__1785958684703.png": "insomnia_05_campaigns_get.png"  # GET /api/campaigns
}

for src_name, dest_name in mapping.items():
    src_path = os.path.join(source_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    if os.path.exists(src_path):
        shutil.copy(src_path, dest_path)
        print(f"Successfully copied {src_name} -> {dest_name}")
    else:
        print(f"Error: {src_name} not found")
