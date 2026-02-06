from google import genai
from ..config import settings

SYSTEM_PROMPT = """
You are a CadQuery expert. Your goal is to generate Python code using the CadQuery library to create 3D models based on user requests.
Rules:
1. Output ONLY valid Python code. No markdown backticks, no explanations.
2. The code MUST create a variable named `result` which contains the final CadQuery object (Workplane or Assembly) to be displayed.
3. Assume `import cadquery as cq` is already present. You can use it.
4. Do not use `show_object` or `debug` functions.
5. If the user asks for a modification, the history will be provided. Generate the complete updated code, not just the diff.
6. Keep the design parametric if possible, using variables at the top.
"""

class GeminiService:
    def __init__(self):
        self.client = None

    def _get_client(self):
        if not self.client:
            # Re-read key from setting/env to ensure it's picked up after main.py execution
            # Note: settings might be cached, so we check env var fallback or rely on mutable settings if possible.
            # But settings is Pydantic. Let's try to read from settings, assuming settings might need refresh or we access os.environ directly if settings is stale.
            import os
            key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
            if not key:
                # Can't init properly without key
                raise ValueError("Gemini API Key not found. Please provide it via --gemini-key or GEMINI_API_KEY env var.")
            self.client = genai.Client(api_key=key)
        return self.client

    async def generate_code(self, prompt: str, history: list = None) -> str:
        client = self._get_client()
        
        # Note: The new SDK manages chat slightly differently or implies using generate_content with history context
        # For simplicity in this migration, we'll construct the prompt or use the chat feature if available.
        # The new SDK has client.chats.create()
        
        chat_history = []
        
        if history:
            for entry in history:
                # Map roles: 'user' -> 'user', 'model' -> 'model'
                role = "user" if entry['role'] == 'user' else "model"
                chat_history.append(genai.types.Content(role=role, parts=[genai.types.Part(text=entry['content'])]))
        
        if chat_history:
            print(f"--- [DEBUG] History: {len(chat_history)} messages ---")

        print(f"--- [DEBUG] Prompt sent to Gemini ({settings.GEMINI_MODEL}) ---\n{prompt}\n------------------------------------------------")
        
        chat = client.chats.create(
            model=settings.GEMINI_MODEL,
            config=genai.types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT
            ),
            history=chat_history
        )
        
        response = chat.send_message(prompt)
        print(f"--- [DEBUG] Response from Gemini ---\n{response.text}\n----------------------------------")
        
        # Cleaning response to ensure just code
        code = response.text
        if not code:
            return ""
            
        if code.startswith("```python"):
            code = code[9:]
        if code.startswith("```"):
            code = code[3:]
        if code.endswith("```"):
            code = code[:-3]
            
        return code.strip()

gemini_service = GeminiService()
