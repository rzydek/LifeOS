import sys
import os

# Ensure src is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.scrapers.olx_scraper import OlxScraper
import logging

logging.basicConfig(level=logging.INFO)

def test_scraper():
    scraper = OlxScraper()
    
    test_cases = [
        {"query": "e55 amg fotel", "category_id": "82"}, # Broad search for comparison
        {"query": "e55 amg fotel", "category_id": "82", "region_id": "4", "city_id": "1839"},
    ]
    
    for case in test_cases:
        print(f"\n--- Testing Query: {case} ---")
        
        response_json = scraper.search(
            query=case["query"],
            category_id=case.get("category_id"),
            region_id=case.get("region_id"),
            city_id=case.get("city_id")
        )
        
        # Manually extract total count to log it
        total_elements = "N/A"
        try:
            total_elements = response_json["data"]["clientCompatibleListings"]["metadata"]["total_elements"]
        except (KeyError, TypeError) as e:
            if "errors" in response_json:
                print(f"GraphQL Errors: {response_json['errors']}")
            else:
                print(f"Failed to extract total elements: {e}")
        
        print(f"Total Elements Found: {total_elements}")
        
        # Parse and list items
        parsed_results = scraper.parse_results(response_json)
        for item in parsed_results[:5]: # Show top 5
             price_str = f"{item['price']} {item['currency']}" if item['price'] else "Price on request"
             print(f"- {item['title']} | {price_str} | {item['location']}")

if __name__ == "__main__":
    test_scraper()
