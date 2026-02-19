export interface SearchConfig {
  id: string;
  query: string;
  source: string;
  parameters: Record<string, any>;
  isActive: boolean;
  lastRunAt?: Date;
  checkInterval: number;
  userId: number;
  userIntent?: string;
  personaId?: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export interface Location {
  id: string;
  name: string;
  type: 'city' | 'region';
  parentId?: string;
}

export interface AiReasoning {
  score?: number;
  pros?: string[];
  cons?: string[];
  market_analysis?: string;
  summary?: { en?: string; pl?: string };
}

export interface ScrapedOffer {
  id: string;
  externalId: string;
  searchConfigId: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  detectedAt: Date;
  lastSeenAt: Date;
  isActive: boolean;
  aiScore: number;
  aiReasoning?: AiReasoning | string;
  priceHistory: OfferPriceHistory[];
}

export interface OfferPriceHistory {
  id: string;
  offerId: string;
  price: number;
  currency: string;
  recordedAt: Date;
}
