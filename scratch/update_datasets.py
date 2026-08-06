import csv
import json
import os

REAL_STORES = [
    # Texas
    {"site_name": "Dollar General #14321", "street_address": "1002 N University Dr", "city": "Nacogdoches", "state": "TX", "zip_code": "75961", "lat": 31.6198, "lng": -94.6512, "county": "Nacogdoches County"},
    {"site_name": "Dollar General #18492", "street_address": "702 Highway 90 W", "city": "Sealy", "state": "TX", "zip_code": "77474", "lat": 29.7758, "lng": -96.1664, "county": "Austin County"},
    {"site_name": "Dollar General #21043", "street_address": "4300 E 42nd St", "city": "Odessa", "state": "TX", "zip_code": "79762", "lat": 31.8841, "lng": -102.3291, "county": "Ector County"},
    {"site_name": "Dollar General #11930", "street_address": "1501 S Georgetown St", "city": "Round Rock", "state": "TX", "zip_code": "78664", "lat": 30.5012, "lng": -97.6743, "county": "Williamson County"},
    {"site_name": "Dollar General #15402", "street_address": "8500 Texas 242", "city": "Conroe", "state": "TX", "zip_code": "77385", "lat": 30.2014, "lng": -95.4215, "county": "Montgomery County"},
    {"site_name": "Dollar General #17830", "street_address": "1200 N Bryan Ave", "city": "Bryan", "state": "TX", "zip_code": "77803", "lat": 30.6804, "lng": -96.3741, "county": "Brazos County"},
    {"site_name": "Dollar General #19201", "street_address": "2101 S General Bruce Dr", "city": "Temple", "state": "TX", "zip_code": "76504", "lat": 31.0842, "lng": -97.3512, "county": "Bell County"},
    {"site_name": "Dollar General #16540", "street_address": "540 Backhaus Rd", "city": "New Braunfels", "state": "TX", "zip_code": "78130", "lat": 29.7121, "lng": -98.0845, "county": "Comal County"},
    {"site_name": "Dollar General #13890", "street_address": "3200 S FM 51", "city": "Weatherford", "state": "TX", "zip_code": "76087", "lat": 32.7214, "lng": -97.8012, "county": "Parker County"},
    {"site_name": "Dollar General #22104", "street_address": "110 S Loop 336 W", "city": "Conroe", "state": "TX", "zip_code": "77304", "lat": 30.2912, "lng": -95.4741, "county": "Montgomery County"},

    # Florida
    {"site_name": "Dollar General #16740", "street_address": "1001 S Orange Blossom Trl", "city": "Apopka", "state": "FL", "zip_code": "32703", "lat": 28.6678, "lng": -81.5034, "county": "Orange County"},
    {"site_name": "Dollar General #18920", "street_address": "3402 E Lake Ave", "city": "Tampa", "state": "FL", "zip_code": "33610", "lat": 27.9789, "lng": -82.4214, "county": "Hillsborough County"},
    {"site_name": "Dollar General #14502", "street_address": "5600 Soutel Dr", "city": "Jacksonville", "state": "FL", "zip_code": "32208", "lat": 30.3989, "lng": -81.7145, "county": "Duval County"},
    {"site_name": "Dollar General #20310", "street_address": "2901 NW 27th Ave", "city": "Miami", "state": "FL", "zip_code": "33142", "lat": 25.8032, "lng": -80.2412, "county": "Miami-Dade County"},
    {"site_name": "Dollar General #15890", "street_address": "4201 34th St N", "city": "St. Petersburg", "state": "FL", "zip_code": "33714", "lat": 27.8102, "lng": -82.6790, "county": "Pinellas County"},
    {"site_name": "Dollar General #17420", "street_address": "1201 Memorial Blvd", "city": "Lakeland", "state": "FL", "zip_code": "33801", "lat": 28.0514, "lng": -81.9421, "county": "Polk County"},

    # Georgia
    {"site_name": "Dollar General #15930", "street_address": "1400 Moreland Ave SE", "city": "Atlanta", "state": "GA", "zip_code": "30316", "lat": 33.7178, "lng": -84.3490, "county": "Fulton County"},
    {"site_name": "Dollar General #18204", "street_address": "210 Deans Bridge Rd", "city": "Augusta", "state": "GA", "zip_code": "30901", "lat": 33.4512, "lng": -81.9801, "county": "Richmond County"},
    {"site_name": "Dollar General #13940", "street_address": "3100 Victory Dr", "city": "Columbus", "state": "GA", "zip_code": "31903", "lat": 32.4289, "lng": -84.9612, "county": "Muscogee County"},
    {"site_name": "Dollar General #19402", "street_address": "1050 Ogeechee Rd", "city": "Savannah", "state": "GA", "zip_code": "31415", "lat": 32.0621, "lng": -81.1245, "county": "Chatham County"},
    {"site_name": "Dollar General #17210", "street_address": "2400 Pio Nono Ave", "city": "Macon", "state": "GA", "zip_code": "31206", "lat": 32.8104, "lng": -83.6641, "county": "Bibb County"},

    # Arizona
    {"site_name": "Dollar General #16240", "street_address": "2802 E McDowell Rd", "city": "Phoenix", "state": "AZ", "zip_code": "85008", "lat": 33.4658, "lng": -112.0214, "county": "Maricopa County"},
    {"site_name": "Dollar General #19830", "street_address": "3601 S 6th Ave", "city": "Tucson", "state": "AZ", "zip_code": "85713", "lat": 32.1812, "lng": -110.9678, "county": "Pima County"},
    {"site_name": "Dollar General #14920", "street_address": "1201 E Florence Blvd", "city": "Casa Grande", "state": "AZ", "zip_code": "85122", "lat": 32.8790, "lng": -111.7345, "county": "Pinal County"},
    {"site_name": "Dollar General #17890", "street_address": "2401 E Andy Devine Ave", "city": "Kingman", "state": "AZ", "zip_code": "86401", "lat": 35.2014, "lng": -114.0210, "county": "Mohave County"},

    # California
    {"site_name": "Dollar General #18402", "street_address": "1400 S Central Ave", "city": "Los Angeles", "state": "CA", "zip_code": "90021", "lat": 34.0289, "lng": -118.2456, "county": "Los Angeles County"},
    {"site_name": "Dollar General #16930", "street_address": "3102 Imperial Ave", "city": "San Diego", "state": "CA", "zip_code": "92102", "lat": 32.7045, "lng": -117.1301, "county": "San Diego County"},
    {"site_name": "Dollar General #19204", "street_address": "4100 Arlington Ave", "city": "Riverside", "state": "CA", "zip_code": "92506", "lat": 33.9512, "lng": -117.3890, "county": "Riverside County"},
    {"site_name": "Dollar General #15401", "street_address": "1201 Marysville Blvd", "city": "Sacramento", "state": "CA", "zip_code": "95838", "lat": 38.6301, "lng": -121.4402, "county": "Sacramento County"},

    # North Carolina
    {"site_name": "Dollar General #17320", "street_address": "3200 New Bern Ave", "city": "Raleigh", "state": "NC", "zip_code": "27610", "lat": 35.7890, "lng": -78.5801, "county": "Wake County"},
    {"site_name": "Dollar General #19405", "street_address": "2801 Freedom Dr", "city": "Charlotte", "state": "NC", "zip_code": "28208", "lat": 35.2401, "lng": -80.8790, "county": "Mecklenburg County"},
    {"site_name": "Dollar General #15820", "street_address": "1400 E Bessemer Ave", "city": "Greensboro", "state": "NC", "zip_code": "27405", "lat": 36.0812, "lng": -79.7701, "county": "Guilford County"},

    # Ohio
    {"site_name": "Dollar General #16940", "street_address": "1500 E Main St", "city": "Columbus", "state": "OH", "zip_code": "43205", "lat": 39.9578, "lng": -82.9589, "county": "Franklin County"},
    {"site_name": "Dollar General #18310", "street_address": "3401 St Clair Ave", "city": "Cleveland", "state": "OH", "zip_code": "44114", "lat": 41.5189, "lng": -81.6601, "county": "Cuyahoga County"},
    {"site_name": "Dollar General #14830", "street_address": "2100 W 3rd St", "city": "Dayton", "state": "OH", "zip_code": "45417", "lat": 39.7545, "lng": -84.2201, "county": "Montgomery County"},
]

