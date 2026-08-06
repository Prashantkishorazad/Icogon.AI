from groq import Groq
from fastapi import HTTPException

from app.database.config import GROQ_API_KEY, supabase

client = Groq(api_key=GROQ_API_KEY)


def generate_response(prompt: str, user_id: str):

    try:
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

        answer = completion.choices[0].message.content

        supabase.table("chat_history").insert({
            "user_id": user_id,
            "question": prompt,
            "answer": answer,
            "model": "llama-3.3-70b-versatile"
        }).execute()

        return answer

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )