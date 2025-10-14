Your Health Compass is an advanced AI health assistant that delivers trustworthy, real-time answers to health-related questions.
It seamlessly combines a curated knowledge base of 200+ fact sheets with the intelligence of live web search—ensuring reliability, accuracy, and freshness.

🎥 Live Demo
https://drive.google.com/file/d/1zs8Rs9hjZZlFqazKyCqrAy7TQNYbcNSY/view?usp=sharing

Click the thumbnail above to watch the full demonstration, showcasing real-time reasoning and agentic web search capabilities.

✨ Key Features

This project showcases a multi-agent architecture that goes beyond a simple chatbot — it behaves like a reasoning AI Agent capable of decision-making and tool use.

🧩 Intelligent Architecture

Retrieval-Augmented Generation (RAG)
The system first queries a private vector database (ChromaDB) containing WHO health documents to find the most relevant, trusted data.

Agentic Decision-Making (Gemini)
Using Google Gemini 2.5 Flash, the agent decides:

🧠 Answer from Docs: When data is sufficient, it formulates a complete, factual response.

🌐 Trigger Web Search: If the topic requires fresh or missing info, it dynamically constructs a search query and invokes the web search tool.

Live Web Search (Tavily AI)
Integrated with Tavily AI, an LLM-optimized search engine that retrieves the most up-to-date medical insights and official releases.

Fact-Checked Answers with Citations
Responses are generated with inline source citations, directly linking users to the verified information sources.

Modern, Interactive UI
A sleek React (Vite) frontend featuring:

Real-time AI chat interface

Interactive document source viewer

Smooth animations and gradient canvas background for a professional user experience

🧠 Tech Stack
Category	Technology
Frontend	React (Vite), JavaScript, Axios, CSS3
Backend	Python, FastAPI
AI & ML	LLM: Google Gemini 1.5 Flash
Embeddings: all-MiniLM-L6-v2
Vector DB: ChromaDB
Agent Tool	Tavily AI (Web Search Integration)
⚙️ Setup Instructions
🔑 Prerequisites

Ensure you have the following installed:

Node.js ≥ v18

Python ≥ v3.9

API keys for:

Google Gemini

Tavily AI

1️⃣ Clone the Repository
git clone https://github.com/boddusaiganesh/Your_Health_Compass.git
cd Your_Health_Compass

2️⃣ Backend Setup
cd backend

# Create & activate virtual environment
# On Windows:
python -m venv venv
.\venv\Scripts\activate

# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt


Create a .env file inside /backend with your API keys:

GOOGLE_API_KEY="your_gemini_key_here"
TAVILY_API_KEY="your_tavily_key_here"


🧩 A pre-built ChromaDB vector database (/db) is included for immediate use.

3️⃣ Frontend Setup

In a new terminal:

cd frontend
npm install

4️⃣ Run the Application

You’ll need two terminals open simultaneously.

Terminal 1 — Backend:
cd backend
uvicorn main:app --reload

Terminal 2 — Frontend:
cd frontend
npm run dev


Open the app in your browser at:
👉 http://localhost:5173

📁 Project Structure
Your_Health_Compass/
├── backend/
│   ├── main.py
│   ├── rag_pipeline/
│   ├── db/
│   ├── .env
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md

🧬 Future Enhancements

🗣️ Voice-based query and text-to-speech responses

🧩 Integration with wearable health data APIs

📱 Mobile-friendly PWA version

🔒 Enhanced data privacy layer

👨‍💻 Author

Created by Boddu SaiGanesh Reddy

📧 boddusaiganesh81@gmail.com

💻 GitHub

⭐ If you find this project helpful, don’t forget to star the repo!
