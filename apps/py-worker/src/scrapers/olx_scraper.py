import requests
import json
import logging
from typing import List, Dict, Any, Optional
from src.scrapers.base_scraper import BaseScraper

logger = logging.getLogger(__name__)

class OlxScraper(BaseScraper):
    BASE_URL = "https://www.olx.pl/apigateway/graphql"
    HEADERS = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Origin": "https://www.olx.pl"
    }
    
    QUERY = """
    query ListingSearchQuery(
      $searchParameters: [SearchParameter!] = []
    ) {
      clientCompatibleListings(searchParameters: $searchParameters) {
        __typename
        ... on ListingSuccess {
          __typename
          data {
            id
            title
            url
            created_time
            last_refresh_time
            status
            location {
              city {
                name
                normalized_name
              }
              district {
                name
              }
              region {
                name
                normalized_name
              }
            }
            params {
              key
              name
              type
              value {
                ... on PriceParam {
                  value
                  currency
                  label
                }
              }
            }
            photos {
              link
            }
          }
          metadata {
            total_elements
            visible_total_count
            promoted
            search_id
          }
        }
        ... on ListingError {
          error {
            code
            detail
            status
            title
          }
        }
      }
    }
    """

    @property
    def name(self) -> str:
        return "olx"

    def search(self, query: str, **kwargs) -> Dict[str, Any]:
        
        category_id = kwargs.get('categoryId') or kwargs.get('category_id')
        city_id = kwargs.get('cityId') or kwargs.get('city_id')
        region_id = kwargs.get('regionId') or kwargs.get('region_id')
        
        radius = kwargs.get('radius') or 0
        offset = kwargs.get('offset', 0)
        limit = kwargs.get('limit', 40)

        search_params = [
            {"key": "offset", "value": str(offset)},
            {"key": "limit", "value": str(limit)},
            {"key": "query", "value": query},
            {"key": "suggest_filters", "value": "true"} # Always suggest filters
        ]

        if radius and int(radius) > 0:
             search_params.append({"key": "distance", "value": str(radius)})
        
        if category_id:
            search_params.append({"key": "category_id", "value": str(category_id)})
            
        if region_id:
            search_params.append({"key": "region_id", "value": str(region_id)})
            
        if city_id:
             search_params.append({"key": "city_id", "value": str(city_id)})

        payload = {
            "operationName": "ListingSearchQuery",
            "variables": {
                "searchParameters": search_params,
            },
            "query": self.QUERY
        }
        
        try:
            logger.info(f"Scraping OLX: {query} (Category: {category_id}, Region: {region_id}, City: {city_id})")
            response = requests.post(self.BASE_URL, json=payload, headers=self.HEADERS)
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"Scraping failed: {e}")
            return {"error": str(e)}

    def parse_results(self, raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        results = []
        if "data" not in raw_data or "clientCompatibleListings" not in raw_data["data"]:
            return results
            
        listing_data = raw_data["data"]["clientCompatibleListings"]
        if listing_data.get("__typename") != "ListingSuccess":
            return results
            
        params_list = listing_data.get("data", [])
        for item in params_list:
            price_param = next((p for p in item.get("params", []) if p.get("key") == "price"), None)
            price_val = None
            currency = None
            if price_param:
                price_data = price_param.get("value")
                if price_data:
                    price_val = price_data.get("value")
                    currency = price_data.get("currency")
            
            photos = item.get("photos", [])
            thumbnail = photos[0].get("link") if photos else None

            results.append({
                "id": item.get("id"),
                "title": item.get("title"),
                "url": item.get("url"),
                "location": item.get("location", {}).get("city", {}).get("name"),
                "price": price_val,
                "currency": currency,
                "created_time": item.get("created_time"),
                "thumbnail": thumbnail
            })
            
        return results
