import json
import os
from pathlib import Path

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

load_dotenv()

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Thrive Chatbot API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLIENTS_DIR = Path(__file__).parent / "clients"


class ChatRequest(BaseModel):
    message: str
    client_id: str
    conversation_history: list[dict] = []


class ChatResponse(BaseModel):
    response: str
    conversation_history: list[dict]


def load_client_config(client_id: str) -> dict:
    config_path = CLIENTS_DIR / f"{client_id}.json"
    if not config_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Client '{client_id}' not found. No configuration file exists for this client.",
        )
    with open(config_path) as f:
        return json.load(f)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
@limiter.limit("20/hour")
async def chat(request: Request, body: ChatRequest):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Server configuration error: missing API key.")

    config = load_client_config(body.client_id)
    system_prompt = config.get("system_prompt", "You are a helpful assistant.")

    # Build updated history with the new user message
    updated_history = list(body.conversation_history)
    updated_history.append({"role": "user", "content": body.message})

    client = anthropic.Anthropic(api_key=api_key)

    message = client.messages.create(
        model="claude-haiku-3-5-20241022",
        max_tokens=1024,
        system=system_prompt,
        messages=updated_history,
    )

    assistant_reply = message.content[0].text
    updated_history.append({"role": "assistant", "content": assistant_reply})

    return ChatResponse(response=assistant_reply, conversation_history=updated_history)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Never expose raw stack traces — always return clean JSON
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )
