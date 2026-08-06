from click import prompt
from groq import Groq
from app.database.config import GROQ_API_KEY, supabase

client = Groq(api_key=GROQ_API_KEY)


def generate_response(prompt: str):
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7,
        max_tokens=1024,
    )

    return completion.choices[0].message.content

supabase.table("chat_history").insert({
    "user_id": user.id,
    "question": prompt,
    "answer": response.text,
    "model": "gemini-2.5-flash"
}).execute()