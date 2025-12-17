import os
import dotenv
dotenv.load_dotenv()
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY_TEST")
from langchain_groq import ChatGroq

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    # other params...
)

if __name__ == "__main__":
    messages = [
    (
        "system",
        "You are a helpful assistant that translates English to French. Translate the user sentence.",
    ),
    ("human", "I love programming."),
]
    ai_msg = llm.invoke(messages)
    print(ai_msg.content)