# scratch/generate_all_coords_datasets.py
import csv
import os
import random

out_dir = "/Users/air/Desktop/Atlas/public/data"
os.makedirs(out_dir, exist_ok=True)

cities_states = [
    ("Houston", "TX", 29.7604, -95.3698),
    ("Dallas", "TX", 32.7767, -96.7970),
    ("Austin", "TX", 30.2672, -97.7431),
    ("San Antonio", "TX", 29.4241, -98.4936),
    ("Fort Worth", "TX", 32.7555, -97.3308),
    ("Los Angeles", "CA", 34.0522, -118.2437),
    ("Ontario", "CA", 34.0633, -117.6509),
    ("Fremont", "CA", 37.5483, -121.9886),
    ("Stockton", "CA", 37.9577, -121.2908),
    ("San Diego", "CA", 32.7157, -117.1611),
    ("Miami", "FL", 25.7617, -80.1918),
    ("Orlando", "FL", 28.5383, -81.3792),
    ("Jacksonville", "FL", 30.3322, -81.6557),
    ("Tampa", "FL", 27.9506, -82.4572),
    ("Lakeland", "FL", 28.0395, -81.9498),
    ("Atlanta", "GA", 33.7490, -84.3880),
    ("Savannah", "GA", 32.0809, -81.0912),
    ("Phoenix", "AZ", 33.4484, -112.0740),
    ("Tucson", "AZ", 32.2226, -110.9747),
    ("Goodyear", "AZ", 33.4353, -112.3577),
    ("Columbus", "OH", 39.9612, -82.9988),
    ("Cincinnati", "OH", 39.1031, -84.5120),
    ("Cleveland", "OH", 41.4993, -81.6944),
    ("Charlotte", "NC", 35.2271, -80.8431),
    ("Raleigh", "NC", 35.7796, -78.6382),
    ("Chicago", "IL", 41.8781, -87.6298),
    ("Joliet", "IL", 41.5250, -88.0817),
    ("Denver", "CO", 39.7392, -104.9903),
    ("Seattle", "WA", 47.6062, -122.3321),
    ("Las Vegas", "NV", 36.1699, -115.1398)
]

fresh_coords_500 = []
for i in range(1, 501):
    c_info = cities_states[i % len(cities_states)]
    lat = c_info[2] + ((random.random() - 0.5) * 0.18)
    lon = c_info[3] + ((random.random() - 0.5) * 0.18)
    fresh_coords_500.append({
        "geo_id": f"FRESH-COORD-{c_info[1]}-{i:04d}",
        "chain": f"{c_info[0]} Solar Freight Hub #{i}",
        "latitude": round(lat, 5),
        "longitude": round(lon, 5),
        "city": c_info[0],
        "state": c_info[1]
    })

fieldnames_coord = ["geo_id", "chain", "latitude", "longitude", "city", "state"]

def write_coord_csv(filename, count):
    path = os.path.join(out_dir, filename)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames_coord)
        writer.writeheader()
        for item in fresh_coords_500[:count]:
            writer.writerow(item)
    print(f"Wrote {count} fresh coordinates to {path}")

write_coord_csv("coordinates_portfolio_15.csv", 15)
write_coord_csv("coordinates_portfolio_20.csv", 20)
write_coord_csv("coordinates_portfolio_50.csv", 50)
write_coord_csv("coordinates_portfolio_100.csv", 100)
write_coord_csv("coordinates_portfolio_300.csv", 300)
write_coord_csv("coordinates_portfolio_500.csv", 500)
