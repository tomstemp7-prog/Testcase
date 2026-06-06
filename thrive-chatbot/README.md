# Thrive London Chatbot

A production-ready AI chatbot service for Thrive London, built with FastAPI and the Anthropic API. Includes an embeddable JavaScript widget for any website.

---

## Local Setup

```bash
# 1. Clone and enter the project
git clone <your-repo-url>
cd thrive-chatbot

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Add your API key
cp .env.example .env
# Open .env and replace "your_key_here" with your actual Anthropic API key

# 5. Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

---

## Testing the /chat Endpoint

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What coffee machines do you offer for a team of 50?",
    "client_id": "thrive",
    "conversation_history": []
  }'
```

Expected response shape:

```json
{
  "response": "...",
  "conversation_history": [...]
}
```

Health check:

```bash
curl http://localhost:8000/health
# {"status":"ok"}
```

---

## Embedding the Widget

Add one script tag to any website's `<body>`:

```html
<script
  src="https://your-api-url.com/widget.js"
  data-client="thrive"
  data-api="https://your-api-url.com">
</script>
```

**Attributes:**

| Attribute    | Required | Description                                      |
|--------------|----------|--------------------------------------------------|
| `data-client`| Yes      | Client ID matching the JSON file in `clients/`   |
| `data-api`   | Yes      | Base URL of your deployed FastAPI backend        |
| `data-color` | No       | Override the primary brand colour (hex)          |

The widget is self-contained — no external CSS or JS libraries required.

---

## Deploying to Railway

1. Push this repo to GitHub.
2. Go to [railway.app](https://railway.app) and click **New Project → Deploy from GitHub repo**.
3. Select your repository. Railway will detect the Python project automatically.
4. In **Variables**, add:
   - `ANTHROPIC_API_KEY` — your Anthropic API key
   - `PORT` — Railway sets this automatically; no action needed
5. In **Settings → Deploy**, set the start command to:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
6. Click **Deploy**. Railway will install `requirements.txt` and start the server.
7. Copy the generated public URL (e.g. `https://thrive-chatbot-production.up.railway.app`).
8. Update your `<script>` tag's `data-api` attribute to this URL.

---

## Adding a New Client

1. Copy the Thrive config as a template:
   ```bash
   cp clients/thrive.json clients/newclient.json
   ```
2. Edit `clients/newclient.json` — update `client_id`, `business_name`, `primary_color`, and `system_prompt` to match the new client.
3. Embed the widget on their site using `data-client="newclient"`.

No server restart is needed — client configs are loaded per request.

---

## Rate Limiting

The `/chat` endpoint allows **20 requests per IP per hour**. Requests beyond this limit receive a `429 Too Many Requests` response.

---

## Project Structure

```
thrive-chatbot/
├── main.py              # FastAPI app
├── requirements.txt     # Python dependencies
├── .env.example         # API key template
├── .gitignore
├── clients/
│   └── thrive.json      # Thrive London client config
├── widget.js            # Embeddable chat widget
└── README.md
```
