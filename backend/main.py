import os
import argparse
import sys

# 1. Parse Args and Set Env Vars BEFORE importing app components
# We check sys.argv directly or use a partial parser to set envs before imports.
# This ensures 'app.config' picks up the correct values.
if __name__ == "__main__":
    parser = argparse.ArgumentParser(add_help=False) # Helper parser
    parser.add_argument("--gemini-key")
    parser.add_argument("--model", help="Gemini Model Name (default: gemini-2.5-pro)")
    # Parse known args only, ignore uvicorn args or others if any
    args, _ = parser.parse_known_args()
    
    if args.gemini_key:
        os.environ["GEMINI_API_KEY"] = args.gemini_key
    if args.model:
        os.environ["GEMINI_MODEL"] = args.model

# 2. Imports (Now Safe)
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import generation

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CadQuery GenAI Server")

# CORS (Allow Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Generated Static Files
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include Router
app.include_router(generation.router)

# Mount Frontend Build
if os.path.exists("../frontend/dist"):
    app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="frontend")
else:
    @app.get("/")
    def read_root():
        return {"message": "Frontend build not found. Please run 'npm run build' in frontend/ and restart."}

# 3. Main Entry
def main():
    # We already parsed args for env vars above.
    # We can just run the server.
    import uvicorn
    # Use 'main:app' (reload=False usually for prod) or pass app object directly
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    main()

