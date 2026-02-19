from typing import Dict, Type
from src.scrapers.base_scraper import BaseScraper
from src.scrapers.olx_scraper import OlxScraper

class ScraperFactory:
    _scrapers: Dict[str, Type[BaseScraper]] = {}

    @classmethod
    def register_scraper(cls, name: str, scraper_cls: Type[BaseScraper]):
        cls._scrapers[name.lower()] = scraper_cls

    @classmethod
    def get_scraper(cls, name: str) -> BaseScraper:
        scraper_cls = cls._scrapers.get(name.lower())
        if not scraper_cls:
            raise ValueError(f"No scraper found for '{name}'")
        return scraper_cls()

    @classmethod
    def get_supported_scrapers(cls):
        return list(cls._scrapers.keys())

# Register known scrapers
ScraperFactory.register_scraper("olx", OlxScraper)
