
import time
import openai

MAX_REQUESTS_PER_MIN = 20 
DELAY = 60 / MAX_REQUESTS_PER_MIN
def llm_rate_limiter(func):
    def wrapper(*args, **kwargs):
        time.sleep(DELAY)  # delay each call
        for attempt in range(5):
            try:
                return func(*args, **kwargs)
            except openai.RateLimitError:
                wait = 2 ** attempt
                print(f"Rate limit reached. Retrying in {wait}s ...")
                time.sleep(wait)
        raise Exception("Failed after multiple retries.")
    return wrapper

