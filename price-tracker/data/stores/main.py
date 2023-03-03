import json

INPUT_FILE = 'geojson.json'
OUTPUT_FILE = 'stores.json'

if __name__ == '__main__':
    with open(INPUT_FILE, 'r', encoding='utf-8') as file:
        data = json.load(file)

    stores = []
    for i, feature in enumerate(data['features']):
        store = {
            'id': i,
            'name': feature['properties']['name']
            if 'name' in feature['properties']
            else 'No Name',
            'type': feature['properties']['shop'],
            'latitude': feature['geometry']['coordinates'][1],
            'longitude': feature['geometry']['coordinates'][0],
        }
        stores.append(store)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as file:
        json.dump(stores, file, indent=2, ensure_ascii=False)
