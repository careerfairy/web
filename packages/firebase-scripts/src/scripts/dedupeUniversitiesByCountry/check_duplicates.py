import json
from collections import defaultdict

def check_duplicate_ids():
    # Read the JSON file
    with open('/Users/waltergoncalves/Downloads/universitiesByCountry-1738062182.json', 'r') as file:
        data = json.load(file)['data']
    
    # Dictionary to store ID occurrences
    id_occurrences = defaultdict(list)
    
    # Iterate through each country and university
    for country_code, country_data in data.items():
        if 'universities' in country_data:
            for university in country_data['universities']:
                univ_id = university['id']
                id_occurrences[univ_id].append({
                    'country': country_code,
                    'name': university['name']
                })
    
    # Check for duplicates
    duplicates_found = False
    for univ_id, occurrences in id_occurrences.items():
        if len(occurrences) > 1:
            duplicates_found = True
            print(f"\nDuplicate ID found: {univ_id}")
            print("Occurrences:")
            for occurrence in occurrences:
                print(f"- Country: {occurrence['country']}, University: {occurrence['name']}")
    
    if not duplicates_found:
        print("No duplicate IDs found!")
    
    # Print some statistics
    print(f"\nTotal unique IDs: {len(id_occurrences)}")
    total_universities = sum(len(country_data.get('universities', [])) for country_data in data.values())
    print(f"Total universities: {total_universities}")

if __name__ == "__main__":
    check_duplicate_ids()