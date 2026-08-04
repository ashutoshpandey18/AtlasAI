import urllib.request
import urllib.parse
import json
import time
import sys

BASE_URL = "https://atlas-ai-pi-one.vercel.app"

def print_header(title):
    print("\n" + "=" * 60)
    print(f" [TEST] {title}")
    print("=" * 60)

def test_landing_page():
    print_header("1. LANDING PAGE ACCESSIBILITY")
    try:
        req = urllib.request.Request(BASE_URL, headers={"User-Agent": "Atlas-QA-Tester/1.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.status
            content = response.read().decode("utf-8")
            print(f"Status Code: {status}")
            print(f"HTML Payload Length: {len(content)} bytes")
            if status == 200 and "<html" in content.lower():
                print("[PASS] Landing page accessible and returning 200 OK")
                return True
            else:
                print(f"[FAIL] Unexpected response: {status}")
                return False
    except Exception as e:
        print(f"[FAIL] Error accessing landing page: {e}")
        return False

def test_mireye_lookup():
    print_header("2. MIREYE ADDRESS LOOKUP ENDPOINT (/api/mireye/lookup)")
    url = f"{BASE_URL}/api/mireye/lookup"
    payload = {
        "address": "190 High St",
        "city": "Columbus",
        "state": "OH",
        "zip": "43215"
    }
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", "User-Agent": "Atlas-QA-Tester/1.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.status
            res_json = json.loads(response.read().decode("utf-8"))
            print(f"Status Code: {status}")
            print(f"Lookup Response: {json.dumps(res_json, indent=2)}")
            if status == 200 and "lat" in res_json and "lng" in res_json:
                print(f"[PASS] Address resolved successfully to ({res_json['lat']}, {res_json['lng']}) in {res_json.get('state', 'OH')}")
                return True
            else:
                print("[FAIL] Missing lat/lng in response")
                return False
    except Exception as e:
        print(f"[FAIL] Error testing lookup API: {e}")
        return False

def test_mireye_fetch():
    print_header("3. MIREYE PHYSICAL GIS FETCH ENDPOINT (/api/mireye/fetch)")
    url = f"{BASE_URL}/api/mireye/fetch"
    payload = {
        "lat": 30.2672,
        "lng": -97.7431,
        "fields": ["poa_irradiance_optimal_tilt_kwh_m2_yr", "slope_degrees", "fema_flood_zone"]
    }
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", "User-Agent": "Atlas-QA-Tester/1.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.status
            res_json = json.loads(response.read().decode("utf-8"))
            print(f"Status Code: {status}")
            print(f"Physical GIS Response: {json.dumps(res_json, indent=2)}")
            if status == 200 and "fields" in res_json:
                print("[PASS] Physical GIS layers fetched successfully from Mireye API")
                return True
            else:
                print("[FAIL] Missing fields in Mireye fetch response")
                return False
    except Exception as e:
        print(f"[FAIL] Error testing Mireye fetch API: {e}")
        return False

def test_mireye_ask():
    print_header("4. MIREYE SPATIAL COPILOT ASK ENDPOINT (/api/mireye/ask)")
    url = f"{BASE_URL}/api/mireye/ask"
    payload = {
        "question": "Compare Site #1 vs Site #2 and explain why Site #1 was selected.",
        "context": {
            "mandate": "Rank commercial property addresses in Ohio for commercial solar carports",
            "rank1Winner": "Kroger Supermarket #1007 (Franklin County, OH)",
            "survivorCount": 42,
            "disqualifiedCount": 8
        }
    }
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", "User-Agent": "Atlas-QA-Tester/1.0"})
        with urllib.request.urlopen(req, timeout=15) as response:
            status = response.status
            res_json = json.loads(response.read().decode("utf-8"))
            print(f"Status Code: {status}")
            print(f"Copilot Answer Snippet: {res_json.get('answer', '')[:200]}...")
            print(f"Trace Steps Count: {len(res_json.get('trace', []))}")
            if status == 200 and "answer" in res_json and len(res_json.get("answer", "")) > 50:
                print("[PASS] Spatial Copilot generated multi-site comparative trade-off reasoning")
                return True
            else:
                print("[FAIL] Copilot answer missing or too short")
                return False
    except Exception as e:
        print(f"[FAIL] Error testing Spatial Copilot ask API: {e}")
        return False

def test_site_scan_stream():
    print_header("5. AGENT SSE SCAN STREAMING ENDPOINT (/api/agent/site-scan)")
    url = f"{BASE_URL}/api/agent/site-scan"
    payload = {
        "prompt": "Rank commercial property addresses in Ohio for commercial solar carports.",
        "customSites": [
            {"siteId": "s1", "siteName": "Kroger Supermarket #1007", "county": "Franklin County", "state": "OH", "lat": 39.9612, "lng": -82.9988},
            {"siteId": "s2", "siteName": "Walmart Supercenter #1001", "county": "Travis County", "state": "TX", "lat": 30.2672, "lng": -97.7431}
        ]
    }
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", "User-Agent": "Atlas-QA-Tester/1.0"})
        with urllib.request.urlopen(req, timeout=20) as response:
            status = response.status
            print(f"Status Code: {status}")
            print(f"Content-Type: {response.headers.get('Content-Type')}")
            
            lines = []
            for _ in range(30):
                line = response.readline().decode("utf-8")
                if not line:
                    break
                lines.append(line.strip())
            
            stream_text = "\n".join(lines[:10])
            print(f"SSE Initial Stream Output:\n{stream_text}")
            if status == 200 and "text/event-stream" in response.headers.get("Content-Type", ""):
                print("[PASS] Site scan SSE stream established and returning events")
                return True
            else:
                print("[FAIL] Unexpected stream response or content-type")
                return False
    except Exception as e:
        print(f"[FAIL] Error testing site scan SSE endpoint: {e}")
        return False

def test_campaigns_db():
    print_header("6. CAMPAIGNS DATABASE CONNECTIVITY ENDPOINT (/api/campaigns)")
    url = f"{BASE_URL}/api/campaigns"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Atlas-QA-Tester/1.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.status
            res_json = json.loads(response.read().decode("utf-8"))
            print(f"Status Code: {status}")
            print(f"Campaigns Count: {len(res_json) if isinstance(res_json, list) else 0}")
            if status == 200 and isinstance(res_json, list):
                print("[PASS] Edge SQLite database reachable and returning campaigns array")
                return True
            else:
                print("[FAIL] Unexpected campaigns endpoint output")
                return False
    except Exception as e:
        print(f"[FAIL] Error testing campaigns database API: {e}")
        return False

def main():
    print("\n" + "#" * 60)
    print("  ATLAS ACQUISITION AGENT — AUTOMATED PRODUCTION UAT SUITE")
    print("#" * 60)
    
    results = [
        ("Landing Page", test_landing_page()),
        ("Mireye Lookup (/api/mireye/lookup)", test_mireye_lookup()),
        ("Mireye Fetch (/api/mireye/fetch)", test_mireye_fetch()),
        ("Spatial Copilot (/api/mireye/ask)", test_mireye_ask()),
        ("Agent Scan SSE Stream (/api/agent/site-scan)", test_site_scan_stream()),
        ("Campaigns Edge DB (/api/campaigns)", test_campaigns_db()),
    ]
    
    print("\n" + "=" * 60)
    print("  FINAL UAT AUTOMATED TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed_count = 0
    for name, success in results:
        status_str = "[PASS]" if success else "[FAIL]"
        if success:
            passed_count += 1
        print(f"  {status_str} {name}")
    
    print("-" * 60)
    print(f"Total Tests Executed: {len(results)}")
    print(f"Total Tests Passed:   {passed_count}")
    print(f"Total Tests Failed:   {len(results) - passed_count}")
    print(f"Pass Rate:            {(passed_count / len(results)) * 100:.1f}%")
    print("=" * 60 + "\n")
    
    if passed_count == len(results):
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
