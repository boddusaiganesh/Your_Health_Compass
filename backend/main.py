# main.py - The Final, Agentic RAG Backend (v2.0)

import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import google.generativeai as genai

# NEW: Import the Tavily client for web searches
from tavily import TavilyClient

# --- INITIALIZATION ---
load_dotenv()
app = FastAPI(
    title="Agentic RAG Health API",
    description="An advanced RAG API that uses an agentic loop with web search capabilities.",
    version="2.0.0"
)

# --- CORS MIDDLEWARE ---
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION & CLIENTS ---
DB_PATH = "db"
COLLECTION_NAME = "msme_schemes"
EMBEDDING_MODEL_NAME = 'all-MiniLM-L6-v2'
GEMINI_MODEL_NAME = 'gemini-2.5-flash'

try:
    print("Initializing clients...")
    embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    db_client = chromadb.PersistentClient(path=DB_PATH)
    collection = db_client.get_collection(name=COLLECTION_NAME)
    
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    gemini_model = genai.GenerativeModel(GEMINI_MODEL_NAME)
    
    # NEW: Initialize the Tavily client for the web search tool
    tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
    
    print("All clients initialized successfully.")
except Exception as e:
    print(f"FATAL: Error during initialization: {e}")
    # Add checks for missing API keys
    if "GOOGLE_API_KEY" not in os.environ:
        print("FATAL: GOOGLE_API_KEY not found in .env file.")
    if "TAVILY_API_KEY" not in os.environ:
        print("FATAL: TAVILY_API_KEY not found in .env file.")
    exit()

# --- Pydantic Models ---
class QueryRequest(BaseModel):
    query: str

# --- THE AGENTIC LOGIC ---
@app.post("/query")
async def handle_agentic_query(request: QueryRequest):
    """
    Handles a user query using an agentic loop that decides whether to search
    the internal knowledge base or perform a live web search.
    """
    print(f"\n--- New Request ---")
    print(f"Received query: '{request.query}'")

    # --- Step 1: Internal Knowledge Base Search ---
    print("Step 1: Searching internal WHO knowledge base...")
    try:
        query_embedding = embedding_model.encode(request.query).tolist()
        local_results = collection.query(
            query_embeddings=[query_embedding],
            n_results=7, # Retrieve a few more docs for better context
            include=['metadatas', 'documents']
        )
        local_context = "\n\n---\n\n".join(doc for doc in local_results['documents'][0])
    except Exception as e:
        print(f"Error during internal search: {e}")
        raise HTTPException(status_code=500, detail="Error searching the internal knowledge base.")

    # --- Step 2: Agentic Decision Making ---
    print("Step 2: Agent deciding whether to use web search...")
    decision_prompt = f"""
    You are an expert AI health assistant. A user has asked: "{request.query}"

    I have retrieved the following information from our internal WHO knowledge base:
    ---
    {local_context if local_context else "No information found."}
    ---
    Based on this information, can you provide a comprehensive and confident answer? 
    Consider if the question is about a very recent event (e.g., "today", "this week", "2025"), a specific product/brand, or a topic clearly outside the scope of general health guidelines.

    Respond with ONLY a JSON object with two keys:
    1. "decision": must be either "ANSWER_DIRECTLY" or "SEARCH_WEB".
    2. "search_query": If your decision is "SEARCH_WEB", provide a concise and effective search query. Otherwise, this should be an empty string.
    """
    
    try:
        decision_response = gemini_model.generate_content(decision_prompt)
        # Clean the response to ensure it's valid JSON
        cleaned_json_string = decision_response.text.strip().replace('```json', '').replace('```', '').strip()
        decision_json = json.loads(cleaned_json_string)
        decision = decision_json.get("decision")
        search_query = decision_json.get("search_query")
        print(f"Agent Decision: {decision}. Search Query: '{search_query}'")
    except Exception as e:
        print(f"Error during agent decision making: {e}. Defaulting to direct answer.")
        decision = "ANSWER_DIRECTLY" # Failsafe

    # --- Step 3a: Answer Directly from Internal Documents ---
    if decision == "ANSWER_DIRECTLY":
        print("Step 3a: Answering directly from documents.")
        answer_prompt = f"""
        You are 'Your Health Compass,' a knowledgeable and empathetic AI health guide. Your role is to synthesize information from the provided trusted documents to answer the user's question.

        CRITICAL INSTRUCTION: Begin your answer directly and conversationally. Do not start your response with phrases like "According to the documents" or "Based on the provided information". Get straight to the point.

        For example, if the user asks "What are the symptoms of malaria?", a good start would be "The main symptoms of malaria typically include:".

        DOCUMENTS:
        {local_context}

        USER'S QUESTION: {request.query}
        """
        final_answer_response = gemini_model.generate_content(answer_prompt)
        
        # Prepare sources with the 'document' type for the frontend
        sources_with_metadata = []
        for doc, meta in zip(local_results['documents'][0], local_results['metadatas'][0]):
            sources_with_metadata.append({"content": doc, "metadata": {**meta, "type": "document"}})
            
        return {"answer": final_answer_response.text, "retrieved_sources_with_metadata": sources_with_metadata}

    # --- Step 3b: Use the Web Search Tool ---
    else: # decision == "SEARCH_WEB"
        print(f"Step 3b: Performing web search with query: '{search_query}'")
        try:
            # Step 4: Execute the web search
            search_results = tavily_client.search(query=search_query, search_depth="basic", max_results=5)
            web_context = "\n\n---\n\n".join([f"Source {i+1} URL: {res['url']}\nContent: {res['content']}" for i, res in enumerate(search_results['results'])])
            
            # Step 5: Final Synthesis with Web Context
            print("Step 5: Synthesizing final answer with web context.")
            final_prompt = f"""
            You are an expert AI health assistant. A user asked: "{request.query}"
            Your internal knowledge was insufficient, so you performed a web search.
            
            Based ONLY on the following web search results, provide a clear, comprehensive, and well-formatted answer using Markdown.
            
            CRITICAL INSTRUCTION: For every piece of information or claim in your answer, you MUST cite the relevant source number. The citation must be a Markdown link formatted exactly as `[Source X]`, where X is the number corresponding to the source URL.
            
            For example:
            - "The Sabin Vaccine Institute launched a Phase 2 trial [Source 1]."
            - "This was considered critical due to growing outbreaks [Source 3]."
            - "Multiple candidates are in trials [Source 1][Source 3]."

            Do not use parentheses for the URL; the frontend will handle it. Just use the `[Source X]` format.
            WEB SEARCH RESULTS:
            {web_context}
            """
            final_answer_response = gemini_model.generate_content(final_prompt)
            
            # Prepare sources with the 'web' type for the frontend
            web_sources = []
            for result in search_results['results']:
                web_sources.append({
                    "content": result['content'],
                    "metadata": {
                        "source": result['url'], # The URL is the source
                        "title": result['title'],
                        "type": "web"
                    }
                })

            return {"answer": final_answer_response.text, "retrieved_sources_with_metadata": web_sources}

        except Exception as e:
            print(f"Error during web search or final synthesis: {e}")
            raise HTTPException(status_code=500, detail="An error occurred during the web search process.")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Agentic RAG Health API (v2.0)"}