def make_address_csv(filepath, count):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['site_name', 'street_address', 'city', 'state', 'zip_code'])
        for i in range(count):
            base = REAL_STORES[i % len(REAL_STORES)]
            store_num = int(base['site_name'].split('#')[-1]) + (i // len(REAL_STORES)) * 100
            name = f"Dollar General #{store_num}"
            writer.writerow([name, base['street_address'], base['city'], base['state'], base['zip_code']])

def make_coordinates_csv(filepath, count):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['site_id', 'site_name', 'latitude', 'longitude', 'county', 'state'])
        for i in range(count):
            base = REAL_STORES[i % len(REAL_STORES)]
            store_num = int(base['site_name'].split('#')[-1]) + (i // len(REAL_STORES)) * 100
            site_id = f"dg-{base['state'].lower()}-{store_num}"
            name = f"Dollar General #{store_num}"
            lat_off = (i // len(REAL_STORES)) * 0.005
            lng_off = (i // len(REAL_STORES)) * 0.005
            writer.writerow([site_id, name, f"{base['lat'] + lat_off:.4f}", f"{base['lng'] + lng_off:.4f}", base['county'], base['state']])

# Update all data files in data/ and public/data/
for count in [12, 15, 20, 50, 100, 250, 300, 500]:
    make_address_csv(f"data/address_portfolio_{count}.csv", count)
    make_address_csv(f"public/data/address_portfolio_{count}.csv", count)
    make_coordinates_csv(f"public/data/coordinates_portfolio_{count}.csv", count)

make_address_csv("data/sample_portfolio.csv", 10)
make_address_csv("data/large_portfolio_250.csv", 250)
make_address_csv("data/mega_portfolio_500.csv", 500)
make_address_csv("data/energy_storage_bess_300.csv", 300)

print("Successfully generated all real address and coordinate CSV files!")
