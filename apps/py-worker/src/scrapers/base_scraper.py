from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseScraper(ABC):
    @abstractmethod
    def search(self, query: str, **kwargs) -> Dict[str, Any]:
        """
        Perform a search and return raw results.
        :param query: Search query string
        :param kwargs: Additional search parameters (e.g. category_id, region_id, filters)
        """
        pass

    @abstractmethod
    def parse_results(self, raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Parse raw results into a normalized list of dictionaries.
        Expected keys in returned dicts: id, title, url, price, currency, location, thumbnail, created_time
        """
        pass
    
    @property
    @abstractmethod
    def name(self) -> str:
        """
        Return the unique name of the scraper (e.g., 'olx', 'ebay').
        """
        pass
