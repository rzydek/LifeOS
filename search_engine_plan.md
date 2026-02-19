# Search Engine & Scraper Implementation Plan

This document outlines the implementation plan for the LifeOS Search Engine, focusing on the "Parts Sniper" functionality for the Garage MFE.

## 1. Database Schema Design (PostgreSQL)

We need to store user search configurations, manual reference data (since we aren't scraping full category trees), and the results of the scraping over time.

### Tables

1.  **`ref_categories`**
    *   Populated manually by the user (as requested).
    *   `id` (PK): Text/Int (OLX Category ID).
    *   `name`: Text (e.g., "Car Parts", "Passenger Cars").
    *   `parent_id`: To support hierarchy (optional).

2.  **`ref_locations`**
    *   Populated manually.
    *   `id` (PK): Text/Int (OLX City/Region ID).
    *   `name`: Text (e.g., "Andrychów", "Małopolskie").
    *   `type`: Enum ('city', 'region').

3.  **`search_configs`**
    *   The "Watchlist".
    *   `id` (PK): UUID.
    *   `query`: Text (e.g., "e55 amg fotel").
    *   `category_id`: FK to `ref_categories`.
    *   `location_id`: FK to `ref_locations` (Nullable).
    *   `is_active`: Boolean.
    *   `last_run_at`: Timestamp.
    *   `check_interval`: Interval (e.g., every 4 hours).

4.  **`scraped_offers`**
    *   Single source of truth for an item found.
    *   `id` (PK): UUID.
    *   `external_id`: Text (Unique ID from OLX).
    *   `search_config_id`: FK to `search_configs` (The search that found it).
    *   `title`: Text.
    *   `url`: Text.
    *   `thumbnail_url`: Text.
    *   `description`: Text (if available).
    *   `detected_at`: Timestamp.
    *   `last_seen_at`: Timestamp.
    *   `is_active`: Boolean (Set to false if not seen in recent scrapes).
    *   `ai_score`: Int (0-100, "Great Deal" probability).
    *   `ai_reasoning`: Text (Why AI thinks this is good).

5.  **`offer_price_history`**
    *   Tracks price changes.
    *   `id`: UUID.
    *   `offer_id`: FK to `scraped_offers`.
    *   `price`: Decimal.
    *   `currency`: Text.
    *   `recorded_at`: Timestamp.

## 2. Backend API (NestJS - `nest-core`)

We need endpoints for the Frontend to configure searches and view results.

*   **POST /searches**: Create a new search config.
*   **GET /searches**: List active searches.
*   **POST /ref/categories**: Manually add a known category ID.
*   **POST /ref/locations**: Manually add a known location ID.
*   **GET /offers**: List found offers (filterable by Search Config, "Great Deal" status).
*   **GET /offers/:id/history**: View price history.

## 3. Scraper Service (Python - `py-worker`)

The Python worker will act as the "Job Processor".

*   **Redis Queue Integration**:
    *   `nest-core` schedules jobs (cron or interval) and pushes a task: `{"type": "scrape", "configId": "..."}` to Redis.
    *   `py-worker` pops the task.
*   **Scraping Logic**:
    *   Uses the `OlxScraper` class we created.
    *   Fetches results.
    *   **Diffing Logic**:
        *   For each item found, check if `external_id` exists in `scraped_offers`.
        *   **New**: Insert into `scraped_offers` + `offer_price_history`.
        *   **Existing**: 
            *   Update `last_seen_at`.
            *   Compare current price with latest `offer_price_history`.
            *   If changed -> Insert new `offer_price_history` row.
            *   Mark `is_active = true`.

## 4. AI Analysis ("The Deal Rater")

This runs immediately after a *new* item is scraped or a price drop occurs.

*   **Prompt Engineering**:
    *   Context: "You are an expert car mechanic and parts trader."
    *   Input: Item Title, Price, Search Query (Context), Description (if deep scrape).
    *   Task: "Rate if this is a good deal (0-100) based on typical market value. Is it spam? Is it miscategorized?"
*   **Integration**:
    *   `py-worker` calls Ollma (Llama3/Mistral).
    *   Updates `scraped_offers` with `ai_score` and `ai_reasoning`.

## 5. Frontend UI (Angular - `mfe-garage`)

*   **Configuration View**:
    *   Form to input Search Query.
    *   Dropdowns for Category/Location (populated from `ref_` tables).
    *   "Add Manual Category" button (quick way to input ID found by user).
*   **Results Grid**:
    *   Data Table of offers.
    *   Columns: Image, Title, Price (with color coding for drops), AI Score, Last Seen.
    *   "Great Deal" badge.
    *   Link to external site.

## 6. Implementation Steps

### Step 1: Backend & DB (NestJS + Prisma)
1.  Update `schema.prisma` in `nest-core` with new tables.
2.  Run migrations.
3.  Generate Prisma client.
4.  Create `SearchService` and Controllers in `nest-core`.

### Step 2: The Bridge (Redis)
1.  Implement a Cron Service in `nest-core` (using `@nestjs/schedule`).
2.  Function to push active `search_configs` to Redis `scrape_queue` periodically.

### Step 3: Worker Implementation (Python)
1.  Update `main.py` in `py-worker` to listen to `scrape_queue`.
2.  Connect `py-worker` to PostgreSQL (using `SQLAlchemy` or `psycopg2`) to save results directly, OR send results back to NestJS via a "result_queue" (Direct DB access is usually faster for workers). *Decision: Direct DB access for Python worker for efficiency.*
3.  Implement the Diff/Save logic.

### Step 4: AI & Finishing
1.  Add `evaluate_offer()` method in Python using `langchain`/`ollama`.
2.  Build the Angular UI in `mfe-garage`.
