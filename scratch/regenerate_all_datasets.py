# scratch/regenerate_all_datasets.py
import csv
import os
import random

out_dir = "/Users/air/Desktop/Atlas/public/data"
os.makedirs(out_dir, exist_ok=True)

# 1. Generate Brand-New Fresh Address Dataset (500 Sites)
cities_states = [
    ("Houston", "TX", 29.7604, -95.3698, "77002"),
    ("Dallas", "TX", 32.7767, -96.7970, "75201"),
    ("Austin", "TX", 30.2672, -97.7431, "78701"),
    ("San Antonio", "TX", 29.4241, -98.4936, "78205"),
    ("Fort Worth", "TX", 32.7555, -97.3308, "76102"),
    ("Los Angeles", "CA", 34.0522, -118.2437, "90012"),
    ("Ontario", "CA", 34.0633, -117.6509, "91761"),
    ("Fremont", "CA", 37.5483, -121.9886, "94538"),
    ("Stockton", "CA", 37.9577, -121.2908, "95202"),
    ("San Diego", "CA", 32.7157, -117.1611, "92101"),
    ("Miami", "FL", 25.7617, -80.1918, "33130"),
    ("Orlando", "FL", 28.5383, -81.3792, "32801"),
    ("Jacksonville", "FL", 30.3322, -81.6557, "32202"),
    ("Tampa", "FL", 27.9506, -82.4572, "33602"),
    ("Lakeland", "FL", 28.0395, -81.9498, "33801"),
    ("Atlanta", "GA", 33.7490, -84.3880, "30303"),
    ("Savannah", "GA", 32.0809, -81.0912, "31401"),
    ("Phoenix", "AZ", 33.4484, -112.0740, "85003"),
    ("Tucson", "AZ", 32.2226, -110.9747, "85701"),
    ("Goodyear", "AZ", 33.4353, -112.3577, "85338"),
    ("Columbus", "OH", 39.9612, -82.9988, "43215"),
    ("Cincinnati", "OH", 39.1031, -84.5120, "45202"),
    ("Cleveland", "OH", 41.4993, -81.6944, "44113"),
    ("Charlotte", "NC", 35.2271, -80.8431, "28202"),
    ("Raleigh", "NC", 35.7796, -78.6382, "27601"),
    ("Chicago", "IL", 41.8781, -87.6298, "60604"),
    ("Joliet", "IL", 41.5250, -88.0817, "60431"),
    ("Denver", "CO", 39.7392, -104.9903, "80202"),
    ("Seattle", "WA", 47.6062, -122.3321, "98101"),
    ("Las Vegas", "NV", 36.1699, -115.1398, "89101")
]

street_names = ["Commerce Way", "Logistics Pkwy", "Industrial Blvd", "Tradeport Dr", "Enterprise Rd", "Technology Way", "Freight Corridor Rd", "Corporate Pkwy", "Gateway Blvd", "Distribution Center Dr"]
chains = ["Kroger Supermarket", "Target Logistics Hub", "Amazon Fulfillment Center", "Home Depot Supply Yard", "Walmart Supercenter", "Costco Wholesale Depot", "Publix Distribution Center", "UPS Global Freight", "FedEx Express Terminal", "Sysco Cold Storage"]

fresh_addresses_500 = []
for i in range(1, 501):
    c_info = cities_states[i % len(cities_states)]
    st_num = 1000 + (i * 12)
    st_name = street_names[i % len(street_names)]
    chain = chains[i % len(chains)]
    if i == 1:
        chain = "Kroger Supermarket"
        c_info = ("Columbus", "OH", 39.9881, -83.0384, "43212")
        st_num = 1500
        st_name = "W 5th Ave"

    lat = c_info[2] + ((random.random() - 0.5) * 0.15)
    lon = c_info[3] + ((random.random() - 0.5) * 0.15)
    
    fresh_addresses_500.append({
        "geo_id": f"FRESH-US-{c_info[1]}-{i:04d}",
        "chain": chain,
        "address": f"{st_num} {st_name}",
        "city": c_info[0],
        "state": c_info[1],
        "zip": c_info[4],
        "lat": round(lat, 5),
        "lon": round(lon, 5),
        "size_sqft": 35000 + (i * 850),
        "property_type": "Commercial Logistics & Retail"
    })

# Write Address CSVs
fieldnames_addr = ["geo_id", "chain", "address", "city", "state", "zip", "lat", "lon", "size_sqft", "property_type"]

def write_addr_csv(filename, count):
    path = os.path.join(out_dir, filename)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames_addr)
        writer.writeheader()
        for item in fresh_addresses_500[:count]:
            writer.writerow(item)
    print(f"Wrote {count} fresh addresses to {path}")

write_addr_csv("address_portfolio_15.csv", 15)
write_addr_csv("address_portfolio_20.csv", 20)
write_addr_csv("address_portfolio_50.csv", 50)
write_addr_csv("address_portfolio_100.csv", 100)
write_addr_csv("address_portfolio_300.csv", 300)
write_addr_csv("address_portfolio_500.csv", 500)

# 2. Generate Option A Coordinate Dataset (100 Coords)
fresh_coords_100 = []
fieldnames_coord = ["geo_id", "chain", "latitude", "longitude", "city", "state"]

for i in range(1, 101):
    c_info = cities_states[(i * 3) % len(cities_states)]
    lat = c_info[2] + ((random.random() - 0.5) * 0.18)
    lon = c_info[3] + ((random.random() - 0.5) * 0.18)
    fresh_coords_100.append({
        "geo_id": f"FRESH-COORD-{c_info[1]}-{i:04d}",
        "chain": f"{c_info[0]} Solar Freight Hub #{i}",
        "latitude": round(lat, 5),
        "longitude": round(lon, 5),
        "city": c_info[0],
        "state": c_info[1]
    })

coord_path = os.path.join(out_dir, "coordinates_portfolio_100.csv")
with open(coord_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames_coord)
    writer.writeheader()
    for item in fresh_coords_100:
        writer.writerow(item)

print(f"Wrote 100 fresh coordinates to {coord_path}")
