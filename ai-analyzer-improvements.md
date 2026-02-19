# AI Analyzer Improvements

This document outlines the planned improvements for the AI Analyzer component in the `lifeOS` system, specifically within the `py-worker` service.

## 1. Enhanced Prompt Engineering & User Intent

**Current State:**
The current implementation uses a hardcoded prompt that combines the search query with a fixed persona ("expert car mechanic"). The relevance scoring is based primarily on how well the item matches the search query string.

**Problem:**
A search query (e.g., "r129 hardtop") is often too simple to capture the user's full intent. It doesn't convey constraints like specific part numbers, condition (new vs used), acceptable price range, or "nice-to-have" features versus "must-haves".

**Proposed Solution:**
*   **Split "Search Query" from "User Intent":**
    *   **Search Query:** The string sent to the external service (e.g., eBay, OLX).
    *   **User Intent / Analysis Context:** A detailed description of what the user is actually looking for.
*   **Structured Requirements:** Allow the user to define specific parameters for the AI to evaluate:
    *   **Target Price:** "Typical price is X, looking for deals under Y".
    *   **Condition:** "Must be new" or "Used is okay if perfect condition".
    *   **Specifics:** Part numbers, colors, dimensions.
    *   **Negative Constraints:** "Ignore broken items", "No UK versions".

**Implementation Plan:**
*   Update the `Watch` entity to include fields for `analysis_prompt` or `user_intent`.
*   Update the `AIService` prompt template to ingest this new context.

## 2. Configurable "Experts" (System Prompts)

**Current State:**
The system prompt is hardcoded: *"You are an expert car mechanic and parts trader specializing in Mercedes AMG and Jeep..."*.

**Problem:**
This limits the tool to car parts. If a user wants to search for rare books, vintage audio equipment, or real estate, the current "expert" persona is irrelevant or even detrimental.

**Proposed Solution:**
*   **Expert Profiles:** create a library of system prompts (personas).
    *   *Car Mechanic*
    *   *Real Estate Agent*
    *   *Book Collector*
    *   *General Bargain Hunter*
*   **UI Configuration:** Allow the user to select an "Expert Profile" when creating a Watch/Search.
*   **Custom Prompts:** Advanced users can write their own system prompt to tailor the AI's personality and expertise.

**Implementation Plan:**
*   Extract the system prompt into a configurable variable.
*   Store available personas in a configuration file or database.
*   Pass the selected persona to the `AIService` during evaluation.

## 3. Architecture for Model Switching (Local vs. Cloud)

**Current State:**
The `AIService` is tightly coupled to `langchain_community.chat_models.ChatOllama`. It assumes a local Ollama instance is running.

**Problem:**
*   **Quality:** Local models (like Llama 3 8B) can struggle with complex reasoning or specific language nuances (translations).
*   **Flexibility:** Users cannot easily switch to more powerful cloud models (OpenAI GPT-4, Anthropic Claude) or other local backends (LM Studio, vLLM) without changing code.

**Proposed Solution:**
*   **Abstract Base Class:** Create an `LLMProvider` interface.
*   **Implementations:**
    *   `OllamaProvider`: Existing logic for local Ollama.
    *   `OpenAIProvider`: Support for GPT models (requires API key).
*   **Configuration Strategy:**
    *   Use environment variables or a config file to define the `ACTIVE_PROVIDER`.
    *   Allow per-watch overrides (e.g., use GPT-4 for high-value watches, local Llama for general spam filtering).

**Implementation Plan:**
*   Refactor `AIService` to depend on an abstraction rather than `ChatOllama`.
*   Implement a factory pattern to instantiate the correct provider based on configuration.

## 4. Other Proposed Improvements

*   **Feedback Loop / "Few-Shot" Learning:**
    *   Allow the user to "correct" the AI's score in the UI (e.g., "This was actually a good deal, you marked it as spam").
    *   Include these positive/negative examples in future prompts to train the specific "Watch" agent.
*   **Multi-Step Reasoning (Chain of Thought):**
    *   Instead of asking for a score immediately, ask the model to first list pros and cons, then compare price to market average, and *then* assign a score. This usually improves accuracy for smaller models.
*   **Structured Data Extraction:**
    *   Ask the AI to extract specific fields (Part Number, VIN, Condition) into a JSON structure, not just a text summary. This allows for better filtering and sorting in the UI.
