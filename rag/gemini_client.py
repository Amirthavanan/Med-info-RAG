from google import genai
from google.genai import types
from .config import GEMINI_API_KEY, GENERATION_MODEL

_client = None

def get_client():
    global _client
    if _client is None:
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is missing. Create a .env file.")
        _client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options=types.HttpOptions(timeout=15000)
        )
    return _client

def embed_text(text):
    from .embeddings import embed_text as _st_embed
    return _st_embed(text)

def generate_text(prompt):
    models_to_try = [
        GENERATION_MODEL,
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash",
        "gemini-3.8-flash",
        "gemini-flash-latest"
    ]
    seen = set()
    unique_models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]
    last_err = None
    for m in unique_models:
        try:
            response = get_client().models.generate_content(
                model=m,
                contents=prompt
            )
            if response.text and response.text.strip():
                return response.text
        except Exception as e:
            last_err = e
            continue
    if last_err:
        raise last_err
    return "No response could be generated."
