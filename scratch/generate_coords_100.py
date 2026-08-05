# scratch/generate_coords_100.py
import csv
import os

# 100 Brand-New Geographic Coordinates across major US commercial solar corridors
coords = [
    # Texas (TX) - 15 Fresh Coordinates
    {"name": "Austin Solar Logistics Hub", "lat": 30.2241, "lon": -97.7715, "state": "TX", "city": "Austin"},
    {"name": "Houston Energy Corridor Site A", "lat": 29.7892, "lon": -95.6412, "state": "TX", "city": "Houston"},
    {"name": "Dallas Freight Logistics Hub", "lat": 32.7481, "lon": -96.8812, "state": "TX", "city": "Dallas"},
    {"name": "San Antonio Solar Yard B", "lat": 29.4182, "lon": -98.5312, "state": "TX", "city": "San Antonio"},
    {"name": "Fort Worth Industrial Park C", "lat": 32.6841, "lon": -97.3114, "state": "TX", "city": "Fort Worth"},
    {"name": "Arlington Commercial Hub D", "lat": 32.6981, "lon": -97.1412, "state": "TX", "city": "Arlington"},
    {"name": "Plano Tech Center E", "lat": 33.0514, "lon": -96.7412, "state": "TX", "city": "Plano"},
    {"name": "Garland Distribution Center F", "lat": 32.9114, "lon": -96.6114, "state": "TX", "city": "Garland"},
    {"name": "Irving Freight Yard G", "lat": 32.8814, "lon": -96.9814, "state": "TX", "city": "Irving"},
    {"name": "Frisco Logistics Center H", "lat": 33.1814, "lon": -96.8114, "state": "TX", "city": "Frisco"},
    {"name": "McKinney Industrial Site I", "lat": 33.2114, "lon": -96.6314, "state": "TX", "city": "McKinney"},
    {"name": "Lubbock Solar Corridor J", "lat": 33.5914, "lon": -101.8914, "state": "TX", "city": "Lubbock"},
    {"name": "Corpus Christi Freight Hub K", "lat": 27.7814, "lon": -97.4314, "state": "TX", "city": "Corpus Christi"},
    {"name": "Laredo Cross-Border Yard L", "lat": 27.5314, "lon": -99.4814, "state": "TX", "city": "Laredo"},
    {"name": "El Paso Industrial Yard M", "lat": 31.7814, "lon": -106.4114, "state": "TX", "city": "El Paso"},

    # California (CA) - 15 Fresh Coordinates
    {"name": "Ontario Logistics Mega Park", "lat": 34.0512, "lon": -117.5814, "state": "CA", "city": "Ontario"},
    {"name": "Fremont Tech Manufacturing Hub", "lat": 37.5114, "lon": -121.9481, "state": "CA", "city": "Fremont"},
    {"name": "Los Angeles Port Logistics Yard", "lat": 33.7814, "lon": -118.2412, "state": "CA", "city": "Los Angeles"},
    {"name": "Stockton Central Freight Hub", "lat": 37.9314, "lon": -121.2814, "state": "CA", "city": "Stockton"},
    {"name": "San Diego Otay Mesa Solar Yard", "lat": 32.5814, "lon": -116.9614, "state": "CA", "city": "San Diego"},
    {"name": "Rancho Cucamonga Depot A", "lat": 34.1214, "lon": -117.5614, "state": "CA", "city": "Rancho Cucamonga"},
    {"name": "Riverside Freight Logistics B", "lat": 33.9514, "lon": -117.3814, "state": "CA", "city": "Riverside"},
    {"name": "Bakersfield Industrial Park C", "lat": 35.3414, "lon": -119.0114, "state": "CA", "city": "Bakersfield"},
    {"name": "Fresno Commercial Yard D", "lat": 36.7214, "lon": -119.7814, "state": "CA", "city": "Fresno"},
    {"name": "Sacramento Supply Hub E", "lat": 38.5614, "lon": -121.4814, "state": "CA", "city": "Sacramento"},
    {"name": "San Jose Tech Park F", "lat": 37.3114, "lon": -121.8814, "state": "CA", "city": "San Jose"},
    {"name": "Santa Clarita Commercial Yard G", "lat": 34.4114, "lon": -118.5314, "state": "CA", "city": "Santa Clarita"},
    {"name": "Chino Industrial Logistics H", "lat": 34.0114, "lon": -117.6814, "state": "CA", "city": "Chino"},
    {"name": "Fontana Freight Hub I", "lat": 34.0814, "lon": -117.4414, "state": "CA", "city": "Fontana"},
    {"name": "Moreno Valley Supply Hub J", "lat": 33.9114, "lon": -117.2214, "state": "CA", "city": "Moreno Valley"},

    # Florida (FL) - 10 Fresh Coordinates
    {"name": "Lakeland Central Logistics Yard", "lat": 28.0214, "lon": -81.9814, "state": "FL", "city": "Lakeland"},
    {"name": "Miami International Freight Hub", "lat": 25.8114, "lon": -80.3414, "state": "FL", "city": "Miami"},
    {"name": "Orlando Commerce Center A", "lat": 28.5214, "lon": -81.4214, "state": "FL", "city": "Orlando"},
    {"name": "Jacksonville Logistics Hub B", "lat": 30.3814, "lon": -81.6814, "state": "FL", "city": "Jacksonville"},
    {"name": "Tampa Bay Freight Yard C", "lat": 27.9614, "lon": -82.4414, "state": "FL", "city": "Tampa"},
    {"name": "Hialeah Commercial Site D", "lat": 25.8414, "lon": -80.3114, "state": "FL", "city": "Hialeah"},
    {"name": "Fort Lauderdale Freight Hub E", "lat": 26.1114, "lon": -80.1714, "state": "FL", "city": "Fort Lauderdale"},
    {"name": "Port St Lucie Commercial Yard F", "lat": 27.2814, "lon": -80.3614, "state": "FL", "city": "Port St Lucie"},
    {"name": "Cape Coral Solar Site G", "lat": 26.6314, "lon": -81.9714, "state": "FL", "city": "Cape Coral"},
    {"name": "Tallahassee Industrial Site H", "lat": 30.4314, "lon": -84.2814, "state": "FL", "city": "Tallahassee"},

    # Georgia (GA) - 10 Fresh Coordinates
    {"name": "Atlanta South Tradeport Yard", "lat": 33.6314, "lon": -84.4114, "state": "GA", "city": "Atlanta"},
    {"name": "Savannah Port Logistics Hub", "lat": 32.0814, "lon": -81.1214, "state": "GA", "city": "Savannah"},
    {"name": "Macon Central Industrial Park", "lat": 32.8114, "lon": -83.6414, "state": "GA", "city": "Macon"},
    {"name": "Augusta Freight Terminal A", "lat": 33.4514, "lon": -81.9814, "state": "GA", "city": "Augusta"},
    {"name": "Columbus Commercial Yard B", "lat": 32.4814, "lon": -84.9714, "state": "GA", "city": "Columbus"},
    {"name": "Marietta Supply Hub C", "lat": 33.9414, "lon": -84.5314, "state": "GA", "city": "Marietta"},
    {"name": "Alpharetta Tech Center D", "lat": 34.0614, "lon": -84.2714, "state": "GA", "city": "Alpharetta"},
    {"name": "Lawrenceville Commercial Yard E", "lat": 33.9414, "lon": -84.0114, "state": "GA", "city": "Lawrenceville"},
    {"name": "Duluth Logistics Center F", "lat": 34.0114, "lon": -84.1414, "state": "GA", "city": "Duluth"},
    {"name": "Kennesaw Industrial Yard G", "lat": 34.0314, "lon": -84.6114, "state": "GA", "city": "Kennesaw"},

    # Arizona (AZ) - 10 Fresh Coordinates
    {"name": "Phoenix West Industrial Park", "lat": 33.4614, "lon": -112.1814, "state": "AZ", "city": "Phoenix"},
    {"name": "Goodyear Solar Logistics Hub", "lat": 33.4214, "lon": -112.3814, "state": "AZ", "city": "Goodyear"},
    {"name": "Tucson Commercial Freight Yard", "lat": 32.2114, "lon": -110.9614, "state": "AZ", "city": "Tucson"},
    {"name": "Mesa Industrial Park A", "lat": 33.4114, "lon": -111.8114, "state": "AZ", "city": "Mesa"},
    {"name": "Chandler Semiconductor Yard B", "lat": 33.2814, "lon": -111.8814, "state": "AZ", "city": "Chandler"},
    {"name": "Gilbert Commercial Site C", "lat": 33.3414, "lon": -111.7814, "state": "AZ", "city": "Gilbert"},
    {"name": "Glendale Supply Hub D", "lat": 33.5214, "lon": -112.1814, "state": "AZ", "city": "Glendale"},
    {"name": "Scottsdale Tech Park E", "lat": 33.6114, "lon": -111.9114, "state": "AZ", "city": "Scottsdale"},
    {"name": "Tempe Logistics Hub F", "lat": 33.4114, "lon": -111.9314, "state": "AZ", "city": "Tempe"},
    {"name": "Surprise Industrial Yard G", "lat": 33.6214, "lon": -112.3614, "state": "AZ", "city": "Surprise"},

    # Ohio (OH) - 10 Fresh Coordinates
    {"name": "Columbus Groveport Mega Hub", "lat": 39.8714, "lon": -82.9314, "state": "OH", "city": "Columbus"},
    {"name": "Cincinnati Freight Terminal A", "lat": 39.1114, "lon": -84.5114, "state": "OH", "city": "Cincinnati"},
    {"name": "Cleveland Lakefront Yard B", "lat": 41.4814, "lon": -81.6814, "state": "OH", "city": "Cleveland"},
    {"name": "Akron Industrial Center C", "lat": 41.0714, "lon": -81.5114, "state": "OH", "city": "Akron"},
    {"name": "Toledo Commercial Site D", "lat": 41.6414, "lon": -83.5414, "state": "OH", "city": "Toledo"},
    {"name": "Dayton Parcel Logistics E", "lat": 39.7714, "lon": -84.1814, "state": "OH", "city": "Dayton"},
    {"name": "Dublin Tech Park F", "lat": 40.1114, "lon": -83.1214, "state": "OH", "city": "Dublin"},
    {"name": "Westerville Supply Hub G", "lat": 40.1214, "lon": -82.9114, "state": "OH", "city": "Westerville"},
    {"name": "Canton Freight Yard H", "lat": 40.7814, "lon": -81.3614, "state": "OH", "city": "Canton"},
    {"name": "Youngstown Industrial Site I", "lat": 41.0914, "lon": -80.6414, "state": "OH", "city": "Youngstown"},

    # North Carolina (NC) - 10 Fresh Coordinates
    {"name": "Charlotte Airport Freight Yard", "lat": 35.2114, "lon": -80.9214, "state": "NC", "city": "Charlotte"},
    {"name": "Raleigh Tech Triangle Hub", "lat": 35.8414, "lon": -78.6814, "state": "NC", "city": "Raleigh"},
    {"name": "Greensboro Logistics Center A", "lat": 36.0814, "lon": -79.8214, "state": "NC", "city": "Greensboro"},
    {"name": "Durham BioTech Park B", "lat": 35.9814, "lon": -78.8914, "state": "NC", "city": "Durham"},
    {"name": "Winston-Salem Freight Hub C", "lat": 36.0814, "lon": -80.2414, "state": "NC", "city": "Winston-Salem"},
    {"name": "Fayetteville Industrial Site D", "lat": 35.0414, "lon": -78.8814, "state": "NC", "city": "Fayetteville"},
    {"name": "Cary Commercial Yard E", "lat": 35.7714, "lon": -78.7814, "state": "NC", "city": "Cary"},
    {"name": "Wilmington Port Logistics F", "lat": 34.2114, "lon": -77.9414, "state": "NC", "city": "Wilmington"},
    {"name": "High Point Commercial Yard G", "lat": 35.9514, "lon": -79.9914, "state": "NC", "city": "High Point"},
    {"name": "Asheville Commercial Hub H", "lat": 35.5814, "lon": -82.5414, "state": "NC", "city": "Asheville"},

    # Illinois (IL) - 10 Fresh Coordinates
    {"name": "Joliet Inland Port Mega Hub", "lat": 41.4914, "lon": -88.0814, "state": "IL", "city": "Joliet"},
    {"name": "Elk Grove Industrial Park A", "lat": 41.9914, "lon": -87.9714, "state": "IL", "city": "Elk Grove Village"},
    {"name": "Bedford Park Freight Depot B", "lat": 41.7714, "lon": -87.7714, "state": "IL", "city": "Bedford Park"},
    {"name": "Naperville Commercial Site C", "lat": 41.7614, "lon": -88.1414, "state": "IL", "city": "Naperville"},
    {"name": "Aurora Logistics Hub D", "lat": 41.7414, "lon": -88.2914, "state": "IL", "city": "Aurora"},
    {"name": "Rockford Freight Terminal E", "lat": 42.2514, "lon": -89.0814, "state": "IL", "city": "Rockford"},
    {"name": "Peoria Industrial Yard F", "lat": 40.6814, "lon": -89.5814, "state": "IL", "city": "Peoria"},
    {"name": "Springfield Commercial Hub G", "lat": 39.7714, "lon": -89.6414, "state": "IL", "city": "Springfield"},
    {"name": "Champaign Tech Park H", "lat": 40.1114, "lon": -88.2314, "state": "IL", "city": "Champaign"},
    {"name": "Elgin Supply Hub I", "lat": 42.0214, "lon": -88.2714, "state": "IL", "city": "Elgin"},

    # Colorado (CO) - 5 Fresh Coordinates
    {"name": "Denver Airport Industrial Hub", "lat": 39.8114, "lon": -104.7814, "state": "CO", "city": "Denver"},
    {"name": "Aurora Commerce Center A", "lat": 39.7314, "lon": -104.7214, "state": "CO", "city": "Aurora"},
    {"name": "Colorado Springs Solar Yard B", "lat": 38.8214, "lon": -104.7814, "state": "CO", "city": "Colorado Springs"},
    {"name": "Fort Collins Tech Park C", "lat": 40.5714, "lon": -105.0614, "state": "CO", "city": "Fort Collins"},
    {"name": "Pueblo Industrial Yard D", "lat": 38.2514, "lon": -104.6014, "state": "CO", "city": "Pueblo"},

    # Nevada (NV) - 5 Fresh Coordinates
    {"name": "Reno Tahoe Industrial Mega Yard", "lat": 39.5214, "lon": -119.5814, "state": "NV", "city": "Reno"},
    {"name": "Las Vegas North Logistics Hub A", "lat": 36.2314, "lon": -115.0914, "state": "NV", "city": "Las Vegas"},
    {"name": "Henderson Commercial Yard B", "lat": 36.0214, "lon": -114.9714, "state": "NV", "city": "Henderson"},
    {"name": "Sparks Freight Terminal C", "lat": 39.5414, "lon": -119.7214, "state": "NV", "city": "Sparks"},
    {"name": "Carson City Solar Hub D", "lat": 39.1514, "lon": -119.7414, "state": "NV", "city": "Carson City"}
]

out_dir = "/Users/air/Desktop/Atlas/public/data"
os.makedirs(out_dir, exist_ok=True)
csv_path = os.path.join(out_dir, "coordinates_portfolio_100.csv")

fieldnames = ["geo_id", "chain", "latitude", "longitude", "city", "state"]

with open(csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for idx, item in enumerate(coords, start=1):
        writer.writerow({
            "geo_id": f"COORD-US-{item['state']}-{idx:04d}",
            "chain": item["name"],
            "latitude": item["lat"],
            "longitude": item["lon"],
            "city": item["city"],
            "state": item["state"]
        })

print(f"Successfully generated {len(coords)} fresh coordinate sites to {csv_path}")
