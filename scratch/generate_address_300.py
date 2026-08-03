import csv

sites = [
    ("Walmart Supercenter", ["Austin", "Dallas", "Houston", "San Antonio", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Lubbock"]),
    ("Target Store", ["Miami", "Orlando", "Tampa", "Jacksonville", "St. Petersburg", "Hialeah", "Port St. Lucie", "Cape Coral", "Tallahassee", "Fort Lauderdale"]),
    ("Home Depot Hub", ["Atlanta", "Augusta", "Columbus", "Macon", "Savannah", "Athens", "Sandy Springs", "Roswell", "Johns Creek", "Warner Robins"]),
    ("Costco Wholesale", ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington", "High Point", "Concord"]),
    ("Dollar General Retail", ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim"]),
    ("Amazon Fulfillment", ["Phoenix", "Tucson", "Mesa", "Chandler", "Gilbert", "Glendale", "Scottsdale", "Peoria", "Surprise", "Tempe"])
]

state_map = {
    "Austin": ("TX", "78701"), "Dallas": ("TX", "75201"), "Houston": ("TX", "77001"), "San Antonio": ("TX", "78201"), "Fort Worth": ("TX", "76101"),
    "El Paso": ("TX", "79901"), "Arlington": ("TX", "76001"), "Corpus Christi": ("TX", "78401"), "Plano": ("TX", "75023"), "Lubbock": ("TX", "79401"),
    "Miami": ("FL", "33101"), "Orlando": ("FL", "32801"), "Tampa": ("FL", "33601"), "Jacksonville": ("FL", "32201"), "St. Petersburg": ("FL", "33701"),
    "Hialeah": ("FL", "33010"), "Port St. Lucie": ("FL", "34952"), "Cape Coral": ("FL", "33904"), "Tallahassee": ("FL", "32301"), "Fort Lauderdale": ("FL", "33301"),
    "Atlanta": ("GA", "30301"), "Augusta": ("GA", "30901"), "Columbus": ("GA", "31901"), "Macon": ("GA", "31201"), "Savannah": ("GA", "31401"),
    "Athens": ("GA", "30601"), "Sandy Springs": ("GA", "30328"), "Roswell": ("GA", "30075"), "Johns Creek": ("GA", "30022"), "Warner Robins": ("GA", "31088"),
    "Charlotte": ("NC", "28201"), "Raleigh": ("NC", "27601"), "Greensboro": ("NC", "27401"), "Durham": ("NC", "27701"), "Winston-Salem": ("NC", "27101"),
    "Fayetteville": ("NC", "28301"), "Cary": ("NC", "27511"), "Wilmington": ("NC", "28401"), "High Point": ("NC", "27260"), "Concord": ("NC", "28025"),
    "Los Angeles": ("CA", "90001"), "San Diego": ("CA", "92101"), "San Jose": ("CA", "95101"), "San Francisco": ("CA", "94101"), "Fresno": ("CA", "93701"),
    "Sacramento": ("CA", "95801"), "Long Beach": ("CA", "90801"), "Oakland": ("CA", "94601"), "Bakersfield": ("CA", "93301"), "Anaheim": ("CA", "92801"),
    "Phoenix": ("AZ", "85001"), "Tucson": ("AZ", "85701"), "Mesa": ("AZ", "85201"), "Chandler": ("AZ", "85224"), "Gilbert": ("AZ", "85233"),
    "Glendale": ("AZ", "85301"), "Scottsdale": ("AZ", "85251"), "Peoria": ("AZ", "85345"), "Surprise": ("AZ", "85374"), "Tempe": ("AZ", "85281")
}

streets = [
    "Main St", "Commerce St", "Industrial Pkwy", "Grand Ave", "Technology Dr", 
    "Logistics Way", "Market St", "Enterprise Blvd", "Capital Ave", "Parkway Dr"
]

rows = []
site_idx = 1001

for i in range(50):
    for brand, cities in sites:
        city = cities[i % len(cities)]
        st, zip_c = state_map[city]
        street_num = 100 + (i * 15) % 9000
        st_name = streets[(i + site_idx) % len(streets)]
        
        site_name = f"{brand} #{site_idx}"
        street_addr = f"{street_num} {st_name}"
        
        rows.append([site_name, street_addr, city, st, zip_c])
        site_idx += 1

with open('/Users/air/Desktop/Atlas/data/address_portfolio_300.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['site_name', 'street_address', 'city', 'state', 'zip_code'])
    writer.writerows(rows[:300])

print(f"Successfully generated 300 address rows in data/address_portfolio_300.csv")
