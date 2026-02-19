from sqlalchemy import String, Integer, DateTime, Boolean, DECIMAL, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from datetime import datetime
from uuid import uuid4
from typing import List, Optional

class Base(DeclarativeBase):
    pass

class SearchConfig(Base):
    __tablename__ = 'SearchConfig'
    id: Mapped[str] = mapped_column(String, primary_key=True)

class ScrapedOffer(Base):
    __tablename__ = 'ScrapedOffer'
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    externalId: Mapped[str] = mapped_column("externalId", String, nullable=False)
    searchConfigId: Mapped[str] = mapped_column("searchConfigId", String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    url: Mapped[str] = mapped_column(String, nullable=False)
    thumbnailUrl: Mapped[Optional[str]] = mapped_column("thumbnailUrl", String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    detectedAt: Mapped[datetime] = mapped_column("detectedAt", DateTime, default=datetime.utcnow)
    lastSeenAt: Mapped[datetime] = mapped_column("lastSeenAt", DateTime, default=datetime.utcnow)
    isActive: Mapped[bool] = mapped_column("isActive", Boolean, default=True)
    aiScore: Mapped[Optional[int]] = mapped_column("aiScore", Integer, nullable=True)
    aiReasoning: Mapped[Optional[str]] = mapped_column("aiReasoning", String, nullable=True)
    
    priceHistory: Mapped[List["OfferPriceHistory"]] = relationship("OfferPriceHistory", back_populates="offer", cascade="all, delete-orphan")

class OfferPriceHistory(Base):
    __tablename__ = 'OfferPriceHistory'
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    offerId: Mapped[str] = mapped_column("offerId", String, ForeignKey('ScrapedOffer.id'), nullable=False)
    price: Mapped[float] = mapped_column(DECIMAL, nullable=False)
    currency: Mapped[str] = mapped_column(String, nullable=False)
    recordedAt: Mapped[datetime] = mapped_column("recordedAt", DateTime, default=datetime.utcnow)
    offer: Mapped["ScrapedOffer"] = relationship("ScrapedOffer", back_populates="priceHistory")
