# scratch/generate_address_100.py
import csv
import os

addresses = [
    # Texas (TX) - 15 Sites
    {"chain": "Kroger Supermarket", "address": "12600 Westheimer Rd", "city": "Houston", "state": "TX", "zip": "77077", "lat": 29.7365, "lon": -95.6032, "size": 65000, "type": "Retail Supermarket"},
    {"chain": "Target Center", "address": "8500 Westgate Blvd", "city": "Austin", "state": "TX", "zip": "78745", "lat": 30.2014, "lon": -97.8012, "size": 125000, "type": "Big Box Retail"},
    {"chain": "Home Depot Logistics", "address": "2500 N Stemmons Fwy", "city": "Dallas", "state": "TX", "zip": "75207", "lat": 32.8015, "lon": -96.8341, "size": 180000, "type": "Distribution Center"},
    {"chain": "Walmart Supercenter", "address": "5555 De Zavala Rd", "city": "San Antonio", "state": "TX", "zip": "78249", "lat": 29.5621, "lon": -98.6015, "size": 210000, "type": "Retail Center"},
    {"chain": "Best Buy Plaza", "address": "1400 Hulen St", "city": "Fort Worth", "state": "TX", "zip": "76107", "lat": 32.7210, "lon": -97.3912, "size": 55000, "type": "Commercial Retail"},
    {"chain": "Costco Wholesale", "address": "600 W Arbrook Blvd", "city": "Arlington", "state": "TX", "zip": "76014", "lat": 32.6781, "lon": -97.1125, "size": 160000, "type": "Big Box Warehouse"},
    {"chain": "Lowe's Home Improvement", "address": "2000 Preston Rd", "city": "Plano", "state": "TX", "zip": "75093", "lat": 33.0289, "lon": -96.7942, "size": 140000, "type": "Commercial Center"},
    {"chain": "Sam's Club", "address": "5300 N Garland Ave", "city": "Garland", "state": "TX", "zip": "75044", "lat": 32.9641, "lon": -96.6348, "size": 150000, "type": "Retail Warehouse"},
    {"chain": "Whole Foods Market", "address": "7700 N MacArthur Blvd", "city": "Irving", "state": "TX", "zip": "75063", "lat": 32.9152, "lon": -96.9589, "size": 48000, "type": "Supermarket"},
    {"chain": "IKEA Retail Store", "address": "7171 Frisco Square Blvd", "city": "Frisco", "state": "TX", "zip": "75034", "lat": 33.1508, "lon": -96.8236, "size": 310000, "type": "Big Box Flagship"},
    {"chain": "Academy Sports", "address": "3800 S Central Expressway", "city": "McKinney", "state": "TX", "zip": "75070", "lat": 33.1784, "lon": -96.6415, "size": 72000, "type": "Retail Center"},
    {"chain": "HEB Grocery Store", "address": "4400 Texas Ave", "city": "Bryan", "state": "TX", "zip": "77802", "lat": 30.6512, "lon": -96.3481, "size": 95000, "type": "Regional Grocery"},
    {"chain": "WinCo Foods", "address": "2850 Southwest Pkwy", "city": "Wichita Falls", "state": "TX", "zip": "76308", "lat": 33.8741, "lon": -98.5321, "size": 85000, "type": "Commercial Grocery"},
    {"chain": "Tractor Supply Co", "address": "1500 Loop 289", "city": "Lubbock", "state": "TX", "zip": "79404", "lat": 33.5684, "lon": -101.8492, "size": 42000, "type": "Agricultural Retail"},
    {"chain": "Trader Joe's", "address": "1400 S College Ave", "city": "College Station", "state": "TX", "zip": "77840", "lat": 30.6125, "lon": -96.3214, "size": 28000, "type": "Retail Grocery"},

    # California (CA) - 15 Sites
    {"chain": "Tesla Megapack Hub", "address": "3500 Deer Creek Rd", "city": "Palo Alto", "state": "CA", "zip": "94304", "lat": 37.3984, "lon": -122.1481, "size": 120000, "type": "Industrial BESS"},
    {"chain": "Amazon Fulfillment Center", "address": "2125 Washington Blvd", "city": "Los Angeles", "state": "CA", "zip": "90021", "lat": 34.0215, "lon": -118.2314, "size": 450000, "type": "Logistics Logistics Hub"},
    {"chain": "Prologis Park West", "address": "1800 Ontario Mills Pkwy", "city": "Ontario", "state": "CA", "zip": "91764", "lat": 34.0721, "lon": -117.5512, "size": 380000, "type": "Industrial Logistics"},
    {"chain": "Target Distribution", "address": "5400 E Foothill Blvd", "city": "Rancho Cucamonga", "state": "CA", "zip": "91730", "lat": 34.1072, "lon": -117.5814, "size": 290000, "type": "Commercial Distribution"},
    {"chain": "FEDEX Freight Depot", "address": "8800 Otay Mesa Rd", "city": "San Diego", "state": "CA", "zip": "92154", "lat": 32.5714, "lon": -116.9412, "size": 220000, "type": "Freight Logistics"},
    {"chain": "Walmart Logistics Hub", "address": "3600 S Airport Way", "city": "Stockton", "state": "CA", "zip": "95206", "lat": 37.9102, "lon": -121.2681, "size": 520000, "type": "Distribution Center"},
    {"chain": "Home Depot Supply", "address": "4200 Brea Canyon Rd", "city": "Diamond Bar", "state": "CA", "zip": "91765", "lat": 34.0084, "lon": -117.8214, "size": 175000, "type": "Industrial Supply"},
    {"chain": "Sysco Food Logistics", "address": "1390 Ensell Rd", "city": "Fremont", "state": "CA", "zip": "94539", "lat": 37.5214, "lon": -121.9314, "size": 240000, "type": "Cold Storage Logistics"},
    {"chain": "Costco Depot", "address": "2200 E 8th St", "city": "National City", "state": "CA", "zip": "91950", "lat": 32.6714, "lon": -117.1012, "size": 195000, "type": "Big Box Warehouse"},
    {"chain": "Apple Supply Chain Hub", "address": "1000 Kifer Rd", "city": "Sunnyvale", "state": "CA", "zip": "94086", "lat": 37.3712, "lon": -121.9984, "size": 160000, "type": "Tech Manufacturing"},
    {"chain": "Google Logistics Yard", "address": "800 N Rengstorff Ave", "city": "Mountain View", "state": "CA", "zip": "94043", "lat": 37.4102, "lon": -122.0914, "size": 140000, "type": "Commercial Fleet Yard"},
    {"chain": "UPS Sorting Hub", "address": "3300 E Ana St", "city": "Compton", "state": "CA", "zip": "90221", "lat": 33.8714, "lon": -118.2114, "size": 310000, "type": "Parcel Freight Hub"},
    {"chain": "DHL Supply Chain", "address": "1500 E Francis St", "city": "Ontario", "state": "CA", "zip": "91761", "lat": 34.0214, "lon": -117.6112, "size": 260000, "type": "Freight Terminal"},
    {"chain": "Kroger Foods Depot", "address": "1200 S Harbor Blvd", "city": "La Habra", "state": "CA", "zip": "90631", "lat": 33.9184, "lon": -117.9412, "size": 210000, "type": "Commercial Grocery Hub"},
    {"chain": "Safeway Supply Hub", "address": "4500 Rosewood Dr", "city": "Pleasanton", "state": "CA", "zip": "94588", "lat": 37.6914, "lon": -121.8814, "size": 280000, "type": "Food Distribution"},

    # Florida (FL) - 10 Sites
    {"chain": "Publix Distribution", "address": "3300 Publix Blvd", "city": "Lakeland", "state": "FL", "zip": "33811", "lat": 27.9984, "lon": -81.9912, "size": 420000, "type": "Grocery Distribution"},
    {"chain": "Home Depot Logistics", "address": "1400 NW 110th Ave", "city": "Miami", "state": "FL", "zip": "33172", "lat": 25.7861, "lon": -80.3741, "size": 230000, "type": "Distribution Hub"},
    {"chain": "Target Supercenter", "address": "3200 Orange Blossom Trail", "city": "Orlando", "state": "FL", "zip": "32804", "lat": 28.5714, "lon": -81.3984, "size": 175000, "type": "Big Box Retail"},
    {"chain": "Amazon Hub FL", "address": "12200 Jacksonville Blvd", "city": "Jacksonville", "state": "FL", "zip": "32218", "lat": 30.4512, "lon": -81.6514, "size": 510000, "type": "Fulfillment Hub"},
    {"chain": "Walmart Store", "address": "4300 Hillsborough Ave", "city": "Tampa", "state": "FL", "zip": "33614", "lat": 27.9981, "lon": -82.5014, "size": 195000, "type": "Retail Center"},
    {"chain": "Winn-Dixie Depot", "address": "5000 Florida Mining Blvd", "city": "Jacksonville", "state": "FL", "zip": "32257", "lat": 30.1714, "lon": -81.6114, "size": 260000, "type": "Commercial Grocery"},
    {"chain": "Costco Warehouse", "address": "14501 Pines Blvd", "city": "Pembroke Pines", "state": "FL", "zip": "33027", "lat": 26.0071, "lon": -80.3384, "size": 165000, "type": "Big Box Warehouse"},
    {"chain": "Sam's Club FL", "address": "5135 S Lakeland Dr", "city": "Lakeland", "state": "FL", "zip": "33813", "lat": 27.9714, "lon": -81.9584, "size": 145000, "type": "Retail Club"},
    {"chain": "Lowe's Home Center", "address": "4000 US Hwy 19", "city": "New Port Richey", "state": "FL", "zip": "34652", "lat": 28.2414, "lon": -82.7214, "size": 135000, "type": "Commercial Retail"},
    {"chain": "Aldi Distribution Center", "address": "2200 State Rd 60", "city": "Haines City", "state": "FL", "zip": "33844", "lat": 28.1114, "lon": -81.6114, "size": 310000, "type": "Food Logistics"},

    # Georgia (GA) - 10 Sites
    {"chain": "Home Depot HQ Hub", "address": "2455 Paces Ferry Rd", "city": "Atlanta", "state": "GA", "zip": "30339", "lat": 33.8681, "lon": -84.4812, "size": 380000, "type": "Corporate Logistics"},
    {"chain": "Kroger Foods Depot", "address": "2000 Forest Pkwy", "city": "Forest Park", "state": "GA", "zip": "30297", "lat": 33.6214, "lon": -84.3684, "size": 290000, "type": "Food Distribution"},
    {"chain": "UPS Global Logistics", "address": "55 Glenlake Pkwy", "city": "Atlanta", "state": "GA", "zip": "30328", "lat": 33.9314, "lon": -84.3614, "size": 410000, "type": "Global Freight Hub"},
    {"chain": "Target Fulfillment", "address": "1500 Anvil Block Rd", "city": "Ellenwood", "state": "GA", "zip": "30294", "lat": 33.6014, "lon": -84.2984, "size": 470000, "type": "Distribution Hub"},
    {"chain": "Walmart Hub GA", "address": "5000 GA Highway 42", "city": "Locust Grove", "state": "GA", "zip": "30248", "lat": 33.3414, "lon": -84.1114, "size": 530000, "type": "Fulfillment Center"},
    {"chain": "Costco Warehouse", "address": "2900 N Druid Hills Rd", "city": "Atlanta", "state": "GA", "zip": "30329", "lat": 33.8281, "lon": -84.3314, "size": 155000, "type": "Big Box Retail"},
    {"chain": "FEDEX Ground Hub", "address": "4000 Fulton Industrial Blvd", "city": "Atlanta", "state": "GA", "zip": "30336", "lat": 33.7414, "lon": -84.5514, "size": 340000, "type": "Parcel Freight"},
    {"chain": "Prologis Park GA", "address": "1000 Tradeport Blvd", "city": "Atlanta", "state": "GA", "zip": "30354", "lat": 33.6514, "lon": -84.3984, "size": 280000, "type": "Industrial Park"},
    {"chain": "Sysco Atlanta Depot", "address": "2251 Sylvan Rd", "city": "East Point", "state": "GA", "zip": "30344", "lat": 33.6781, "lon": -84.4284, "size": 260000, "type": "Cold Storage"},
    {"chain": "Trader Joe's Hub", "address": "3180 Peachtree Rd", "city": "Atlanta", "state": "GA", "zip": "30305", "lat": 33.8414, "lon": -84.3784, "size": 35000, "type": "Commercial Grocery"},

    # Arizona (AZ) - 10 Sites
    {"chain": "First Solar Park", "address": "2810 S 37th Ave", "city": "Phoenix", "state": "AZ", "zip": "85009", "lat": 33.4214, "lon": -112.1384, "size": 250000, "type": "Industrial Solar Hub"},
    {"chain": "Amazon Hub AZ", "address": "500 S 143rd Ave", "city": "Goodyear", "state": "AZ", "zip": "85338", "lat": 33.4414, "lon": -112.3684, "size": 600000, "type": "Mega Fulfillment"},
    {"chain": "Walmart Distribution", "address": "7000 W Buckeye Rd", "city": "Phoenix", "state": "AZ", "zip": "85043", "lat": 33.4351, "lon": -112.2114, "size": 480000, "type": "Distribution Hub"},
    {"chain": "Target Logistics", "address": "3000 S Cotton Ln", "city": "Surprise", "state": "AZ", "zip": "85388", "lat": 33.5814, "lon": -112.4284, "size": 390000, "type": "Fulfillment Hub"},
    {"chain": "Home Depot Yard", "address": "4800 W Van Buren St", "city": "Phoenix", "state": "AZ", "zip": "85043", "lat": 33.4514, "lon": -112.1614, "size": 190000, "type": "Industrial Retail"},
    {"chain": "Kroger Foods AZ", "address": "5000 W Baseline Rd", "city": "Laveen", "state": "AZ", "zip": "85339", "lat": 33.3781, "lon": -112.1684, "size": 110000, "type": "Commercial Grocery"},
    {"chain": "Costco Warehouse", "address": "2450 E Beardsley Rd", "city": "Phoenix", "state": "AZ", "zip": "85024", "lat": 33.6681, "lon": -112.0284, "size": 160000, "type": "Big Box Warehouse"},
    {"chain": "TSMC Fab Supply Hub", "address": "4000 W TSMC Pkwy", "city": "Phoenix", "state": "AZ", "zip": "85083", "lat": 33.7781, "lon": -112.1514, "size": 750000, "type": "Semiconductor Fab Yard"},
    {"chain": "Intel Logistics Depot", "address": "5000 S Chandler Blvd", "city": "Chandler", "state": "AZ", "zip": "85226", "lat": 33.3051, "lon": -111.9284, "size": 420000, "type": "Tech Manufacturing"},
    {"chain": "Prologis Park AZ", "address": "4000 W Washington St", "city": "Phoenix", "state": "AZ", "zip": "85034", "lat": 33.4481, "lon": -112.1484, "size": 270000, "type": "Industrial Logistics"},

    # Ohio (OH) - 10 Sites
    {"chain": "Kroger Supermarket", "address": "1500 W 5th Ave", "city": "Columbus", "state": "OH", "zip": "43212", "lat": 39.9881, "lon": -83.0384, "size": 88000, "type": "Supermarket Winner Target"},
    {"chain": "Amazon Hub OH", "address": "6000 Opus Dr", "city": "Groveport", "state": "OH", "zip": "43125", "lat": 39.8514, "lon": -82.9114, "size": 520000, "type": "Mega Fulfillment"},
    {"chain": "Walmart Distribution", "address": "2900 S Hamilton Rd", "city": "Columbus", "state": "OH", "zip": "43232", "lat": 39.9214, "lon": -82.8814, "size": 390000, "type": "Distribution Hub"},
    {"chain": "Target Supercenter", "address": "4199 Polaris Pkwy", "city": "Columbus", "state": "OH", "zip": "43082", "lat": 40.1481, "lon": -82.9714, "size": 175000, "type": "Big Box Retail"},
    {"chain": "Home Depot Supply", "address": "3500 Westerville Rd", "city": "Columbus", "state": "OH", "zip": "43224", "lat": 40.0381, "lon": -82.9484, "size": 145000, "type": "Commercial Hardware"},
    {"chain": "Costco Warehouse", "address": "1500 Gemini Pl", "city": "Columbus", "state": "OH", "zip": "43240", "lat": 40.1414, "lon": -82.9684, "size": 160000, "type": "Big Box Warehouse"},
    {"chain": "Meijer Supercenter", "address": "6175 Sawmill Rd", "city": "Dublin", "state": "OH", "zip": "43017", "lat": 40.0981, "lon": -83.0914, "size": 195000, "type": "Regional Supercenter"},
    {"chain": "FEDEX Freight Depot", "address": "4500 International St", "city": "Columbus", "state": "OH", "zip": "43217", "lat": 39.8814, "lon": -82.9384, "size": 280000, "type": "Freight Terminal"},
    {"chain": "DHL Supply Chain OH", "address": "3600 Airway Rd", "city": "Dayton", "state": "OH", "zip": "45431", "lat": 39.7514, "lon": -84.1114, "size": 320000, "type": "Parcel Freight"},
    {"chain": "Giant Eagle Market", "address": "2800 Hayden Run Rd", "city": "Columbus", "state": "OH", "zip": "43235", "lat": 40.0614, "lon": -83.1114, "size": 75000, "type": "Grocery Store"},

    # North Carolina (NC) - 10 Sites
    {"chain": "Lowe's Corporate Hub", "address": "1000 Lowe's Blvd", "city": "Mooresville", "state": "NC", "zip": "28117", "lat": 35.5481, "lon": -80.8514, "size": 410000, "type": "Corporate Logistics"},
    {"chain": "Amazon Hub NC", "address": "8000 Tuckaseegee Rd", "city": "Charlotte", "state": "NC", "zip": "28214", "lat": 35.2514, "lon": -80.9384, "size": 490000, "type": "Fulfillment Hub"},
    {"chain": "Walmart Logistics", "address": "3900 Westinghouse Blvd", "city": "Charlotte", "state": "NC", "zip": "28273", "lat": 35.1214, "lon": -80.9414, "size": 360000, "type": "Distribution Center"},
    {"chain": "Target Supercenter", "address": "8120 University City Blvd", "city": "Charlotte", "state": "NC", "zip": "28213", "lat": 35.3081, "lon": -80.7384, "size": 170000, "type": "Big Box Retail"},
    {"chain": "Home Depot Yard", "address": "3200 South Blvd", "city": "Charlotte", "state": "NC", "zip": "28209", "lat": 35.1981, "lon": -80.8684, "size": 140000, "type": "Commercial Hardware"},
    {"chain": "Harris Teeter Foods", "address": "2100 Ashley Park Ln", "city": "Gastonia", "state": "NC", "zip": "28054", "lat": 35.2614, "lon": -81.1484, "size": 65000, "type": "Regional Grocery"},
    {"chain": "Costco Warehouse", "address": "500 Tyvola Rd", "city": "Charlotte", "state": "NC", "zip": "28217", "lat": 35.1614, "lon": -80.8884, "size": 155000, "type": "Big Box Warehouse"},
    {"chain": "Food Lion Depot", "address": "2110 Executive Dr", "city": "Salisbury", "state": "NC", "zip": "28147", "lat": 35.6681, "lon": -80.4914, "size": 290000, "type": "Grocery Distribution"},
    {"chain": "FEDEX Ground NC", "address": "4200 Cargo Rd", "city": "Greensboro", "state": "NC", "zip": "27410", "lat": 36.0981, "lon": -79.9384, "size": 310000, "type": "Freight Terminal"},
    {"chain": "Trader Joe's Center", "address": "1800 Midtown Ave", "city": "Raleigh", "state": "NC", "zip": "27609", "lat": 35.8214, "lon": -78.6384, "size": 32000, "type": "Retail Grocery"},

    # Illinois (IL) - 10 Sites
    {"chain": "Walgreens HQ Hub", "address": "200 Wilmot Rd", "city": "Deerfield", "state": "IL", "zip": "60015", "lat": 42.1681, "lon": -87.8784, "size": 310000, "type": "Corporate Logistics"},
    {"chain": "Amazon Hub IL", "address": "3800 Rock Creek Rd", "city": "Joliet", "state": "IL", "zip": "60431", "lat": 41.5114, "lon": -88.1684, "size": 540000, "type": "Fulfillment Hub"},
    {"chain": "Walmart Distribution", "address": "2400 E Laraway Rd", "city": "Joliet", "state": "IL", "zip": "60433", "lat": 41.4881, "lon": -88.0484, "size": 420000, "type": "Distribution Hub"},
    {"chain": "Target Supercenter", "address": "2656 N Elston Ave", "city": "Chicago", "state": "IL", "zip": "60647", "lat": 41.9298, "lon": -87.6784, "size": 180000, "type": "Urban Big Box"},
    {"chain": "Home Depot Supply", "address": "1232 W North Ave", "city": "Chicago", "state": "IL", "zip": "60642", "lat": 41.9102, "lon": -87.6598, "size": 135000, "type": "Commercial Hardware"},
    {"chain": "Costco Warehouse", "address": "1430 S Ashland Ave", "city": "Chicago", "state": "IL", "zip": "60608", "lat": 41.8631, "lon": -87.6651, "size": 160000, "type": "Big Box Warehouse"},
    {"chain": "Aldi Distribution IL", "address": "1200 N Kirk Rd", "city": "Batavia", "state": "IL", "zip": "60510", "lat": 41.8681, "lon": -88.2784, "size": 330000, "type": "Grocery Logistics"},
    {"chain": "Jewel-Osco Foods", "address": "1500 S Park Ave", "city": "Streamwood", "state": "IL", "zip": "60107", "lat": 42.0181, "lon": -88.1784, "size": 85000, "type": "Supermarket Retail"},
    {"chain": "FEDEX Hub Chicago", "address": "6900 W 73rd St", "city": "Bedford Park", "state": "IL", "zip": "60638", "lat": 41.7581, "lon": -87.7914, "size": 390000, "type": "Freight Logistics"},
    {"chain": "Prologis Park IL", "address": "1100 Busse Rd", "city": "Elk Grove Village", "state": "IL", "zip": "60007", "lat": 42.0081, "lon": -87.9584, "size": 290000, "type": "Industrial Park"},

    # Colorado (CO) - 5 Sites
    {"chain": "Ball Corp Hub", "address": "9200 E 104th Ave", "city": "Henderson", "state": "CO", "zip": "80640", "lat": 39.8881, "lon": -104.8714, "size": 280000, "type": "Industrial Manufacturing"},
    {"chain": "Amazon Hub CO", "address": "19799 E 36th Dr", "city": "Aurora", "state": "CO", "zip": "80011", "lat": 39.7681, "lon": -104.7584, "size": 480000, "type": "Fulfillment Hub"},
    {"chain": "Walmart Distribution", "address": "1000 E 120th Ave", "city": "Thornton", "state": "CO", "zip": "80233", "lat": 39.9141, "lon": -104.9714, "size": 340000, "type": "Distribution Center"},
    {"chain": "Target Supercenter", "address": "7777 E Hampden Ave", "city": "Denver", "state": "CO", "zip": "80231", "lat": 39.6531, "lon": -104.8984, "size": 170000, "type": "Big Box Retail"},
    {"chain": "King Soopers Foods", "address": "275 S Logan St", "city": "Denver", "state": "CO", "zip": "80209", "lat": 39.7121, "lon": -104.9821, "size": 78000, "type": "Supermarket Retail"},

    # Washington (WA) - 5 Sites
    {"chain": "Amazon HQ Yard", "address": "410 Terry Ave N", "city": "Seattle", "state": "WA", "zip": "98109", "lat": 47.6221, "lon": -122.3381, "size": 320000, "type": "Corporate Logistics"},
    {"chain": "Costco HQ Hub", "address": "999 Lake Drive", "city": "Issaquah", "state": "WA", "zip": "98027", "lat": 47.5451, "lon": -122.0421, "size": 380000, "type": "Global Headquarters"},
    {"chain": "Paccar Supply Chain", "address": "777 106th Ave NE", "city": "Bellevue", "state": "WA", "zip": "98004", "lat": 47.6181, "lon": -122.1981, "size": 240000, "type": "Industrial Freight"},
    {"chain": "Target Supercenter", "address": "1401 2nd Ave", "city": "Seattle", "state": "WA", "zip": "98101", "lat": 47.6081, "lon": -122.3381, "size": 145000, "type": "Urban Big Box"},
    {"chain": "Fred Meyer Market", "address": "14300 SE Division St", "city": "Vancouver", "state": "WA", "zip": "98683", "lat": 45.6281, "lon": -122.5314, "size": 115000, "type": "Regional Supercenter"}
]

out_dir = "/Users/air/Desktop/Atlas/public/data"
os.makedirs(out_dir, exist_ok=True)
csv_path = os.path.join(out_dir, "address_portfolio_100.csv")

fieldnames = ["geo_id", "chain", "address", "city", "state", "zip", "lat", "lon", "size_sqft", "property_type"]

with open(csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for idx, item in enumerate(addresses, start=1):
        writer.writerow({
            "geo_id": f"US-{item['state']}-{idx:04d}",
            "chain": item["chain"],
            "address": item["address"],
            "city": item["city"],
            "state": item["state"],
            "zip": item["zip"],
            "lat": item["lat"],
            "lon": item["lon"],
            "size_sqft": item["size"],
            "property_type": item["type"]
        })

print(f"Successfully generated {len(addresses)} commercial sites to {csv_path}")
